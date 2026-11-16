import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Approved shared artwork: /previews/social-home-v2/ (v4 export), 1200 × 630.
// Homepage, archives and PhotoStream use this; individual stories supply a cover.
export const homepagePreview = '/social-home.jpg';
export async function socialImage(source) {
  const relative = decodeURIComponent(source).replace(/^\//, '');
  const input = path.resolve('public', relative);
  if (!input.startsWith(path.resolve('public') + path.sep)) throw new Error('Invalid social image path');
  const bytes = await fs.readFile(input);
  const key = createHash('sha256').update(bytes).update('social-1200x630-v1').digest('hex').slice(0, 24);
  const output = `social/${key}.jpg`;
  await fs.mkdir('public/social', { recursive: true });
  try { await fs.access(`public/${output}`); }
  catch { await sharp(bytes).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 90 }).toFile(`public/${output}`); }
  return `/${output}`;
}
