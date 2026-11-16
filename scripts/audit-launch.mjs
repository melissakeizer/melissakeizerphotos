import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'parse5';
import { nodes, attrs, textOf } from './launch-output.mjs';
import { filesBelow } from './prune-responsive-output.mjs';
const root = path.resolve(process.argv[2] || 'dist');
const files = await filesBelow(root);
const report = { pages: 0, indexable: 0, errors: [], warnings: [], metadataImages: [], placeholders: [], headings: [], externalLinks: [], routes: [] };
const titles = new Map(), descriptions = new Map();
const docs = new Map();
for (const file of files.filter(f => f.endsWith('.html'))) {
  const text = await fs.readFile(file, 'utf8');
  docs.set(file, { text, elements: nodes(parse(text)) });
}
for (const [file, { text, elements }] of docs) {
  const relative = path.relative(root, file);
  const route = '/' + relative.replace(/index\.html$/, '');
  report.pages++;
  const meta = (key, attribute = 'name') => attrs(elements.find(n => n.tagName === 'meta' && attrs(n)[attribute] === key) || {}).content;
  const redirect = elements.some(n => attrs(n)['http-equiv']?.toLowerCase() === 'refresh');
  const noindex = meta('robots')?.includes('noindex');
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_)[a-zA-Z0-9_]{30,}|AKIA[A-Z0-9]{16}/.test(text)) report.errors.push(`${route}: possible credential; inspect privately`);
  if (redirect || noindex) continue;
  report.indexable++; report.routes.push(route);
  const title = textOf(elements.find(n => n.tagName === 'title') || {});
  const description = meta('description');
  for (const [value, map, label] of [[title, titles, 'title'], [description, descriptions, 'description']]) {
    if (!value) report.errors.push(`${route}: missing ${label}`);
    else { const group = map.get(value) || []; group.push(route); map.set(value, group); }
  }
  if (!elements.some(n => n.tagName === 'link' && attrs(n).rel === 'canonical' && attrs(n).href === `https://melissakeizer.photos${route}`)) report.errors.push(`${route}: canonical incorrect`);
  if (elements.filter(n => n.tagName === 'h1').length !== 1) report.warnings.push(`${route}: expected one h1`);
  let level = 0;
  for (const n of elements.filter(n => /^h[1-6]$/.test(n.tagName))) {
    const next = Number(n.tagName.slice(1));
    if (level && next > level + 1) report.headings.push(`${route}: h${level} to h${next}: ${textOf(n)}`);
    level = next;
  }
  const social = meta('og:image', 'property');
  if (!social?.startsWith('https://melissakeizer.photos/')) report.errors.push(`${route}: missing absolute social image`);
  else {
    const socialFile = path.join(root, new URL(social).pathname);
    try { const m = await sharp(socialFile).metadata(); if (m.width !== 1200 || m.height !== 630) report.errors.push(`${route}: social image dimensions`); }
    catch { report.errors.push(`${route}: missing social image`); }
  }
  for (const n of elements) {
    const a = attrs(n);
    if (n.tagName === 'script' && a.type === 'application/ld+json') { try { JSON.parse(textOf(n)); } catch { report.errors.push(`${route}: invalid JSON-LD`); } }
    if (n.tagName === 'img' && a.alt === undefined) report.errors.push(`${route}: missing alt attribute ${a.src}`);
    if (n.tagName !== 'a' || !a.href || /^(mailto:|tel:|javascript:)/.test(a.href)) continue;
    const url = new URL(a.href, `https://melissakeizer.photos${route}`);
    if (url.origin !== 'https://melissakeizer.photos') { report.externalLinks.push(url.href); continue; }
    let target = path.join(root, decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
    if (!files.includes(target) && files.includes(path.join(target, 'index.html'))) target = path.join(target, 'index.html');
    if (!files.includes(target)) { report.errors.push(`${route}: broken link ${a.href}`); continue; }
    if (url.hash && docs.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!docs.get(target).elements.some(n => attrs(n).id === id || attrs(n).name === id)) report.errors.push(`${route}: broken fragment ${a.href}`);
    }
  }
  if (/YOUR_FORM_ID|Write your story here|\bTODO\b|\bLorem ipsum\b/i.test(text)) report.placeholders.push(route);
}
for (const [value, routes] of titles) if (routes.length > 1) report.errors.push(`Duplicate title: ${routes.join(', ')}`);
for (const [value, routes] of descriptions) if (routes.length > 1) report.warnings.push(`Duplicate description: ${routes.join(', ')}`);
for (const file of files.filter(f => /\.(jpe?g|png|webp)$/i.test(f))) {
  const meta = await sharp(file).metadata();
  if (meta.exif || meta.xmp || meta.iptc) report.metadataImages.push(path.relative(root, file));
}
report.externalLinks = [...new Set(report.externalLinks)];
await fs.mkdir('.local', { recursive: true });
await fs.writeFile('.local/launch-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
