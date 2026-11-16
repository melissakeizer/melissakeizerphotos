import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import redirects from '../ops/cloudflare/redirect-map.mjs';
import { handleRequest } from '../ops/cloudflare/worker.mjs';

test('all approved mappings work directly over both schemes and legacy hostnames', async () => {
  const csv = (await fs.readFile(new URL('../docs/bigwetfish-redirects.csv', import.meta.url), 'utf8')).trim().split('\n').slice(1);
  assert.equal(csv.length, 53);
  assert.equal(Object.keys(redirects).length, 53);
  for (const row of csv) {
    const [from, expected] = row.split(',');
    const source = new URL(from);
    assert.equal(redirects[source.pathname + source.search], expected);
    assert.equal(new URL(expected).hostname, 'melissakeizer.photos');
    for (const scheme of ['http', 'https']) for (const host of ['melissakeizerphotography.com', 'www.melissakeizerphotography.com']) {
      const response = handleRequest(new Request(`${scheme}://${host}${source.pathname}${source.search}`));
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('Location'), expected);
      assert.equal(await response.text(), '');
    }
  }
});
test('trailing slashes and HEAD requests preserve the mapped destination', async () => {
  for (const [path, expected] of Object.entries(redirects)) {
    if (path.includes('?')) continue;
    for (const method of ['GET', 'HEAD']) {
      const response = handleRequest(new Request(`https://www.melissakeizerphotography.com${path === '/' ? '/' : path + '/'}`, { method }));
      assert.equal(response.status, 301); assert.equal(response.headers.get('Location'), expected);
      assert.equal(await response.text(), '');
    }
  }
});
test('archive page queries take precedence and all private query values are dropped', () => {
  const response = handleRequest(new Request('https://melissakeizerphotography.com/?token=private&page=2'));
  assert.equal(response.headers.get('Location'), 'https://melissakeizer.photos/posts/');
  const story = handleRequest(new Request('https://melissakeizerphotography.com/finn-pointer-puppy?email=private'));
  assert.equal(story.headers.get('Location'), 'https://melissakeizer.photos/stories/finn-pointer-puppy/');
});
test('retired galleries, drafts, unknown pages and prototype names return real 404s', async () => {
  for (const path of ['/a-few-favourites', '/from-the-front-row', '/not-a-story', '/toString', '/__proto__']) {
    const response = handleRequest(new Request(`https://melissakeizerphotography.com${path}`));
    assert.equal(response.status, 404); assert.equal(response.headers.get('Location'), null);
  }
  assert.equal(Object.keys(redirects).filter(path => /favourites|front-row/.test(path)).length, 0);
});
test('preview is testable without attaching live DNS and new-site hosts are rejected', () => {
  assert.equal(handleRequest(new Request('https://melissa-photography-redirects.example.workers.dev/finn-pointer-puppy')).status, 301);
  for (const host of ['melissakeizer.photos', 'melissakeizer.com', 'example.com', 'fakeworkers.dev']) {
    assert.equal(handleRequest(new Request(`https://${host}/`)).status, 404);
  }
});
test('non-navigation methods are rejected and the old site remains crawlable', async () => {
  const response = handleRequest(new Request('https://melissakeizerphotography.com/', { method: 'POST', body: 'private=value' }));
  assert.equal(response.status, 405); assert.equal(response.headers.get('Location'), null);
  const robots = handleRequest(new Request('https://melissakeizerphotography.com/robots.txt'));
  assert.equal(robots.status, 200); assert.equal(await robots.text(), 'User-agent: *\nAllow: /\n');
});
