import { liveDraft, restoreDraft, migrateLegacy, changeDraft, exportPrompt, planWarnings, plannerStorageKey, legacyStorageKey } from '../lib/photostream-planner.mjs';
import { photoFitsRow } from '../lib/photo-shape.mjs';

type Photo = { image: string; title: string; date: string; shape: 'portrait' | 'landscape' | 'square'; src: string; upload?: boolean; originalName?: string; sourcePath?: string; proposedFilename?: string; sourceUploadId?: string };
type Pick = { kind: 'photo'; image: string } | { kind: 'row'; rowId: string } | { kind: 'template'; template: string };
const { catalog, source, uploadEndpoint } = JSON.parse(document.querySelector('#planner-data')!.textContent!) as { catalog: Record<string, Photo>; source: any; uploadEndpoint: string };
const testMode = new URLSearchParams(location.search).has('test');
const storageKey = testMode ? `${plannerStorageKey}-test` : plannerStorageKey;
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const pagesEl = $('[data-pages]'), waitingEl = $('[data-waiting]'), status = $('[data-status]');
const insertDialog = $<HTMLDialogElement>('[data-insert-dialog]'), resetDialog = $<HTMLDialogElement>('[data-reset-dialog]'), exportDialog = $<HTMLDialogElement>('[data-export-dialog]');
const copyText = $<HTMLTextAreaElement>('[data-copy-text]');
const baseline = liveDraft(source, catalog);
let draft = JSON.parse(JSON.stringify(baseline)), activePage = draft.pages[0].id, picked: Pick | null = null, dragging: Pick | null = null;
let insertion = { pageId: activePage, index: 0 }, protectedSave = false, lastSaved = '', search = '', sort = 'recent';
let undo: any[] = [], redo: any[] = [], inputBefore: any = null;
let dragTimer: number | undefined, pointerX = 0, pointerY = 0;
const clone = (value: any) => JSON.parse(JSON.stringify(value));
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
const say = (message: string) => { status.textContent = message; };
const findRow = (rowId: string) => draft.pages.flatMap((page: any) => page.rows).find((row: any) => row.id === rowId) || draft.parkedQa.find((row: any) => row.id === rowId);
const photo = (image: string) => catalog[image] || { image, title: image, date: 'Date unknown · missing catalogue entry', shape: 'portrait', src: '' };

