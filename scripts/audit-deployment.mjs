import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import sharp from 'sharp';
import { filesBelow } from './prune-responsive-output.mjs';

const root = path.resolve(process.argv[2] ?? 'dist');
const baseline = process.argv.find(arg => arg.startsWith('--compare='))?.slice(10);
const reportPath = process.argv.find(arg => arg.startsWith('--report='))?.slice(9);
const live = process.argv.find(arg => arg.startsWith('--live='))?.slice(7);
const verify = process.argv.includes('--verify');
const all = await filesBelow(root);
const rows = await Promise.all(all.map(async file => ({ file: path.relative(root, file).split(path.sep).join('/'), bytes: (await fs.stat(file)).size })));
const byDirectory = {}, byExtension = {}, duplicates = new Map();
for (const row of rows) {
  const directory = row.file.split('/').slice(0, row.file.startsWith('photos/') ? 2 : 1).join('/');
  const extension = path.extname(row.file).toLowerCase();
  byDirectory[directory] = (byDirectory[directory] ?? 0) + row.bytes;
  byExtension[extension] = (byExtension[extension] ?? 0) + row.bytes;
  if (/\.(jpe?g|png|svg|mp4)$/i.test(row.file)) {
    const digest = createHash('sha256').update(await fs.readFile(path.join(root, row.file))).digest('hex');
    const group = duplicates.get(digest) ?? [];
    group.push(row); duplicates.set(digest, group);
  }
}
const report = {
  totalBytes: rows.reduce((sum, row) => sum + row.bytes, 0), files: rows.length,
  rasterImageBytes: Object.entries(byExtension).filter(([ext]) => /\.(jpe?g|png|webp|avif|gif)$/.test(ext)).reduce((sum, [, bytes]) => sum + bytes, 0),
  vectorImageBytes: byExtension['.svg'] ?? 0, videoBytes: (byExtension['.mp4'] ?? 0) + (byExtension['.webm'] ?? 0),
  byDirectory: Object.fromEntries(Object.entries(byDirectory).sort((a, b) => b[1] - a[1])), byExtension,
  largestFiles: [...rows].sort((a, b) => b.bytes - a.bytes).slice(0, 25),
  duplicateGroups: [...duplicates.values()].filter(group => group.length > 1),
  mediaURLs: [], errors: [], pagesChecked: 0, imageElements: 0, videoElements: 0,
};
const fileSet = new Set(rows.map(row => row.file));
const references = new Set();
function reference(value, page) {
  if (!value || value.startsWith('#') || value.startsWith('data:')) return;
  const url = new URL(value, `https://melissakeizer.photos/${page}`);
  if (url.origin !== 'https://melissakeizer.photos') return;
  const relative = decodeURIComponent(url.pathname).slice(1);
  if (!/\.(jpe?g|png|webp|svg|mp4|webm|woff2|css|js|ico)$/i.test(relative)) return;
  references.add(url.pathname);
  if (!fileSet.has(relative)) report.errors.push(`${page}: missing ${relative}`);
}
function cssURLs(text, page) {
  for (const match of text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/g)) reference(match[2], page);
}
function elements(document) {
  const result = [];
  function walk(node) { if (node.tagName) result.push(node); for (const child of node.childNodes ?? []) walk(child); }
  walk(document); return result;
}
if (verify || baseline || live) {
  for (const row of rows.filter(row => row.file.endsWith('.html'))) {
    const text = await fs.readFile(path.join(root, row.file), 'utf8');
    const nodes = elements(parse(text));
    const imageLabels = [];
    const videoSources = [];
    report.pagesChecked++;
    for (const node of nodes) {
      const attributes = Object.fromEntries(node.attrs.map(attr => [attr.name, attr.value]));
      if (node.tagName === 'img') { report.imageElements++; imageLabels.push(attributes.alt ?? ''); }
      if (node.tagName === 'video') { report.videoElements++; videoSources.push(attributes.src ?? attributes['data-src']); }
      for (const key of ['src', 'poster', 'data-src']) reference(attributes[key], row.file);
      if (node.tagName === 'image' || node.tagName === 'link') reference(attributes.href, row.file);
      if (attributes.srcset) for (const candidate of attributes.srcset.split(',')) reference(candidate.trim().split(/\s+/)[0], row.file);
      if (attributes.style) cssURLs(attributes.style, row.file);
      if (node.tagName === 'style') cssURLs(node.childNodes.map(child => child.value ?? '').join(''), row.file);
    }
    if (baseline) {
      const previous = elements(parse(await fs.readFile(path.join(baseline, row.file), 'utf8')));
      const beforeLabels = previous.filter(node => node.tagName === 'img').map(node => node.attrs.find(attr => attr.name === 'alt')?.value ?? '');
      const beforeVideos = previous.filter(node => node.tagName === 'video').map(node => node.attrs.find(attr => attr.name === 'src' || attr.name === 'data-src')?.value);
      if (JSON.stringify(imageLabels) !== JSON.stringify(beforeLabels)) report.errors.push(`${row.file}: photograph order/count/labels changed`);
      if (JSON.stringify(videoSources) !== JSON.stringify(beforeVideos)) report.errors.push(`${row.file}: videos changed`);
    }
  }
  for (const row of rows.filter(row => row.file.endsWith('.css'))) cssURLs(await fs.readFile(path.join(root, row.file), 'utf8'), row.file);
  if (verify) {
    for (const row of rows.filter(row => /\.(jpe?g|png|webp)$/i.test(row.file))) {
      try {
        const metadata = await sharp(path.join(root, row.file)).metadata();
        if (!metadata.width || !metadata.height) throw new Error('No dimensions');
        if (row.file.startsWith('_media/') && Math.max(metadata.width, metadata.height) > 3201) report.errors.push(`${row.file}: exceeds resolution budget`);
      } catch (error) { report.errors.push(`${row.file}: ${error.message}`); }
    }
  }
  if (live) {
    const queue = [...references];
    await Promise.all(Array.from({ length: 10 }, async () => {
      while (queue.length) {
        const relative = queue.shift();
        try {
          const response = await fetch(new URL(relative, live), { method: 'HEAD', signal: AbortSignal.timeout(20000) });
          if (!response.ok) report.errors.push(`Live ${relative}: HTTP ${response.status}`);
        } catch (error) { report.errors.push(`Live ${relative}: ${error.message}`); }
      }
    }));
    console.log(`Checked ${references.size} live assets.`);
  }
}
report.mediaURLs = [...references].sort();
if (reportPath) {
  await fs.mkdir(path.dirname(path.resolve(reportPath)), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
}
const { mediaURLs, duplicateGroups, ...summary } = report;
console.log(JSON.stringify({ ...summary, referencedAssets: mediaURLs.length, duplicateGroups: duplicateGroups.length }, null, 2));
if (report.errors.length) process.exitCode = 1;
