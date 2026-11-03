import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { resolvePhotoStreamPlan } from '../src/lib/photo-stream-plan.mjs';
import { liveDraft, restoreDraft } from '../src/lib/photostream-planner.mjs';
import { photoShape, photoFitsRow } from '../src/lib/photo-shape.mjs';
import { photoStreamLocations, photoStreamAnchor } from '../src/lib/photo-stream-links.ts';
import { allPhotoStreamQuestions } from '../src/lib/photo-stream-questions.ts';

const plan = JSON.parse(await readFile(new URL('../src/data/photo-stream-plan.json', import.meta.url)));
const imports = JSON.parse(await readFile(new URL('../src/data/photo-stream-imports.json', import.meta.url)));
const original = JSON.parse(await readFile(new URL('../.local/photostream-plan-review/requested-plan.json', import.meta.url)).catch(() => 'null'));
const images = plan.pages.flatMap(page => page.rows.flatMap(row => row.photos || []));
const notes = images.map(image => imports.find(note => note.image === image) || { image });
const qa = [
  allPhotoStreamQuestions.find(block => block.id === 'lake-garda'),
  allPhotoStreamQuestions.find(block => block.id === 'dogs'),
  { id: 'pictures', items: [{ answer: 'Matisse.' }, { answer: 'Sony.' }] },
];

test('public plan keeps explicit two-page boundaries, full rows and no duplicate photos', () => {
  const result = resolvePhotoStreamPlan(plan, notes, qa);
  assert.deepEqual(result.pages.map(page => page.length), [21, 18]);
  assert.equal(new Set(images).size, 39);
  assert.equal(imports.length, 17);
  for (const page of plan.pages) for (const row of page.rows) if (row.photos) {
    assert.equal(row.photos.length, row.kind === 'pair' ? 2 : 1);
    assert.ok(row.photos.every(Boolean));
  }
  if (original) {
    const aliases = new Map(imports.map(note => [note.sourceUploadId, note.image]));
    aliases.set('dd6062e3-a015-4710-b204-ed903a74923c-1-102-o-0ee9a098.jpg', 'exploris-shots--15.jpg');
    for (const note of imports) if (note.image === 'dd6062e3-a015-4710-b204-ed903a74923c-1-102-o-0ee9a098.jpg') aliases.set(note.sourceUploadId, 'exploris-shots--15.jpg');
    assert.deepEqual(result.pages.map(page => page.map(note => note.image)), original.pages.slice(0, 2).map(page => page.rows.flatMap(row => row.photos || []).filter(Boolean).map(image => aliases.get(image) || image)));
  }
});

test('original Exploris seal replaces only the second Audi photo', () => {
  assert.deepEqual(plan.pages[0].rows[1].photos, ['auditt.jpg', 'exploris-shots--15.jpg']);
  assert.ok(!images.includes('dd6062e3-a015-4710-b204-ed903a74923c-1-102-o-0ee9a098.jpg'));
  assert.ok(imports.some(note => note.image === 'dd6062e3-a015-4710-b204-ed903a74923c-1-102-o-0ee9a098.jpg'), 'removed photo retained in the library');
});

test('Vizsla remains beside Toller in a pair, with square sources accepted in either slot type', async () => {
  const vizsla = imports.find(note => note.image === 'dog-show-sept-2015-1-4-copy-21a8269d.jpg');
  const toller = imports.find(note => note.image === 'dog-show-2024-7-e445c75f.jpg');
  const row = plan.pages[0].rows.find(row => row.photos?.includes(vizsla.image));
  assert.equal(row.kind, 'pair');
  assert.deepEqual(row.photos, [vizsla.image, toller.image]);
  const { width, height } = await sharp(new URL(`../public/photos/00-photostream/${vizsla.image}`, import.meta.url).pathname).metadata();
  const shape = photoShape(width, height);
  assert.equal(shape, 'square');
  assert.ok(photoFitsRow({ shape }, 'pair'));
  assert.ok(photoFitsRow({ shape }, 'landscape'));
  assert.ok(!resolvePhotoStreamPlan(plan, notes, qa).landscapeImages.has(vizsla.image));
});

test('Q&A follows its planned location and keeps all existing answer text', () => {
  const result = resolvePhotoStreamPlan(plan, notes, qa);
  const dogs = [...result.questionsByImage.values()].flat().find(block => block.id === 'dogs');
  assert.deepEqual(dogs.items, allPhotoStreamQuestions.find(block => block.id === 'dogs').items);
  assert.equal(dogs.layout, 'staggered');
  assert.deepEqual(dogs.items.map(item => item.question), ['How did you get into dog shows?', 'What are your favourite breeds?']);
  assert.equal(dogs.items.length, 2);
  for (const detail of ['14', 'auntie', 'Pokédex']) assert.ok(dogs.items[0].answer.includes(detail));
  assert.ok(!dogs.items[0].answer.includes('conformation'));
  for (const breed of ['Australian Shepherds', 'Hovawarts', 'Nova Scotia Duck Tolling Retrievers', 'Flat-Coated Retrievers', 'Japanese Akita Inus']) assert.ok(dogs.items[1].answer.includes(breed));
  assert.equal(dogs.beforeImage, 'dog-show-sept-2015-1-4-copy-21a8269d.jpg');
  assert.equal(result.questionsByImage.get('matisse-castle-park-final.jpg')[0].id, 'pictures');
  assert.equal([...result.questionsByImage.values()].flat().length, 3);
});

