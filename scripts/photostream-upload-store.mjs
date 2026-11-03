import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { photoShape } from '../src/lib/photo-shape.mjs';
import { cameraDetails } from './photo-exif.mjs';

export const maxPhotoUploadBytes = 50 * 1024 * 1024;
const inFlight = new Map();
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const directory = (root, test = false) => path.resolve(root, '.local/photostream-uploads', test ? 'test' : 'library');
const validId = id => typeof id === 'string' && /^[a-f0-9]{40}$/.test(id);
const fail = (message, status = 400) => Object.assign(new Error(message), { status });

// Read only the bounded TIFF tags needed for capture dates, never file mtime.
export function captureDate(exif) {
  try {
    if (!Buffer.isBuffer(exif)) return null;
    const base = exif.subarray(0, 6).equals(Buffer.from('Exif\0\0')) ? 6 : 0;
    const little = exif.toString('ascii', base, base + 2) === 'II';
    if (!little && exif.toString('ascii', base, base + 2) !== 'MM') return null;
    const u16 = offset => little ? exif.readUInt16LE(offset) : exif.readUInt16BE(offset);
    const u32 = offset => little ? exif.readUInt32LE(offset) : exif.readUInt32BE(offset);
    if (u16(base + 2) !== 42) return null;
    const entries = relative => {
      const offset = base + relative, count = Math.min(u16(offset), 512), tags = new Map();
      for (let i = 0; i < count; i++) {
        const p = offset + 2 + i * 12;
        if (p + 12 > exif.length) break;
        tags.set(u16(p), { type: u16(p + 2), count: u32(p + 4), p });
      }
      return tags;
    };
    const root = entries(u32(base + 4)), pointer = root.get(0x8769);
    const detail = pointer ? entries(u32(pointer.p + 8)) : new Map();
    for (const tag of [detail.get(0x9003), detail.get(0x9004), root.get(0x0132)]) {
      if (!tag || tag.type !== 2 || tag.count < 10 || tag.count > 128) continue;
      const p = tag.count <= 4 ? tag.p + 8 : base + u32(tag.p + 8);
      if (p < base || p + tag.count > exif.length) continue;
      const match = exif.toString('ascii', p, p + tag.count).match(/^(\d{4}):(\d{2}):(\d{2})/);
      if (!match) continue;
      const [, year, month, day] = match, date = new Date(Date.UTC(+year, +month - 1, +day));
      if (+year < 1900 || +year > 2100 || date.getUTCFullYear() !== +year || date.getUTCMonth() !== +month - 1 || date.getUTCDate() !== +day) continue;
      return { date: `${+day} ${months[+month - 1]} ${year}`, dateISO: `${year}-${month}-${day}`, dateSource: 'EXIF capture date' };
    }
  } catch { /* Missing/malformed EXIF must not reject an otherwise valid image. */ }
  return null;
}

export async function listPhotoUploads(root, test = false) {
  const folder = directory(root, test);
  let entries;
  try { entries = await fs.readdir(folder, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const photos = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !validId(entry.name)) continue;
    let record;
    try { record = JSON.parse(await fs.readFile(path.join(folder, entry.name, 'photo.json'), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (record.id !== entry.name || record.image !== `upload:${entry.name}`) throw fail('An upload record could not be read. Your originals are still safe.', 500);
    photos.push(record);
  }
  return photos.sort((a, b) => a.importedAt.localeCompare(b.importedAt));
}

export async function savePhotoUpload(root, bytes, originalName, test = false) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) throw fail('Choose a photo to upload.');
  if (bytes.length > maxPhotoUploadBytes) throw fail('This photo is over 50 MB. Export a smaller copy and try again.', 413);
  const id = createHash('sha256').update(bytes).digest('hex').slice(0, 40), folder = path.join(directory(root, test), id);
  const work = async () => {
    try { return { photo: JSON.parse(await fs.readFile(path.join(folder, 'photo.json'), 'utf8')), duplicate: true }; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    let metadata, preview;
    try {
      const input = sharp(bytes, { limitInputPixels: 80_000_000, failOn: 'error' });
      metadata = await input.metadata();
      if (!['jpeg','png','webp','tiff','heif'].includes(metadata.format) || !metadata.width || !metadata.height || (metadata.pages || 1) > 1) throw new Error('Unsupported photo');
      preview = await input.rotate().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    } catch { throw fail('This file could not be read as a photo. Try a JPEG, PNG, WebP, single-page TIFF or AVIF. For HEIC/RAW files, export a JPEG first.'); }
    const extension = ({ jpeg: 'jpg', png: 'png', webp: 'webp', tiff: 'tif', heif: metadata.compression === 'av1' ? 'avif' : 'heic' })[metadata.format];
    const name = path.basename(String(originalName || 'Photo').replace(/\\/g, '/')).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180) || 'Photo';
    const stem = name.replace(/\.[^.]+$/, ''), slug = stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'photo';
    const rotated = (metadata.orientation || 1) >= 5, width = rotated ? metadata.height : metadata.width, height = rotated ? metadata.width : metadata.height;
    const record = { id, image: `upload:${id}`, upload: true, originalName: name, title: stem.replace(/[-_]+/g, ' '),
      shape: photoShape(width, height), width, height,
      ...(captureDate(metadata.exif) || { date: 'Date unknown', dateISO: '', dateSource: 'No capture date in file' }),
      ...cameraDetails(metadata.exif),
      importedAt: new Date().toISOString(), proposedFilename: `${slug}-${id.slice(0, 8)}.${extension}`,
      sourcePath: path.relative(root, path.join(folder, `original.${extension}`)).split(path.sep).join('/') };
    await fs.mkdir(folder, { recursive: true });
    // Content-addressed originals are never overwritten; duplicate uploads reuse them.
    for (const [name, content] of [[`original.${extension}`, bytes], ['preview.jpg', preview]]) {
      try { await fs.writeFile(path.join(folder, name), content, { flag: 'wx' }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    const temporary = path.join(folder, `photo-${randomUUID()}.tmp`);
    await fs.writeFile(temporary, JSON.stringify(record, null, 2) + '\n');
    await fs.rename(temporary, path.join(folder, 'photo.json'));
    return { photo: record, duplicate: false };
  };
  if (inFlight.has(folder)) return { ...(await inFlight.get(folder)), duplicate: true };
  const pending = work(); inFlight.set(folder, pending);
  try { return await pending; } finally { inFlight.delete(folder); }
}

export function uploadPhotoForBrowser(record, base = '/', test = false) {
  // Reclassify old upload records for display without editing stored metadata,
  // originals or the user's persisted plan.
  return { ...record, shape: photoShape(record.width, record.height), src: `${base.replace(/\/?$/, '/')}__photostream-uploads/${record.id}/preview.jpg${test ? '?test=1' : ''}` };
}
export function previewFile(root, id, test = false) {
  if (!validId(id)) throw fail('Photo not found.', 404);
  return path.join(directory(root, test), id, 'preview.jpg');
}
