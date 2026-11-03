import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// A generous high-DPI/lightbox copy, without enlarging or cropping. Originals
// stay untouched in public/photos; only referenced web copies are deployed.
export const MAX_PHOTO_EDGE = 3200;
const pending = new Map();
let running = 0;
const waiting = [];
async function limited(task) {
  if (running >= 3) await new Promise(resolve => waiting.push(resolve));
  running++;
  try { return await task(); }
  finally { running--; waiting.shift()?.(); }
}

export async function webPhoto(relative) {
  const clean = decodeURIComponent(relative.replace(/^\//, ''));
  if (!/\.(jpe?g|png|webp)$/i.test(clean) || !path.resolve('public', clean).startsWith(path.resolve('public') + path.sep)) throw new Error(`Invalid photo path: ${relative}`);
  const stat = await fs.stat(path.resolve('public', clean));
  const identity = `${clean}:${stat.size}:${stat.mtimeMs}`;
  if (!pending.has(identity)) pending.set(identity, prepare(clean));
  return pending.get(identity);
}

async function prepare(relative) {
  const input = await fs.readFile(path.resolve('public', relative));
  const metadata = await sharp(input).metadata();
  const rotated = (metadata.orientation ?? 1) >= 5;
  const originalWidth = rotated ? metadata.height : metadata.width;
  const originalHeight = rotated ? metadata.width : metadata.height;
  const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(originalWidth, originalHeight));
  const width = Math.round(originalWidth * scale);
  const height = Math.round(originalHeight * scale);
  const key = createHash('sha256').update(input).update('web-mozjpeg88-progressive-edge3200-v2').digest('hex').slice(0, 24);
  // Most older gallery exports are 1600px already: one 800px copy covers tablets
  // and small cards without storing three near-duplicate encodings per photo.
  const widths = [...[800, 1600, 2400].filter(w => w <= width / 1.25), width];
  const variants = [];
  for (const w of widths) {
    const relativeOutput = `_media/${key}-${w}.jpg`;
    const output = path.resolve('public', relativeOutput);
    await fs.mkdir(path.dirname(output), { recursive: true });
    try { await fs.access(output); }
    catch {
      await limited(async () => {
        const encoded = await sharp(input).rotate().resize({ width: w, withoutEnlargement: true })
          .jpeg({ quality: 88, mozjpeg: true, progressive: true, chromaSubsampling: w === width && metadata.chromaSubsampling === '4:4:4' ? '4:4:4' : '4:2:0' }).toBuffer();
        const unchanged = w === originalWidth && metadata.format === 'jpeg' && (!metadata.orientation || metadata.orientation === 1) && metadata.isProgressive;
        await fs.writeFile(output, unchanged && input.length < encoded.length ? input : encoded);
      });
    }
    variants.push({ path: relativeOutput, width: w });
  }
  return { variants, largest: variants.at(-1).path, width, height, originalWidth, originalHeight };
}

export async function drawingLayer(artwork, width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${artwork}</svg>`;
  const key = createHash('sha256').update(svg).digest('hex').slice(0, 24);
  const relative = `_drawings/${key}.svg`;
  await fs.mkdir(path.resolve('public/_drawings'), { recursive: true });
  await fs.writeFile(path.resolve('public', relative), svg);
  return relative;
}
