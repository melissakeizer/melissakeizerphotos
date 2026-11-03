import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webPhoto } from './web-media.mjs';

export async function filesBelow(root) {
  const files = [];
  async function visit(folder) {
    for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await visit(file);
      else files.push(file);
    }
  }
  await visit(root);
  return files;
}

const photoReferences = /\/(?:photos|videos)\/[^"'<>\\\n]*?\.(?:jpe?g|png|webp)(?=[\s"'<>\\?#&),]|$)/gi;

// Astro copies public wholesale, including local-only originals and stale dev
// caches. Rewrite lightbox/background/poster references too, then retain only
// referenced media in dist. Nothing is ever removed from public or the repository.
export function pruneResponsiveOutput() {
  return { name: 'responsive-photo-output', hooks: { 'astro:build:done': async ({ dir }) => {
    const root = fileURLToPath(dir);
    const files = await filesBelow(root);
    const documents = await Promise.all(files.filter(file => /\.(html|css|js)$/.test(file)).map(async file => ({ file, text: await fs.readFile(file, 'utf8') })));
    const sourceURLs = new Set(documents.flatMap(({ text }) => [...text.matchAll(photoReferences)].map(match => match[0])));
    const replacements = new Map();
    for (const url of sourceURLs) {
      const photo = await webPhoto(url);
      replacements.set(url, `/${photo.largest}`);
    }
    for (const document of documents) {
      const rewritten = document.text.replace(photoReferences, url => replacements.get(url) ?? url);
      if (rewritten !== document.text) await fs.writeFile(document.file, rewritten);
      document.text = rewritten;
    }
    const text = documents.map(document => document.text).join('\n');
    const generated = new Set([...text.matchAll(/\/((?:_media|_drawings)\/[a-f0-9-]+\.(?:jpg|svg))/g)].map(match => match[1]));
    for (const relative of generated) {
      const output = path.join(root, relative);
      await fs.mkdir(path.dirname(output), { recursive: true });
      await fs.copyFile(path.resolve('public', relative), output);
    }
    let removedBytes = 0;
    let removedFiles = 0;
    for (const file of files) {
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (path.basename(file) === '.DS_Store') { await fs.unlink(file); continue; }
      const media = /\.(jpe?g|png|webp|avif|gif|svg|mp4|webm|mov)$/i.test(relative);
      if (!media) continue;
      const referenced = text.includes(`/${relative}`) || text.includes(encodeURI(`/${relative}`));
      if (!referenced) {
        removedBytes += (await fs.stat(file)).size;
        await fs.unlink(file);
        removedFiles++;
      }
    }
    // Guard against regressions and leave useful evidence in local/CI build logs.
    const outputFiles = await filesBelow(root);
    const total = (await Promise.all(outputFiles.map(async file => (await fs.stat(file)).size))).reduce((a, b) => a + b, 0);
    console.log(`[media] Excluded ${removedFiles} unused/source/cache files (${(removedBytes / 1e6).toFixed(1)} MB) from dist only.`);
    console.log(`[media] Deployment output: ${total} bytes (${(total / 1e6).toFixed(1)} MB).`);
    if (total > 750_000_000) throw new Error('Deployment exceeds the 750 MB safety budget. Review media before uploading to Pages.');
  } } };
}
