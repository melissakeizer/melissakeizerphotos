import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import sharp from 'sharp';
import { filesBelow } from './prune-responsive-output.mjs';
export function nodes(root) { const out = []; function visit(n) { if (n.tagName) out.push(n); (n.childNodes || []).forEach(visit); } visit(root); return out; }
export const attrs = n => Object.fromEntries((n.attrs || []).map(a => [a.name, a.value]));
export const textOf = n => (n.childNodes || []).map(c => c.value || textOf(c)).join('');
const xml = s => String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function launchOutput() {
  return { name: 'launch-output', hooks: { 'astro:build:done': async ({ dir }) => {
    const root = fileURLToPath(dir);
    // Non-photographic UI PNGs can contain editor/XMP records too. Strip only
    // deployment copies; source artwork and its pixels stay intact.
    for (const file of (await filesBelow(root)).filter(f => f.endsWith('.png'))) {
      const metadata = await sharp(file).metadata();
      if (metadata.exif || metadata.xmp || metadata.iptc) await fs.writeFile(file, await sharp(file).png().toBuffer());
    }
    const entries = [];
    for (const file of (await filesBelow(root)).filter(f => f.endsWith('.html'))) {
      let html = await fs.readFile(file, 'utf8');
      const relative = path.relative(root, file).replaceAll(path.sep, '/');
      const route = '/' + relative.replace(/index\.html$/, '');
      const parsed = nodes(parse(html));
      const redirect = parsed.some(n => attrs(n)['http-equiv']?.toLowerCase() === 'refresh');
      const privatePage = /^(?:previews\/|typefaces\/|content-board\/|photostream-arranger\/|field-notes-b\/|404\.html)/.test(relative);
      if (privatePage || redirect) {
        html = html.replace(/<meta\s+name="robots"[^>]*>/gi, '');
        html = html.replace('</head>', '<meta name="robots" content="noindex, follow"></head>');
        await fs.writeFile(file, html);
        continue;
      }
      const images = [...new Set(parsed.filter(n => n.tagName === 'img' && attrs(n).alt && !attrs(n).src?.startsWith('data:')).map(n => attrs(n).src).filter(Boolean))];
      entries.push(`<url><loc>https://melissakeizer.photos${xml(route)}</loc>${images.map(src => `<image:image><image:loc>${xml(new URL(src, 'https://melissakeizer.photos').href)}</image:loc></image:image>`).join('')}</url>`);
    }
    await fs.writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`);
    await fs.writeFile(path.join(root, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://melissakeizer.photos/sitemap.xml\n');
    console.log(`[SEO] Sitemap: ${entries.length} public pages, with image URLs; private tools and redirects excluded.`);
  } } };
}
