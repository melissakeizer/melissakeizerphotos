import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveDraft, restoreDraft, migrateLegacy, changeDraft, exportPrompt, planWarnings } from '../src/lib/photostream-planner.mjs';
import { photoShape, photoFitsRow } from '../src/lib/photo-shape.mjs';
import { uploadPhotoForBrowser } from './photostream-upload-store.mjs';

const catalog = Object.fromEntries(['a','b','c','d','e','f'].map((image, i) => [image, { image, title: image.toUpperCase(), date: `202${i}-01-01`, shape: ['c','f'].includes(image) ? 'landscape' : 'portrait' }]));
const source = { pages: [['a','b','c'], ['d','e']], questions: [{ id: 'start', beforeImage: 'd', label: 'Origins', questions: ['Why photography?'] }] };
const placed = draft => draft.pages.flatMap(page => page.rows.flatMap(row => row.photos?.filter(Boolean) || []));
function integrity(draft) {
  const images = [...placed(draft), ...draft.waiting];
  assert.equal(images.length, new Set(images).size, 'each photo has exactly one location');
  assert.deepEqual([...images].sort(), Object.keys(catalog).sort(), 'nothing lost');
  for (const page of draft.pages) for (const row of page.rows) if (row.photos) {
    assert.equal(row.photos.length, row.kind === 'pair' ? 2 : 1);
    for (const image of row.photos.filter(Boolean)) assert.equal(catalog[image].shape, row.kind === 'pair' ? 'portrait' : 'landscape');
  }
}