test('completed Lake Garda Q&A sits after Lazise and before the family photo, with all supplied memories', () => {
  const result = resolvePhotoStreamPlan(plan, notes, qa);
  const index = plan.pages[0].rows.findIndex(row => row.sourceId === 'lake-garda');
  assert.equal(plan.pages[0].rows[index - 1].photos[0], 'dusk-at-lazise.jpg');
  assert.equal(plan.pages[0].rows[index + 1].photos[0], 'img-7532-jpg-d2d6ce7a.jpg');
  const block = result.questionsByImage.get('img-7532-jpg-d2d6ce7a.jpg')[0];
  assert.equal(block.id, 'lake-garda');
  assert.equal(block.layout, 'staggered');
  assert.equal(block.label, 'Lake Garda');
  assert.equal(allPhotoStreamQuestions.find(block => block.id === 'dogs').label, 'Dog Shows');
  assert.equal(allPhotoStreamQuestions.find(block => block.id === 'pictures').label, 'How It Started');
  assert.equal(allPhotoStreamQuestions.find(block => block.id === 'pictures').layout, 'staggered');
  assert.equal(block.items.length, 3);
  assert.ok(block.items.every(item => item.question && item.answer));
  const copy = block.items.map(item => item.answer).join(' ');
  for (const detail of ['Elias', '13 months', 'first foreign holiday', 'airplane', 'gelato', 'lemon', 'lobster', 'swimming', 'family memories', 'Lazise', 'ferry to Sirmione', 'walked to Bardolino', 'promenade', 'local wine', 'Italian food', 'iPhone 15', 'toddler', 'Sony A7 IV stayed at home']) assert.ok(copy.includes(detail), detail);
  assert.ok(!copy.includes('aquarium'), 'aquarium memory reserved for another answer');
  assert.ok(!copy.includes('Limone'), 'confirmed ferry destination is Sirmione');
});

test('homepage deep links track the new page while existing anchor identities stay unchanged', () => {
  const result = resolvePhotoStreamPlan(plan, notes, qa);
  const locations = photoStreamLocations(result.pages);
  assert.deepEqual(locations.get('barcelona-parakeet.jpeg'), { page: 2, id: photoStreamAnchor('barcelona-parakeet.jpeg') });
  for (const image of ['auditt.jpg', 'pale-waves-belfast.jpg', 'orca-castle-park.jpg']) assert.equal(locations.get(image).page, 1);
});

test('Reset uses exact source rows; old upload IDs migrate without duplicating or resetting a saved draft', async () => {
  const catalog = Object.fromEntries(await Promise.all(notes.map(async note => {
    const { width, height } = await sharp(new URL(`../public/photos/00-photostream/${note.image}`, import.meta.url).pathname).metadata();
    return [note.image, { ...note, shape: photoShape(width, height) }];
  })));
  const baseline = liveDraft({ plan }, catalog);
  assert.deepEqual(baseline.pages.map(page => page.rows.map(row => [row.id, row.kind, row.photos])), plan.pages.map(page => page.rows.map(row => [row.id, row.kind, row.photos])));
  const saved = structuredClone(baseline);
  const imported = imports[0];
  saved.pages[0].rows[0].photos[0] = imported.sourceUploadId;
  saved.pages.push({ id: 'draft-empty-page', rows: [{ id: 'draft-empty-row', kind: 'landscape', photos: [null] }] });
  saved.waiting.push(imported.sourceUploadId);
  saved.pages[0].rows.find(row => row.kind === 'qa').notes = 'Private reminder';
  const restored = restoreDraft(saved, catalog);
  assert.equal(restored.pages[0].rows[0].photos[0], imported.image);
  assert.ok(!restored.waiting.includes(imported.sourceUploadId));
  assert.ok(!restored.waiting.includes(imported.image));
  assert.equal(restored.pages.length, 3);
  assert.equal(restored.pages[0].rows.find(row => row.kind === 'qa').notes, 'Private reminder');
});

test('incomplete rows, missing records, duplicate photos and empty pages fail loudly', () => {
  for (const mutate of [
    draft => { draft.pages[0].rows[0].photos[0] = null; },
    draft => { draft.pages[0].rows[0].photos[0] = 'missing.jpg'; },
    draft => { draft.pages[0].rows[0].photos[0] = 'auditt.jpg'; },
    draft => { draft.pages.push({ id: 'empty', rows: [] }); },
    draft => { draft.pages[0].rows.unshift({ id: 'unfinished', kind: 'qa', topic: 'Lake Garda', questions: [] }); },
  ]) {
    const draft = structuredClone(plan); mutate(draft);
    assert.throws(() => resolvePhotoStreamPlan(draft, notes, qa));
  }
});
