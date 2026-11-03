import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import sharp from 'sharp';
import { cameraDetails } from './photo-exif.mjs';
import { savePhotoUpload } from './photostream-upload-store.mjs';

const sample = async (make, model, fields = {}) => sharp({ create: { width: 10, height: 10, channels: 3, background: '#777' } }).jpeg().withExif({
  IFD0: { Make: make, Model: model },
  IFD2: { ExposureTime: '1/400', FNumber: '28/10', FocalLength: '55/1', ISOSpeedRatings: '2000', LensModel: 'FE 55mm F1.8 ZA', ...fields },
}).toBuffer();

test('camera, focal length, lens model and exposure are recovered from original EXIF', async () => {
  const photo = await sample('SONY', 'ILCE-7M2');
  const { exif } = await sharp(photo).metadata();
  const originalExif = Buffer.from(exif);
  assert.deepEqual(cameraDetails(exif), { camera: 'Sony A7 II', lens: '55mm', lensModel: 'FE 55mm F1.8 ZA', settings: '1/400 · f/2.8 · ISO 2000' });
  assert.deepEqual(exif, originalExif, 'EXIF is read without modifying the source');
  assert.equal(cameraDetails((await sharp(await sample('SONY', 'ILCE-7M4')).metadata()).exif).camera, 'Sony A7 IV');
});

test('phone focal lengths are rounded for display and longer exposures remain readable', async () => {
  const phone = await sample('Apple', 'iPhone 17 Pro', { FocalLength: '6765/1000', ExposureTime: '1/60', FNumber: '18/10', ISOSpeedRatings: '250' });
  const details = cameraDetails((await sharp(phone).metadata()).exif);
  assert.equal(details.camera, 'iPhone 17 Pro');
  assert.equal(details.lens, '6.8mm');
  assert.equal(details.settings, '1/60 · f/1.8 · ISO 250');
  const slow = await sample('Example', 'Model', { ExposureTime: '2/1' });
  assert.equal(cameraDetails((await sharp(slow).metadata()).exif).settings, '2s · f/2.8 · ISO 2000');
});

test('both TIFF byte orders are supported; missing, malformed and truncated tags do not invent metadata', () => {
  for (const little of [false, true]) {
    const exif = Buffer.alloc(50);
    const u16 = (value, offset) => little ? exif.writeUInt16LE(value, offset) : exif.writeUInt16BE(value, offset);
    const u32 = (value, offset) => little ? exif.writeUInt32LE(value, offset) : exif.writeUInt32BE(value, offset);
    exif.write(little ? 'II' : 'MM', 0); u16(42, 2); u32(8, 4); u16(1, 8);
    u16(0x0110, 10); u16(2, 12); u32(9, 14); u32(26, 18); exif.write('ILCE-7M2\0', 26);
    assert.deepEqual(cameraDetails(exif), { camera: 'Sony A7 II' });
    u32(99999999, 18);
    assert.deepEqual(cameraDetails(exif), {});
  }
  for (const value of [undefined, null, '', Buffer.alloc(0), Buffer.from('Exif\0\0II'), Buffer.alloc(100)]) assert.deepEqual(cameraDetails(value), {});
});

test('new planner uploads retain camera details automatically without changing originals or exposing private tags', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mk-photo-exif-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const bytes = await sample('SONY', 'ILCE-7M2', { BodySerialNumber: 'PRIVATE-SERIAL' });
  const result = await savePhotoUpload(root, bytes, 'camera-test.jpg', true);
  assert.equal(result.photo.camera, 'Sony A7 II');
  assert.equal(result.photo.settings, '1/400 · f/2.8 · ISO 2000');
  assert.ok(!JSON.stringify(result.photo).includes('PRIVATE-SERIAL'));
  assert.deepEqual(await fs.readFile(path.join(root, result.photo.sourcePath)), bytes);
  const duplicate = await savePhotoUpload(root, bytes, 'camera-test.jpg', true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.photo.camera, result.photo.camera);
});

