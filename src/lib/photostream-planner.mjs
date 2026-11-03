// The planner is deliberately independent of the public feed. Its only output
// is a browser draft and a human-readable prompt, never a site/content write.
import { photoFitsRow } from './photo-shape.mjs';
export const plannerStorageKey = 'mk-photostream-planner-v2';
export const legacyStorageKey = 'mk-photostream-arranger-v1';
const clone = value => JSON.parse(JSON.stringify(value));
let serial = 0;
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${(++serial).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
export const blankRow = kind => kind === 'qa'
  ? { id: uid('qa'), kind, topic: '', questions: [], notes: '' }
  : { id: uid('row'), kind, photos: kind === 'pair' ? [null, null] : [null] };

export function liveDraft(source, catalog) {
  if (source.plan) return restoreDraft(clone(source.plan), catalog);
  const used = new Set();
  const pages = source.pages.map((images, index) => {
    const rows = [];
    for (const image of images) {
      for (const qa of source.questions.filter(q => q.beforeImage === image)) {
        rows.push({ id: `qa-${qa.id}`, sourceId: qa.id, kind: 'qa', topic: qa.label, questions: [...qa.questions], notes: '' });
      }
      const previous = rows[rows.length - 1];
      if (catalog[image].shape === 'portrait' && previous?.kind === 'pair' && previous.photos[1] === null) previous.photos[1] = image;
      else rows.push({ id: `live-${index}-${rows.length}`, kind: catalog[image].shape === 'portrait' ? 'pair' : 'landscape', photos: catalog[image].shape === 'portrait' ? [image, null] : [image] });
      used.add(image);
    }
    return { id: `page-${index + 1}`, rows };
  });
  return { version: 2, pages: pages.length ? pages : [{ id: 'page-1', rows: [] }], waiting: Object.keys(catalog).filter(image => !used.has(image)), parkedQa: [] };
}

// Keep an existing plan, including explicit empty slots and page boundaries.
// New catalogue photos go to Waiting; source reordering never resets a draft.
export function restoreDraft(saved, catalog) {
  if (saved?.version !== 2 || !Array.isArray(saved.pages) || !Array.isArray(saved.waiting)) throw new Error('Unrecognised planner draft');
  const aliases = new Map(Object.values(catalog).filter(photo => photo.sourceUploadId).map(photo => [photo.sourceUploadId, photo.image]));
  const canonical = image => aliases.get(image) || image;
  const seenPhotos = new Set(), seenRows = new Set(), seenPages = new Set();
  const cleanRow = row => {
    if (!row || typeof row.id !== 'string' || seenRows.has(row.id)) throw new Error('Invalid row');
    seenRows.add(row.id);
    if (row.kind === 'qa') return { id: row.id, kind: 'qa', ...(typeof row.sourceId === 'string' ? { sourceId: row.sourceId } : {}), topic: String(row.topic ?? ''), questions: Array.isArray(row.questions) ? row.questions.map(String) : [], notes: String(row.notes ?? '') };
    if (!['pair', 'landscape'].includes(row.kind) || !Array.isArray(row.photos)) throw new Error('Invalid photo row');
    const photos = Array.from({ length: row.kind === 'pair' ? 2 : 1 }, (_, index) => {
      const image = canonical(row.photos[index]);
      if (image === null || image === undefined) return null;
      if (typeof image !== 'string' || seenPhotos.has(image)) throw new Error('Duplicate or invalid photo');
      if (catalog[image] && !photoFitsRow(catalog[image], row.kind)) throw new Error('Photo shape changed; saved draft kept for recovery');
      seenPhotos.add(image);
      return image;
    });
    return { id: row.id, kind: row.kind, photos };
  };
  const pages = saved.pages.map(page => {
    if (!page || typeof page.id !== 'string' || seenPages.has(page.id) || !Array.isArray(page.rows)) throw new Error('Invalid page');
    seenPages.add(page.id);
    return { id: page.id, rows: page.rows.map(cleanRow) };
  });
  const parkedQa = (saved.parkedQa ?? []).map(cleanRow).filter(row => row.kind === 'qa');
  const waiting = [...new Set(saved.waiting.map(canonical).filter(image => typeof image === 'string' && !seenPhotos.has(image)))];
  for (const image of Object.keys(catalog)) if (!seenPhotos.has(image) && !waiting.includes(image)) waiting.push(image);
  return { version: 2, pages: pages.length ? pages : [{ id: uid('page'), rows: [] }], waiting, parkedQa };
}

export function migrateLegacy(saved, catalog, source, pageSize = 18) {
  if (saved?.version !== 1 || !Array.isArray(saved.ids)) throw new Error('Invalid older draft');
  const blocks = [], used = new Set();
  const removed = new Set([...(saved.removedPhotos ?? []), ...(saved.removedQa ?? [])]);
  const knownQa = new Map((source.questionCatalog || source.questions).map(q => [`qa:${q.id}`, q]));
  let rows = [], count = 0;
  const flush = () => { if (rows.length) blocks.push({ id: uid('page'), rows }); rows = []; count = 0; };
  for (const id of saved.ids) {
    if (typeof id !== 'string' || removed.has(id) || used.has(id)) continue;
    if (id.startsWith('qa:')) {
      const qa = knownQa.get(id);
      rows.push({ id: uid('qa'), kind: 'qa', ...(!id.startsWith('qa:draft-') ? { sourceId: qa?.id || id.slice(3) } : {}), topic: saved.topics?.[id] || qa?.label || 'Q&A', questions: qa?.questions || [], notes: '' });
    } else if (id.startsWith('photo:') && catalog[id.slice(6)]) {
      const image = id.slice(6), portrait = catalog[image].shape === 'portrait';
      const previous = rows[rows.length - 1];
      if (portrait && previous?.kind === 'pair' && previous.photos[1] === null) previous.photos[1] = image;
      else rows.push({ id: uid('row'), kind: portrait ? 'pair' : 'landscape', photos: portrait ? [image, null] : [image] });
      count++;
      if (count >= pageSize && (!portrait || rows[rows.length - 1].photos[1])) flush();
    }
    used.add(id);
  }
  flush();
  return restoreDraft({ version: 2, pages: blocks, waiting: [], parkedQa: [] }, catalog);
}

function detachPhoto(draft, image) {
  for (const page of draft.pages) for (const row of page.rows) if (row.photos) row.photos = row.photos.map(value => value === image ? null : value);
  draft.waiting = draft.waiting.filter(value => value !== image);
}
const pageById = (draft, id) => draft.pages.find(page => page.id === id);
const park = (draft, image) => { if (image && !draft.waiting.includes(image)) draft.waiting.push(image); };

export function changeDraft(current, command, catalog) {
  const draft = clone(current), { type } = command;
  if (type === 'add-page') draft.pages.push({ id: uid('page'), rows: [] });
  else if (type === 'remove-page') {
    const page = pageById(draft, command.pageId);
    if (!page || page.rows.length || draft.pages.length === 1) return current;
    draft.pages = draft.pages.filter(p => p !== page);
  } else if (type === 'place-photo') {
    const page = pageById(draft, command.pageId), row = page?.rows.find(r => r.id === command.rowId);
    if (!row?.photos || !Number.isInteger(command.slot) || command.slot < 0 || command.slot >= row.photos.length) return current;
    if (!photoFitsRow(catalog[command.image], row.kind)) return current;
    const displaced = row.photos[command.slot];
    if (displaced === command.image) return current;
    detachPhoto(draft, command.image);
    row.photos[command.slot] = command.image;
    park(draft, displaced);
  } else if (type === 'wait-photo') {
    if (!command.image) return current;
    detachPhoto(draft, command.image); park(draft, command.image);
  } else if (type === 'insert-row' || type === 'insert-photo') {
    const page = pageById(draft, command.pageId);
    if (!page) return current;
    let row;
    if (type === 'insert-photo') {
      if (!catalog[command.image]) return current;
      row = blankRow(catalog[command.image].shape === 'portrait' ? 'pair' : 'landscape');
      detachPhoto(draft, command.image); row.photos[0] = command.image;
    } else {
      if (!['pair', 'landscape', 'qa'].includes(command.kind)) return current;
      row = blankRow(command.kind);
    }
    page.rows.splice(Math.max(0, Math.min(command.index, page.rows.length)), 0, row);
  } else if (type === 'move-row') {
    const destination = pageById(draft, command.pageId);
    if (!destination) return current;
    let row, targetIndex = command.index;
    for (const page of draft.pages) {
      const index = page.rows.findIndex(r => r.id === command.rowId);
      if (index < 0) continue;
      if (page === destination && index < targetIndex) targetIndex--;
      [row] = page.rows.splice(index, 1); break;
    }
    if (!row) {
      const index = draft.parkedQa.findIndex(r => r.id === command.rowId);
      if (index >= 0) [row] = draft.parkedQa.splice(index, 1);
    }
    if (!row) return current;
    destination.rows.splice(Math.max(0, Math.min(targetIndex, destination.rows.length)), 0, row);
  } else if (type === 'remove-row') {
    const page = pageById(draft, command.pageId), index = page?.rows.findIndex(r => r.id === command.rowId) ?? -1;
    if (index < 0) return current;
    const [row] = page.rows.splice(index, 1);
    if (row.kind === 'qa') draft.parkedQa.push(row);
    else row.photos.forEach(image => park(draft, image));
  } else return current;
  return draft;
}

export function planWarnings(draft) {
  let emptySlots = 0;
  for (const page of draft.pages) for (const row of page.rows) if (row.photos) emptySlots += row.photos.filter(image => !image).length;
  return emptySlots ? [`${emptySlots} empty photo ${emptySlots === 1 ? 'slot' : 'slots'} — these are planning placeholders, not publishable orphan portraits.`] : [];
}

export function exportPrompt(draft, catalog) {
  const lines = ['Please apply this PhotoStream plan to my local site. Preserve existing photo captions, metadata, originals and stable anchors. Use the explicit page boundaries and row groupings below; do not automatically repaginate this plan. Nothing has been applied by the arranger.',
    'Q&A notes are editorial reminders, not finished copy. Keep existing answers unless we explicitly rewrite them. Do not publish incomplete rows or orphan portraits: ask me about any empty slots first.', ''];
  for (const [index, page] of draft.pages.entries()) {
    lines.push(`PAGE ${index + 1}`);
    for (const [i, row] of page.rows.entries()) {
      if (row.kind === 'qa') lines.push(`${i + 1}. Q&A: ${row.topic || 'Untitled'}${row.sourceId ? ` [existing: ${row.sourceId}]` : ' [new]'}`, ...row.questions.map(q => `   Question: ${q}`), `   Notes: ${row.notes || '(none)'}`);
      else lines.push(`${i + 1}. ${row.kind === 'pair' ? 'Portrait pair' : 'Single landscape'}: ${row.photos.map(image => image ? `[${image}] (${catalog[image]?.date || 'date unknown'})` : '[EMPTY SLOT]').join(' | ')}`);
    }
    lines.push('');
  }
  lines.push('WAITING / EXCLUDED FROM FEED (keep files and metadata):', ...draft.waiting.map(image => `- ${image}`));
  if (draft.parkedQa.length) lines.push('', 'Q&A blocks set aside:', ...draft.parkedQa.map(row => `- ${row.topic || row.id}: ${row.notes || '(no notes)'}`));
  const staged = [...new Set(draft.pages.flatMap(page => page.rows.flatMap(row => row.photos?.filter(Boolean) || [])))].map(image => catalog[image]).filter(photo => photo?.upload);
  if (staged.length) lines.push('', 'NEW PHOTOS STAGED LOCALLY (not published):',
    'Resolve these upload IDs using the private originals below. Copy/optimise them into public/photos/00-photostream only when applying this plan. Preserve the originals; add photo metadata without creating individual detail pages. Ask me for any missing caption or date.',
    ...staged.map(photo => JSON.stringify({ image: photo.image, originalName: photo.originalName, sourcePath: photo.sourcePath, proposedFilename: photo.proposedFilename, title: photo.title, date: photo.date, dateSource: photo.dateSource, width: photo.width, height: photo.height })));
  lines.push('', 'Structured plan:', JSON.stringify(draft, null, 2));
  return lines.join('\n');
}