function save() {
  if (protectedSave) return false;
  try {
    lastSaved = JSON.stringify({ version: 2, updatedAt: new Date().toISOString(), draft });
    localStorage.setItem(storageKey, lastSaved);
    say(`Saved in this browser · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
    return true;
  } catch { say('Could not save in this browser — copy your plan before closing.'); return false; }
}

let openingMessage = 'Current local feed · changes save automatically';
try {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    lastSaved = raw;
    const stored = JSON.parse(raw);
    draft = restoreDraft(stored.draft || stored, catalog);
    // Repair early migrated v1 cards whose questions were hidden on the live
    // feed. Never overwrite questions or notes the user has already written.
    for (const page of draft.pages) for (const row of page.rows) {
      if (row.kind !== 'qa' || row.sourceId || row.questions.length) continue;
      const known = source.questionCatalog?.find((qa: any) => qa.label === row.topic);
      if (known) { row.sourceId = known.id; row.questions = [...known.questions]; }
    }
    openingMessage = 'Your saved arrangement restored · feed unchanged';
  } else if (!testMode) {
    const legacy = localStorage.getItem(legacyStorageKey);
    if (legacy) {
      draft = migrateLegacy(JSON.parse(legacy), catalog, source);
      openingMessage = 'Your previous arrangement restored · original browser draft kept';
    }
  }
} catch {
  protectedSave = true;
  openingMessage = 'Saved draft could not be opened and has NOT been overwritten. Use Reset explicitly to start over.';
}
activePage = draft.pages[0].id;
$('[data-test-banner]').hidden = !testMode;

function selectionUI() {
  const message = picked?.kind === 'photo' ? `Picked: ${photo(picked.image).title}. Click a matching slot, another photo to replace it, or ＋ to insert.`
    : picked?.kind === 'row' ? 'Row picked. Click a ＋ between rows on any page to move it there.'
    : `Adding blocks to Page ${draft.pages.findIndex((page: any) => page.id === activePage) + 1}. Drag photos or click to pick one.`;
  $('[data-selection-text]').textContent = message;
  $('[data-selection]').classList.toggle('is-picked', Boolean(picked));
  $('[data-command="cancel-selection"]').hidden = !picked;
  document.querySelectorAll<HTMLElement>('[data-photo]').forEach(el => {
    const selected = picked?.kind === 'photo' && picked.image === el.dataset.image;
    el.classList.toggle('is-selected', selected); el.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll<HTMLElement>('.plan-row').forEach(el => el.classList.toggle('is-picked-row', picked?.kind === 'row' && picked.rowId === el.dataset.rowId));
  document.querySelectorAll<HTMLElement>('.planner-page').forEach(el => el.classList.toggle('is-active', el.dataset.pageId === activePage));
  $<HTMLButtonElement>('[data-command="undo"]').disabled = !undo.length;
  $<HTMLButtonElement>('[data-command="redo"]').disabled = !redo.length;
}

function photoButton(image: string) {
  const p = photo(image);
  return `<button type="button" class="photo-tile" data-photo data-image="${escape(image)}" draggable="true" title="${escape(p.title)} · ${escape(p.date)}" aria-label="Pick ${escape(p.title)} (${escape(p.date)})" aria-pressed="false" data-focus="photo-${escape(image)}">${p.src ? `<img src="${escape(p.src)}" alt="${escape(p.title)}" draggable="false" loading="lazy" />` : '<span>Photo missing from catalogue</span>'}${p.upload ? '<span class="upload-badge">New</span>' : ''}<time>${escape(p.date)}</time></button>`;
}
function insertButton(pageId: string, index: number) {
  return `<button type="button" class="insert-row" data-drop="insert" data-page-id="${escape(pageId)}" data-index="${index}" aria-label="Insert row ${index + 1} on page ${draft.pages.findIndex((p: any) => p.id === pageId) + 1}" data-focus="insert-${escape(pageId)}-${index}">＋</button>`;
}
function questionsMarkup(row: any) {
  return row.questions.length ? `<ul>${row.questions.map((q: string) => `<li>${escape(q)}</li>`).join('')}</ul>` : '<p class="no-questions">Add questions to explore here.</p>';
}
function rowMarkup(row: any, pageId: string) {
  const label = row.kind === 'qa' ? 'Q&A' : row.kind === 'pair' ? 'Portrait pair' : 'Single landscape';
  const tools = `<div class="row-toolbar"><button type="button" class="row-handle" draggable="true" data-row-handle="${escape(row.id)}" aria-label="Pick up ${label} row" data-focus="row-${escape(row.id)}">⠿ ${label}</button><button type="button" class="row-remove" data-action="remove-row" aria-label="Remove ${label} row to waiting">×</button></div>`;
  let body;
  if (row.kind === 'qa') body = `<div class="qa-card"><input aria-label="Q&A topic" placeholder="Q&A topic" value="${escape(row.topic)}" data-field="topic" /><div data-question-list>${questionsMarkup(row)}</div><details ${row.questions.length ? '' : 'open'}><summary>Edit questions</summary><textarea rows="3" aria-label="Questions, one per line" data-field="questions" placeholder="One question per line">${escape(row.questions.join('\n'))}</textarea></details><label>Notes for later<textarea rows="3" aria-label="Notes for ${escape(row.topic || 'Q&A')}" data-field="notes" placeholder="What could I talk about here?">${escape(row.notes)}</textarea></label></div>`;
  else body = `<div class="row-photos ${row.kind === 'landscape' ? 'is-landscape' : ''}">${row.photos.map((image: string | null, slot: number) => `<div class="photo-slot" data-drop="slot" data-page-id="${escape(pageId)}" data-row-id="${escape(row.id)}" data-slot="${slot}">${image ? photoButton(image) + `<button type="button" class="photo-remove" data-action="remove-photo" data-image="${escape(image)}" aria-label="Remove ${escape(photo(image).title)} to waiting">×</button>` : `<button type="button" class="empty-slot" data-empty-slot aria-label="Choose ${row.kind === 'pair' ? 'portrait' : 'landscape'} photo for empty slot"><span aria-hidden="true">＋</span>${row.kind === 'pair' ? 'Portrait' : 'Landscape'}<small>Drop or pick a photo</small></button>`}</div>`).join('')}</div>`;
  return `<section class="plan-row" data-row-id="${escape(row.id)}" data-page-id="${escape(pageId)}">${tools}${body}</section>`;
}
function renderWaiting() {
  const needle = search.toLocaleLowerCase();
  const images = draft.waiting.filter((image: string) => `${photo(image).title} ${photo(image).date} ${image}`.toLocaleLowerCase().includes(needle));
  images.sort((a: string, b: string) => sort === 'name' ? photo(a).title.localeCompare(photo(b).title) : (sort === 'oldest' ? 1 : -1) * ((Date.parse(photo(a).date) || 0) - (Date.parse(photo(b).date) || 0)) || a.localeCompare(b));
  $('[data-waiting-count]').textContent = String(draft.waiting.length);
  waitingEl.innerHTML = images.map((image: string) => `<div class="waiting-photo">${photoButton(image)}</div>`).join('') || `<p class="waiting-empty">${search ? 'No matching photos.' : 'Nothing waiting. Drop a photo here to set it aside.'}</p>`;
  $('[data-parked-qa]').innerHTML = draft.parkedQa.length ? `<h3>Saved Q&A blocks</h3>${draft.parkedQa.map((row: any) => `<button type="button" class="parked-qa" data-row-handle="${escape(row.id)}" draggable="true">${escape(row.topic || 'Untitled Q&A')}<small>${row.questions.length} questions · notes kept</small></button>`).join('')}` : '';
  selectionUI();
}
function render() {
  const horizontal = pagesEl.scrollLeft;
  const scrolls = new Map([...pagesEl.querySelectorAll<HTMLElement>('.page-rows')].map(el => [el.dataset.pageId, el.scrollTop]));
  const focused = (document.activeElement as HTMLElement)?.dataset.focus;
  pagesEl.innerHTML = draft.pages.map((page: any, index: number) => {
    const count = page.rows.reduce((sum: number, row: any) => sum + (row.photos?.filter(Boolean).length || 0), 0);
    const incomplete = page.rows.some((row: any) => row.kind === 'pair' && row.photos.filter(Boolean).length === 1);
    return `<section class="planner-page" data-page-id="${escape(page.id)}" aria-label="Page ${index + 1}"><div class="page-header"><button type="button" class="page-select" data-select-page="${escape(page.id)}" aria-label="Select page ${index + 1}" data-focus="page-${escape(page.id)}"><strong>Page ${index + 1}</strong><small>${count} photos · ${page.rows.length} rows</small></button><button type="button" class="page-remove" data-remove-page="${escape(page.id)}" aria-label="Remove empty page ${index + 1}" title="Only empty pages can be removed" ${page.rows.length || draft.pages.length === 1 ? 'disabled' : ''}>×</button></div><div class="page-rows" data-page-id="${escape(page.id)}">${incomplete ? '<p class="page-warning">A portrait pair has an empty slot.</p>' : ''}${page.rows.map((row: any, i: number) => insertButton(page.id, i) + rowMarkup(row, page.id)).join('')}${insertButton(page.id, page.rows.length)}${page.rows.length ? '' : '<p class="page-empty">Build this page with blocks or drop a photo on the ＋ above.</p>'}</div></section>`;
  }).join('');
  pagesEl.scrollLeft = horizontal;
  pagesEl.querySelectorAll<HTMLElement>('.page-rows').forEach(el => el.scrollTop = scrolls.get(el.dataset.pageId) || 0);
  renderWaiting();
  if (focused) [...document.querySelectorAll<HTMLElement>('[data-focus]')].find(el => el.dataset.focus === focused)?.focus({ preventScroll: true });
}
function commit(command: any) {
  if (protectedSave) { say('Draft protected. Reload a newer tab’s plan or explicitly Reset before editing.'); return; }
  const next = changeDraft(draft, command, catalog);
  if (next === draft) { say('Use a matching photo slot: portraits in pairs, landscapes in a single row. Square photos fit either.'); return; }
  undo.push(clone(draft)); if (undo.length > 60) undo.shift(); redo = [];
  draft = next; picked = null; inputBefore = null;
  if (!draft.pages.some((page: any) => page.id === activePage)) activePage = draft.pages[0].id;
  save(); render();
}
function insertAt(pageId: string, index: number, item: Pick | null) {
  activePage = pageId;
  if (item?.kind === 'photo') commit({ type: 'insert-photo', image: item.image, pageId, index });
  else if (item?.kind === 'row') commit({ type: 'move-row', rowId: item.rowId, pageId, index });
  else if (item?.kind === 'template') commit({ type: 'insert-row', kind: item.template, pageId, index });
  else { insertion = { pageId, index }; insertDialog.showModal(); }
  if (item) {
    const page = draft.pages.find((p: any) => p.id === pageId);
    const row = page?.rows[Math.min(index, page.rows.length - 1)];
    if (row) [...pagesEl.querySelectorAll<HTMLElement>('.plan-row')].find(el => el.dataset.rowId === row.id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}
function placeInSlot(slot: HTMLElement, item: Pick | null) {
  if (item?.kind !== 'photo') { say('Pick a photo from Waiting or another row first, then click this slot.'); return; }
  commit({ type: 'place-photo', image: item.image, pageId: slot.dataset.pageId, rowId: slot.dataset.rowId, slot: Number(slot.dataset.slot) });
}
async function copyPlan() {
  try { await navigator.clipboard.writeText(copyText.value); say('Copied — paste into Codex to apply. The feed is still unchanged.'); }
  catch { copyText.focus(); copyText.select(); say('Clipboard unavailable — select the text and copy it manually.'); }
}

document.addEventListener('click', event => {
  const target = event.target as HTMLElement, button = target.closest<HTMLElement>('button');
  if (!button || button.hasAttribute('disabled')) return;
  if (button.hasAttribute('data-close-dialog')) { button.closest<HTMLDialogElement>('dialog')?.close(); return; }
  const command = button.dataset.command;
  if (command === 'upload') { if (protectedSave) say('Open your saved plan or explicitly Reset before adding uploads.'); else $<HTMLInputElement>('[data-file-input]').click(); }
  else if (command === 'cancel-selection') { picked = null; selectionUI(); }
  else if (command === 'add-page') {
    commit({ type: 'add-page' }); activePage = draft.pages[draft.pages.length - 1].id; selectionUI();
    pagesEl.scrollLeft = pagesEl.scrollWidth;
  } else if (command === 'reset') resetDialog.showModal();
  else if (command === 'confirm-reset') {
    undo.push(clone(draft)); redo = []; protectedSave = false; draft = restoreDraft(clone(baseline), catalog); picked = null; activePage = draft.pages[0].id;
    save(); resetDialog.close(); render(); say('Reset to the current local feed. Nothing changed on the site.');
  } else if (command === 'undo' || command === 'redo') {
    if (protectedSave) return;
    const from = command === 'undo' ? undo : redo, to = command === 'undo' ? redo : undo;
    if (from.length) { to.push(clone(draft)); draft = restoreDraft(from.pop(), catalog); picked = null; inputBefore = null; if (!draft.pages.some((p: any) => p.id === activePage)) activePage = draft.pages[0].id; save(); render(); }
  } else if (command === 'export') {
    copyText.value = exportPrompt(draft, catalog); $('[data-export-warning]').textContent = planWarnings(draft).join(' ');
    exportDialog.showModal(); void copyPlan();
  } else if (command === 'copy-again') void copyPlan();
  else if (button.dataset.selectPage) { activePage = button.dataset.selectPage; selectionUI(); }
  else if (button.dataset.removePage) commit({ type: 'remove-page', pageId: button.dataset.removePage });
  else if (button.dataset.template) insertAt(activePage, draft.pages.find((p: any) => p.id === activePage).rows.length, { kind: 'template', template: button.dataset.template });
  else if (button.dataset.insertKind) { commit({ type: 'insert-row', kind: button.dataset.insertKind, ...insertion }); insertDialog.close(); }
  else if (button.dataset.drop === 'insert') insertAt(button.dataset.pageId!, Number(button.dataset.index), picked);
  else if (button.dataset.action === 'remove-photo') commit({ type: 'wait-photo', image: button.dataset.image });
  else if (button.dataset.action === 'remove-row') { const row = button.closest<HTMLElement>('.plan-row')!; commit({ type: 'remove-row', pageId: row.dataset.pageId, rowId: row.dataset.rowId }); }
  else if (button.dataset.rowHandle) { picked = picked?.kind === 'row' && picked.rowId === button.dataset.rowHandle ? null : { kind: 'row', rowId: button.dataset.rowHandle }; selectionUI(); }
  else if (button.hasAttribute('data-empty-slot')) {
    placeInSlot(button.closest<HTMLElement>('[data-drop="slot"]')!, picked);
    if (!picked) $('[data-search]').focus();
  } else if (button.hasAttribute('data-photo')) {
    const image = button.dataset.image!;
    if (picked?.kind === 'photo' && picked.image !== image && button.closest('[data-drop="slot"]')) placeInSlot(button.closest<HTMLElement>('[data-drop="slot"]')!, picked);
    else { picked = picked?.kind === 'photo' && picked.image === image ? null : { kind: 'photo', image }; selectionUI(); }
  }
});

document.addEventListener('focusin', event => { if ((event.target as HTMLElement).dataset.field) inputBefore = clone(draft); });
document.addEventListener('input', event => {
  const input = event.target as HTMLInputElement;
  if (input.hasAttribute('data-search')) { search = input.value; renderWaiting(); return; }
  if (!input.dataset.field || protectedSave) return;
  const row = findRow(input.closest<HTMLElement>('.plan-row')!.dataset.rowId!);
  if (!row) return;
  if (inputBefore) { undo.push(inputBefore); redo = []; inputBefore = null; }
  row[input.dataset.field] = input.dataset.field === 'questions' ? input.value.split('\n').map(line => line.trim()).filter(Boolean) : input.value;
  if (input.dataset.field === 'questions') input.closest('.qa-card')!.querySelector('[data-question-list]')!.innerHTML = questionsMarkup(row);
  save(); selectionUI();
});
$('[data-sort]').addEventListener('change', event => { sort = (event.target as HTMLSelectElement).value; renderWaiting(); });
let uploading = false;
async function uploadFiles(files: File[]) {
  const feedback = $('[data-upload-status]');
  if (uploading || !files.length) return;
  if (protectedSave) { say('Your draft is protected. Open it or explicitly Reset before uploading.'); return; }
  uploading = true;
  document.querySelectorAll<HTMLButtonElement>('[data-command="upload"]').forEach(button => button.disabled = true);
  let added = 0, duplicates = 0; const errors: string[] = [];
  for (const [index, file] of files.entries()) {
    feedback.textContent = `Saving ${index + 1} of ${files.length}: ${file.name}…`;
    if (file.size > 50 * 1024 * 1024) { errors.push(`${file.name}: over 50 MB.`); continue; }
    try {
      const response = await fetch(uploadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'X-Photo-Name': encodeURIComponent(file.name) }, body: file });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save this photo.');
      const incoming = result.photo as Photo;
      const p = Object.values(catalog).find(photo => photo.sourceUploadId === incoming.image) || incoming;
      catalog[p.image] = p;
      const placed = draft.pages.some((page: any) => page.rows.some((row: any) => row.photos?.includes(p.image)));
      if (!placed && !draft.waiting.includes(p.image)) draft.waiting.push(p.image);
      result.duplicate ? duplicates++ : added++;
      search = ''; $<HTMLInputElement>('[data-search]').value = '';
      save(); renderWaiting();
    } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed. Please try again.'}`); }
  }
  uploading = false;
  document.querySelectorAll<HTMLButtonElement>('[data-command="upload"]').forEach(button => button.disabled = false);
  $<HTMLInputElement>('[data-file-input]').value = '';
  feedback.textContent = [`${added} new ${added === 1 ? 'photo' : 'photos'} saved privately.`, duplicates ? `${duplicates} already uploaded — no duplicates added.` : '', errors.join(' ')].filter(Boolean).join(' ');
  say(errors.length ? 'Some files could not be uploaded. Your plan is safe; see Waiting.' : 'Uploads ready in Waiting · nothing published');
}
$('[data-file-input]').addEventListener('change', event => { void uploadFiles(Array.from((event.target as HTMLInputElement).files || [])); });
const externalFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types || []).includes('Files');
document.addEventListener('dragover', event => { if (externalFiles(event)) { event.preventDefault(); $('[data-drop="waiting"]').classList.add('is-file-drop'); } });
document.addEventListener('dragleave', event => { if (!event.relatedTarget) $('[data-drop="waiting"]').classList.remove('is-file-drop'); });
document.addEventListener('drop', event => {
  if (!externalFiles(event)) return;
  event.preventDefault(); $('[data-drop="waiting"]').classList.remove('is-file-drop');
  void uploadFiles(Array.from(event.dataTransfer?.files || []));
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { picked = null; selectionUI(); } });