test('initial draft matches actual page boundaries, complete rows and Q&A placement', () => {
  const draft = liveDraft(source, catalog);
  assert.deepEqual(draft.pages.map(page => page.rows.flatMap(row => row.photos?.filter(Boolean) || [])), source.pages);
  assert.deepEqual(draft.pages[0].rows.map(row => row.kind), ['pair','landscape']);
  assert.equal(draft.pages[1].rows[0].sourceId, 'start');
  assert.deepEqual(draft.waiting, ['f']); integrity(draft);
});
test('replacing from another page parks displaced photo, leaves empty source slot and never swaps', () => {
  const initial = liveDraft(source, catalog), row = initial.pages[0].rows[0];
  const next = changeDraft(initial, { type: 'place-photo', image: 'd', pageId: 'page-1', rowId: row.id, slot: 0 }, catalog);
  assert.deepEqual(next.pages[0].rows[0].photos, ['d','b']);
  assert.deepEqual(next.pages[1].rows[1].photos, [null,'e']);
  assert.ok(next.waiting.includes('a')); assert.deepEqual(initial.pages[0].rows[0].photos, ['a','b']); integrity(next);
});
test('removing and replacing photos is reversible without deleting identities', () => {
  let draft = liveDraft(source, catalog);
  draft = changeDraft(draft, { type: 'wait-photo', image: 'a' }, catalog);
  assert.equal(draft.pages[0].rows[0].photos[0], null);
  draft = changeDraft(draft, { type: 'place-photo', image: 'a', pageId: 'page-1', rowId: draft.pages[0].rows[0].id, slot: 0 }, catalog);
  assert.ok(!draft.waiting.includes('a')); integrity(draft);
});
test('landscapes cannot occupy portrait slots and invalid drops never detach their source', () => {
  const draft = liveDraft(source, catalog);
  assert.equal(changeDraft(draft, { type: 'place-photo', image: 'c', pageId: 'page-1', rowId: draft.pages[0].rows[0].id, slot: 0 }, catalog), draft);
  assert.equal(changeDraft(draft, { type: 'place-photo', image: 'a', pageId: 'page-1', rowId: draft.pages[0].rows[0].id, slot: 9 }, catalog), draft);
});
test('square and near-square images are compatible with either row type, without loosening portrait/landscape rules', () => {
  assert.equal(photoShape(1500, 1500), 'square');
  assert.equal(photoShape(950, 1000), 'square');
  assert.equal(photoShape(1000, 950), 'square');
  assert.equal(photoShape(800, 1000), 'portrait');
  assert.equal(photoShape(1500, 1000), 'landscape');
  for (const kind of ['pair', 'landscape']) assert.equal(photoFitsRow({ shape: 'square' }, kind), true);
  assert.equal(photoFitsRow({ shape: 'portrait' }, 'landscape'), false);
  assert.equal(photoFitsRow({ shape: 'landscape' }, 'pair'), false);
  assert.equal(photoFitsRow({ shape: 'square' }, 'qa'), false);
});
test('square photo can be placed into either existing slot and survive reload without moving other rows', () => {
  const extended = { ...catalog, vizsla: { image: 'vizsla', title: 'Vizsla', shape: 'square' } };
  for (const kind of ['pair', 'landscape']) {
    const draft = liveDraft(source, extended);
    const row = draft.pages[0].rows.find(row => row.kind === kind);
    const result = changeDraft(draft, { type: 'place-photo', image: 'vizsla', pageId: 'page-1', rowId: row.id, slot: 0 }, extended);
    assert.equal(result.pages[0].rows.find(r => r.id === row.id).photos[0], 'vizsla');
    assert.deepEqual(restoreDraft(result, extended), result);
    assert.equal(draft.pages[0].rows.find(r => r.id === row.id).photos[0], row.photos[0]);
    assert.equal(result.pages.length, draft.pages.length);
  }
});
test('old upload records classify square photos without changing stored metadata or identity', () => {
  const original = { id: 'vizsla', image: 'upload:vizsla', shape: 'landscape', width: 1500, height: 1500 };
  const browser = uploadPhotoForBrowser(original);
  assert.equal(browser.shape, 'square');
  assert.equal(browser.image, original.image);
  assert.equal(original.shape, 'landscape');
});
test('insert above, between and below rows; add a page and keep an explicit incomplete pair', () => {
  let draft = changeDraft(liveDraft(source, catalog), { type: 'add-page' }, catalog);
  const pageId = draft.pages[2].id;
  draft = changeDraft(draft, { type: 'insert-photo', image: 'f', pageId, index: 0 }, catalog);
  draft = changeDraft(draft, { type: 'insert-row', kind: 'pair', pageId, index: 0 }, catalog);
  draft = changeDraft(draft, { type: 'place-photo', image: 'a', pageId, rowId: draft.pages[2].rows[0].id, slot: 0 }, catalog);
  draft = changeDraft(draft, { type: 'insert-row', kind: 'qa', pageId, index: 1 }, catalog);
  assert.deepEqual(draft.pages[2].rows.map(row => row.kind), ['pair','qa','landscape']);
  assert.ok(planWarnings(draft).length); integrity(draft);
});
test('move whole rows across pages and within the same page without off-by-one errors', () => {
  let draft = liveDraft(source, catalog);
  const rowId = draft.pages[0].rows[0].id;
  draft = changeDraft(draft, { type: 'move-row', rowId, pageId: 'page-1', index: 2 }, catalog);
  assert.equal(draft.pages[0].rows[1].id, rowId);
  draft = changeDraft(draft, { type: 'move-row', rowId, pageId: 'page-2', index: 0 }, catalog);
  assert.equal(draft.pages[1].rows[0].id, rowId); integrity(draft);
});
test('removed Q&A keeps its questions and private notes and can be restored on another page', () => {
  let draft = liveDraft(source, catalog), qa = draft.pages[1].rows[0]; qa.notes = 'Talk about Matisse';
  draft = changeDraft(draft, { type: 'remove-row', rowId: qa.id, pageId: 'page-2' }, catalog);
  assert.equal(draft.parkedQa[0].notes, 'Talk about Matisse');
  draft = changeDraft(draft, { type: 'move-row', rowId: qa.id, pageId: 'page-1', index: 1 }, catalog);
  assert.equal(draft.pages[0].rows[1].notes, 'Talk about Matisse'); assert.equal(draft.parkedQa.length, 0); integrity(draft);
});
test('reload preserves page boundaries, notes and empty slots; new photos wait instead of resetting', () => {
  const draft = liveDraft(source, catalog); draft.pages[0].rows[0].photos[0] = null; draft.waiting.push('a'); draft.pages[1].rows[0].notes = 'Remember this';
  const newer = { ...catalog, new: { image: 'new', shape: 'landscape' } };
  const restored = restoreDraft(JSON.parse(JSON.stringify(draft)), newer);
  assert.deepEqual(restored.pages, draft.pages); assert.ok(restored.waiting.includes('new'));
});
test('older browser draft migrates automatically without source-signature reset', () => {
  const migrated = migrateLegacy({ version: 1, sourceSignature: 'old', ids: ['photo:c','qa:start','photo:b','photo:a'], topics: { 'qa:start': 'My topic' }, removedPhotos: ['photo:d'] }, catalog, source);
  assert.deepEqual(placed(migrated), ['c','b','a']); assert.equal(migrated.pages[0].rows[1].topic, 'My topic'); assert.ok(migrated.waiting.includes('d')); integrity(migrated);
});
test('malformed draft is rejected, not silently replaced or duplicated', () => {
  const draft = liveDraft(source, catalog); draft.pages[0].rows[0].photos = ['a','a'];
  assert.throws(() => restoreDraft(draft, catalog), /Duplicate/);
  assert.throws(() => restoreDraft({ version: 0 }, catalog));
});
test('older saved Q&A can recover questions even when that block is hidden on the live feed', () => {
  const extended = { ...source, questionCatalog: [...source.questions, { id: 'hidden', label: 'Hidden topic', questions: ['A real question?'] }] };
  const migrated = migrateLegacy({ version: 1, ids: ['qa:hidden','photo:a','photo:b'] }, catalog, extended);
  assert.deepEqual(migrated.pages[0].rows[0].questions, ['A real question?']);
  assert.equal(migrated.pages[0].rows[0].sourceId, 'hidden');
  assert.equal(liveDraft(extended, catalog).pages.flatMap(p => p.rows).filter(r => r.kind === 'qa').length, 1);
});
test('prompt includes exact pages, filenames, question text, notes and waiting area', () => {
  const draft = liveDraft(source, catalog); draft.pages[1].rows[0].notes = 'My editorial reminder';
  const prompt = exportPrompt(draft, catalog);
  for (const text of ['PAGE 1','PAGE 2','Portrait pair: [a]','Why photography?','My editorial reminder','WAITING','- f','Structured plan:']) assert.ok(prompt.includes(text), text);
  assert.deepEqual(JSON.parse(prompt.split('Structured plan:\n')[1]), draft);
});
test('repeated replacements and moves never lose or duplicate photos', () => {
  let draft = liveDraft(source, catalog);
  for (let i = 0; i < 100; i++) {
    const image = Object.keys(catalog)[i % 6];
    draft = changeDraft(draft, { type: 'wait-photo', image }, catalog);
    draft = changeDraft(draft, { type: 'insert-photo', image, pageId: draft.pages[i % draft.pages.length].id, index: 0 }, catalog);
    integrity(draft);
  }
});