test('applied PhotoStream metadata fills all 17 entries without inventing missing exposure details', async () => {
  const imports = JSON.parse(await fs.readFile(new URL('../src/data/photo-stream-imports.json', import.meta.url)));
  assert.equal(imports.filter(note => note.camera && note.lens && note.settings).length, 17);
  const missing = imports.filter(note => !note.camera);
  assert.deepEqual(missing, []);
  const yellow = imports.find(note => note.image === 'orca-yellow-blanket-96dc1904.jpg');
  assert.equal(yellow.camera, 'Sony A7 II');
  assert.equal(yellow.lens, '55mm');
  assert.equal(yellow.settings, '1/200 · f/2.5');
  assert.equal(yellow.dateToConfirm, false);
  assert.equal(yellow.captureDate, '2022-04-06');
  assert.equal(yellow.captureTime, '18:23');
  assert.ok(!yellow.metadataNote);
  assert.ok(imports.every(note => note.caption?.trim()));
  assert.equal(imports.find(note => note.image === 'orca-boardwalk-e67dd548.jpg').caption, "Shaw's Bridge soon became our favourite area to roam when we lived in Belfast");
  assert.equal(imports.find(note => note.image === 'dog-show-sept-2015-1-4-copy-21a8269d.jpg').settings, '1/400 · f/2.8 · ISO 2000');
  assert.equal(imports.find(note => note.image === 'img-7532-jpg-d2d6ce7a.jpg').place, 'Lazise, Lake Garda, Italy');
  assert.equal(imports.find(note => note.image === 'porto-1-38d29bb0.jpg').place, 'Porto, Portugal');
  assert.equal(imports.find(note => note.image === '9b716495-a27e-4982-9d8d-18a9f09a113f-1-105-c-23884791.jpg').place, 'Bangor Marina, County Down');
  const source = await fs.readFile(new URL('../src/lib/field-notes.ts', import.meta.url), 'utf8');
  const marker = 'export const fieldNotes: FieldNote[] = ';
  const notes = vm.runInNewContext(source.slice(source.indexOf(marker) + marker.length, source.indexOf('\n];') + 2), { importedNotes: imports });
  const plan = JSON.parse(await fs.readFile(new URL('../src/data/photo-stream-plan.json', import.meta.url)));
  const active = new Set(plan.pages.flatMap(page => page.rows.flatMap(row => row.photos || [])));
  assert.ok(notes.filter(note => active.has(note.image) && !['wes-anderson-swans.jpeg', 'orca-boardwalk-e67dd548.jpg'].includes(note.image)).every(note => note.caption?.trim()));
  assert.ok(!notes.find(note => note.image === 'wes-anderson-swans.jpeg').caption, 'optional swans caption deliberately removed');
  assert.ok(notes.find(note => note.image === 'auditt.jpg').caption.startsWith('I bought my dream car in 2020'));
});