const dropTarget = (target: EventTarget | null) => (target as HTMLElement | null)?.closest<HTMLElement>('[data-drop]');
const clearDrop = () => document.querySelectorAll('.is-drop-target').forEach(el => el.classList.remove('is-drop-target'));
let pointerPending: { item: Pick; x: number; y: number; element: HTMLElement } | null = null;
let suppressClick = false;
const dragPreview = document.createElement('div'); dragPreview.className = 'planner-drag-preview'; dragPreview.hidden = true; dragPreview.setAttribute('aria-hidden', 'true'); document.body.append(dragPreview);
function stopDrag() { dragging = null; pointerPending = null; clearDrop(); dragPreview.hidden = true; document.body.classList.remove('planner-dragging'); document.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging')); window.clearInterval(dragTimer); }
function autoScroll() {
  window.clearInterval(dragTimer);
  dragTimer = window.setInterval(() => {
    const hovered = document.elementFromPoint(pointerX, pointerY)?.closest<HTMLElement>('.page-rows, .planner-waiting');
    if (hovered) { const r = hovered.getBoundingClientRect(); if (pointerY < r.top + 55) hovered.scrollTop -= 16; else if (pointerY > r.bottom - 55) hovered.scrollTop += 16; }
    const r = pagesEl.getBoundingClientRect();
    if (pointerY > r.top && pointerY < r.bottom) { if (pointerX < r.left + 28 && pointerX > r.left - 15) pagesEl.scrollLeft -= 14; else if (pointerX > r.right - 28 && pointerX < r.right + 15) pagesEl.scrollLeft += 14; }
  }, 30);
}
function itemFrom(el: HTMLElement): Pick | null {
  return el.dataset.template ? { kind: 'template', template: el.dataset.template } : el.dataset.rowHandle ? { kind: 'row', rowId: el.dataset.rowHandle } : el.dataset.image ? { kind: 'photo', image: el.dataset.image } : null;
}
function accepts(target: HTMLElement, item: Pick) {
  if (target.dataset.drop !== 'slot') return target.dataset.drop === 'insert' || item.kind !== 'template';
  return item.kind === 'photo' && photoFitsRow(photo(item.image), findRow(target.dataset.rowId!)?.kind);
}
function completeDrop(target: HTMLElement | null | undefined, item: Pick) {
  if (!target || !accepts(target, item)) { say('Drop between rows, onto a matching photo slot, or into Waiting.'); return; }
  if (target.dataset.drop === 'insert') insertAt(target.dataset.pageId!, Number(target.dataset.index), item);
  else if (target.dataset.drop === 'slot') placeInSlot(target, item);
  else if (target.dataset.drop === 'waiting') {
    if (item.kind === 'photo') commit({ type: 'wait-photo', image: item.image });
    else if (item.kind === 'row') { const page = draft.pages.find((p: any) => p.rows.some((r: any) => r.id === item.rowId)); if (page) commit({ type: 'remove-row', pageId: page.id, rowId: item.rowId }); }
  }
}
// Pointer dragging works for both mouse and touch; native HTML dragging remains
// a fallback for older browsers. Ordinary clicks still use pick-and-place.
document.addEventListener('pointerdown', event => {
  if (event.button !== 0 || protectedSave) return;
  const el = (event.target as HTMLElement).closest<HTMLElement>('[draggable="true"]');
  if (!el) return;
  const item = itemFrom(el); if (item) pointerPending = { item, x: event.clientX, y: event.clientY, element: el };
});
document.addEventListener('pointermove', event => {
  if (!pointerPending) return;
  pointerX = event.clientX; pointerY = event.clientY;
  if (!dragging && Math.hypot(pointerX - pointerPending.x, pointerY - pointerPending.y) < 6) return;
  event.preventDefault();
  if (!dragging) {
    dragging = pointerPending.item; pointerPending.element.classList.add('is-dragging'); document.body.classList.add('planner-dragging'); autoScroll();
    dragPreview.innerHTML = dragging.kind === 'photo' ? `<img src="${escape(photo(dragging.image).src)}" alt="" /><span>${escape(photo(dragging.image).title)}</span>` : `<span>${dragging.kind === 'row' ? 'Move row' : 'Add ' + escape(dragging.template)}</span>`;
    dragPreview.hidden = false;
  }
  dragPreview.style.transform = `translate(${pointerX + 14}px,${pointerY + 14}px)`;
  const target = document.elementFromPoint(pointerX, pointerY)?.closest<HTMLElement>('[data-drop]'); clearDrop();
  if (target && accepts(target, dragging)) target.classList.add('is-drop-target');
}, { passive: false });
document.addEventListener('pointerup', event => {
  if (pointerPending && dragging) {
    suppressClick = true; setTimeout(() => suppressClick = false, 250);
    completeDrop(document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-drop]'), dragging);
  }
  stopDrag();
});
document.addEventListener('pointercancel', stopDrag);
document.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
document.addEventListener('dragstart', event => {
  if (pointerPending) { event.preventDefault(); return; }
  const target = (event.target as HTMLElement).closest<HTMLElement>('[draggable="true"]');
  if (!target || protectedSave || !event.dataTransfer) { event.preventDefault(); return; }
  dragging = itemFrom(target);
  if (!dragging) return;
  event.dataTransfer.setData('text/plain', JSON.stringify(dragging)); event.dataTransfer.effectAllowed = 'move';
  target.classList.add('is-dragging'); pointerX = event.clientX; pointerY = event.clientY;
  autoScroll();
});
document.addEventListener('dragover', event => {
  if (!dragging) return;
  pointerX = event.clientX; pointerY = event.clientY;
  const target = dropTarget(event.target); clearDrop();
  if (!target || !accepts(target, dragging)) { if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'; return; }
  event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'; target.classList.add('is-drop-target');
});
document.addEventListener('drop', event => {
  const target = dropTarget(event.target), item = dragging;
  if (!target || !item) { stopDrag(); return; }
  event.preventDefault();
  completeDrop(target, item);
  stopDrag();
});
document.addEventListener('dragend', stopDrag);
window.addEventListener('storage', event => { if (event.key === storageKey && event.newValue !== lastSaved) { protectedSave = true; say('Another tab updated this plan. Reload to use it; this tab will not overwrite it.'); } });
render();
if (!protectedSave) save();
say(openingMessage);
