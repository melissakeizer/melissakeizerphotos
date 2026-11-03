import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const pending = new Map<string, Promise<{ src: string; srcset: string; width: number; height: number }>>();
let running = 0;
const waiting: Array<() => void> = [];
async function convert(file: string, width: number, output: string) {
  if (running >= 3) await new Promise<void>(resolve => waiting.push(resolve));
  running++;
  try { await sharp(file).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 88, progressive: false }).toFile(output); }
  finally { running--; waiting.shift()?.(); }
}
// Cache by source identity, not just filename, so replacing a photo invalidates variants.
export function responsivePhoto(src: string) {
  if (!pending.has(src)) pending.set(src, prepare(src));
  return pending.get(src)!;
}
async function prepare(src: string) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const relative = decodeURIComponent(src.startsWith(base) ? src.slice(base.length) : src.replace(/^\//, ''));
  const file = path.resolve('public', relative);
  if (!file.startsWith(path.resolve('public') + path.sep)) throw new Error('Invalid photo path');
  const stat = await fs.stat(file);
  const metadata = await sharp(file).metadata();
  const rotated = (metadata.orientation ?? 1) >= 5;
  const width = (rotated ? metadata.height : metadata.width)!;
  const height = (rotated ? metadata.width : metadata.height)!;
  // Older Exposure exports are already modest. Avoid making larger duplicate JPEGs.
  if (stat.size <= 600 * 1024 && width <= 2400) return { src, srcset: `${src} ${width}w`, width, height };
  const key = createHash('sha256').update(`${relative}:${stat.size}:${stat.mtimeMs}:jpeg88-v1`).digest('hex').slice(0, 18);
  const widths = [640, 1280, 2400].filter(w => w < width);
  const variants = [];
  for (const w of widths) {
    const name = `${key}-${w}.jpg`;
    const output = path.resolve('public/_responsive', name);
    await fs.mkdir(path.dirname(output), { recursive: true });
    try { await fs.access(output); }
    catch { await convert(file, w, output); }
    if (import.meta.env.PROD) {
      await fs.mkdir(path.resolve('dist/_responsive'), { recursive: true });
      await fs.copyFile(output, path.resolve('dist/_responsive', name));
    }
    variants.push({ url: `${base}_responsive/${name}`, width: w });
  }
  // The original supplies the largest choice without storing an identical-size copy.
  variants.push({ url: src, width });
  return { src: variants[Math.min(1, variants.length - 1)].url, srcset: variants.map(v => `${v.url} ${v.width}w`).join(', '), width, height };
}