test('reviewed titles, captions and places stay attached to stable photo identities', async () => {
  const notes = JSON.parse(await fs.readFile(new URL('../src/data/photo-stream-imports.json', import.meta.url)));
  const get = image => notes.find(note => note.image === image);
  assert.equal(get('orca-bluebells-landscape-2026-f18b59e2.jpg').title, 'A Throwback to Puppyhood');
  assert.equal(get('orca-bluebells-landscape-2026-f18b59e2.jpg').place, 'Castle Park, Bangor');
  assert.equal(get('img-2641-3c7a3983.jpg').title, 'You’re a Wave of a Dream');
  assert.equal(get('img-2641-3c7a3983.jpg').caption, 'I absolutely adored this gig.');
  assert.equal(get('img-7532-jpg-d2d6ce7a.jpg').title, 'Family');
  assert.ok(get('img-7532-jpg-d2d6ce7a.jpg').caption.includes('lakeside promenade'));
  assert.equal(get('980fde19-e613-42d5-8492-0076738ab74c-1e3bb79d.jpg').title, 'Tea Party');
  assert.equal(get('980fde19-e613-42d5-8492-0076738ab74c-1e3bb79d.jpg').place, 'Flavour First Farm');
  const teaParty = get('980fde19-e613-42d5-8492-0076738ab74c-1e3bb79d.jpg');
  assert.equal(teaParty.camera, 'iPhone 15');
  assert.equal(teaParty.lens, '26mm');
  assert.equal(teaParty.settings, '1/257 · f/1.6 · ISO 50');
  assert.equal(teaParty.captureDate, '2025-08-08');
  assert.equal(teaParty.dateToConfirm, false);
  assert.ok(!teaParty.metadataNote);
  const pixel = get('ards-dog-show-35a-f8c66cd6.jpg');
  assert.equal(pixel.title, 'Pixel Perfect');
  assert.ok(pixel.caption.includes('Yakutian Laika'));
  assert.ok(!pixel.caption.toLowerCase().includes('only one'));
  assert.equal(pixel.place, 'Newtownards, Northern Ireland');
  assert.equal(get('dog-show-2024-7-e445c75f.jpg').title, 'Tremendous Toller');
  assert.equal(get('belfast-dog-show-2022-13-2a3a0924.jpg').title, 'Dog Tired');
  for (const image of ['dog-show-2024-7-e445c75f.jpg', 'belfast-dog-show-2022-13-2a3a0924.jpg']) assert.equal(get(image).place, 'Belfast Championship Dog Show, Eikon Exhibition Centre, Lisburn');
  assert.ok(get('belfast-dog-show-2022-13-2a3a0924.jpg').caption.includes('Hovawarts'));
  assert.ok(get('dd6062e3-a015-4710-b204-ed903a74923c-1-102-o-0ee9a098.jpg'), 'TT photo retained pending a replacement');
  assert.equal(get('dog-show-sept-2015-1-4-copy-21a8269d.jpg').title, 'Soulful Eyes');
  assert.ok(get('dog-show-sept-2015-1-4-copy-21a8269d.jpg').caption.includes('Matisse'));
  assert.equal(get('orca-boardwalk-e67dd548.jpg').place, 'Shaw’s Bridge');
  assert.equal(get('orca-boardwalk-e67dd548.jpg').camera, 'iPhone 12 Pro');
  assert.equal(get('orca-boardwalk-e67dd548.jpg').settings, '1/550 · f/1.6 · ISO 50');
  assert.equal(get('orca-boardwalk-e67dd548.jpg').title, 'Our Favourite Walk');
  assert.equal(get('orca-yellow-blanket-96dc1904.jpg').title, 'Yellow');
  assert.equal(get('orca-yellow-blanket-96dc1904.jpg').caption, 'That face card tho.');
  assert.ok(!get('orca-yellow-blanket-96dc1904.jpg').place, 'home location stays private');
  assert.equal(get('birds-of-prey-12-5e8709dc.jpg').title, 'Little Owl');
  assert.equal(get('birds-of-prey-12-5e8709dc.jpg').place, 'Hawk Walks NI, Ballyclare');
  assert.equal(get('porto-1-38d29bb0.jpg').title, 'Strolling Through the City');
  assert.ok(get('porto-1-38d29bb0.jpg').caption.includes('architecture everywhere'));
  assert.equal(get('hop-house-dog-day-16-2-b3605a63.jpg').title, 'Bluey IRL');
  assert.ok(get('hop-house-dog-day-16-2-b3605a63.jpg').caption.startsWith('An Australian Cattle Dog'));
  assert.equal(get('hop-house-doggy-day-46-04d4e07f.jpg').title, 'Dog Days');
  assert.equal(get('hop-house-doggy-day-46-04d4e07f.jpg').caption, 'I spent years working as an event photographer, and doggie events were always a treat. This dog day at the Hop House brought together breeds big and small — my kind of assignment.');
  assert.equal(get('puppy-orcs-3bec7b9b.jpg').title, 'Puppy Orcs');
  for (const image of ['hop-house-doggy-day-46-04d4e07f.jpg', 'hop-house-dog-day-16-2-b3605a63.jpg']) {
    assert.equal(get(image).place, 'Hop House, Bangor');
    assert.ok(get(image).caption.includes('Hop House'));
  }
  assert.ok(get('puppy-orcs-3bec7b9b.jpg').caption.includes('I think this was day two'));
  assert.ok(get('puppy-orcs-3bec7b9b.jpg').caption.includes('nine-week-old'));
});
