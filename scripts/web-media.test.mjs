import { test } from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { webPhoto, drawingLayer } from './web-media.mjs';
import { pruneResponsiveOutput } from './prune-responsive-output.mjs';

test('web media preserves originals, orientation, responsive widths, deduplication and referenced-only output', async () => {
  const previous = process.cwd();
  const root = await fs.mkdtemp(path.join(tmpdir(), 'mk-web-media-test-'));
  process.chdir(root);
  try {
    await fs.mkdir('public/photos', { recursive: true });
    const original = await sharp({ create: { width: 4000, height: 2000, channels: 3, background: '#84aa67' } }).jpeg({ quality: 95 }).withMetadata({ orientation: 6 }).toBuffer();
    await fs.writeFile('public/photos/test.jpg', original);
    await fs.writeFile('public/photos/duplicate.jpg', original);
    await fs.writeFile('public/photos/unused.jpg', original);
    const photo = await webPhoto('photos/test.jpg');
    const duplicate = await webPhoto('photos/duplicate.jpg');
    assert.equal(photo.largest, duplicate.largest);
    assert.equal(photo.width, 1600); assert.equal(photo.height, 3200);
    for (const variant of photo.variants) {
      const metadata = await sharp('public/' + variant.path).metadata();
      assert.equal(metadata.width, variant.width);
      assert.equal(metadata.height, variant.width * 2);
      assert.equal(metadata.isProgressive, true);
    }
    await assert.rejects(webPhoto('../escape.jpg'), /Invalid photo path/);
    await assert.rejects(webPhoto('photos/%2e%2e/%2e%2e/escape.jpg'), /Invalid photo path/);
    const layer = await drawingLayer('<g><path d="M0 0h10v10z"/></g>', 10, 10);
    assert.match(await fs.readFile('public/' + layer, 'utf8'), /viewBox="0 0 10 10"/);
    const layerBytes = await fs.readFile('public/' + layer);
    const layerStat = await fs.stat('public/' + layer);
    const simultaneous = await Promise.all(Array.from({ length: 30 }, () => drawingLayer('<g><path d="M0 0h10v10z"/></g>', 10, 10)));
    assert.ok(simultaneous.every(result => result === layer));
    assert.deepEqual(await fs.readFile('public/' + layer), layerBytes);
    assert.equal((await fs.stat('public/' + layer)).mtimeMs, layerStat.mtimeMs, 'page renders do not rewrite an artwork file being served');
    assert.ok((await fs.readdir('public/_drawings')).every(file => file.endsWith('.svg')), 'no temporary files remain');
    await fs.mkdir('dist/photos', { recursive: true });
    await fs.copyFile('public/photos/test.jpg', 'dist/photos/test.jpg');
    await fs.copyFile('public/photos/unused.jpg', 'dist/photos/unused.jpg');
    await fs.writeFile('dist/index.html', `<img src="/${photo.variants[0].path}"><div data-src="/photos/test.jpg" style="background:url(&quot;/photos/test.jpg&quot;)"></div><svg><image href="/${layer}"/></svg>`);
    await pruneResponsiveOutput().hooks['astro:build:done']({ dir: pathToFileURL(root + '/dist/') });
    const html = await fs.readFile('dist/index.html', 'utf8');
    assert.ok(!html.includes('/photos/'));
    assert.match(html, new RegExp(photo.largest));
    await fs.access('dist/' + photo.largest);
    await fs.access('dist/' + photo.variants[0].path);
    await fs.access('dist/' + layer);
    await assert.rejects(fs.access('dist/photos/test.jpg'));
    await assert.rejects(fs.access('dist/photos/unused.jpg'));
    assert.deepEqual(await fs.readFile('public/photos/test.jpg'), original);
    assert.deepEqual(await fs.readFile('public/photos/unused.jpg'), original);
  } finally { process.chdir(previous); }
});
