import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { saveStorySections } from './story-editor-store.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mkp-editor-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'src/content/stories');
  await fs.mkdir(directory, { recursive: true });
  const sections = [{ title: 'Original', text: '<p>Original copy.</p>', photos: ['/photos/test.jpg'], layout: 'stacked' }];
  const frontmatter = '---\ntitle: "Save test"\ncustom: "Preserve this metadata"\n---\n';
  const source = frontmatter + JSON.stringify(sections) + '\n';
  const storyPath = path.join(directory, 'save-test.md');
  await fs.writeFile(storyPath, source);
  return { root, directory, sections, frontmatter, source, storyPath };
}

test('writes verified sections, preserves metadata and backs up the previous file', async t => {
  const f = await fixture(t);
  const next = [{ ...f.sections[0], text: '<p>My rewritten copy, with “quotes” &amp; punctuation.</p>', caption: 'A new caption' }];
  const result = await saveStorySections(f.root, 'save-test', next, f.sections);
  assert.deepEqual(result.sections, next);
  const saved = await fs.readFile(f.storyPath, 'utf8');
  assert.ok(saved.startsWith(f.frontmatter));
  assert.deepEqual(JSON.parse(saved.slice(f.frontmatter.length)), next);
  const backups = path.join(f.root, '.local/story-editor-backups/save-test');
  const files = await fs.readdir(backups);
  assert.equal(files.length, 1);
  assert.equal(await fs.readFile(path.join(backups, files[0]), 'utf8'), f.source);
  assert.deepEqual(await fs.readdir(f.directory), ['save-test.md']);
});

test('rejects an older tab without replacing newer saved copy', async t => {
  const f = await fixture(t);
  const first = [{ ...f.sections[0], text: '<p>Newer saved copy.</p>' }];
  await saveStorySections(f.root, 'save-test', first, f.sections);
  await assert.rejects(saveStorySections(f.root, 'save-test', [{ ...f.sections[0], text: '<p>Stale tab.</p>' }], f.sections), error => error.status === 409);
  assert.ok((await fs.readFile(f.storyPath, 'utf8')).includes('Newer saved copy.'));
  // A retry after an interrupted response succeeds without creating another backup.
  await saveStorySections(f.root, 'save-test', first, f.sections);
  assert.equal((await fs.readdir(path.join(f.root, '.local/story-editor-backups/save-test'))).length, 1);
});

test('serializes simultaneous saves so the second stale edit cannot win', async t => {
  const f = await fixture(t);
  const results = await Promise.allSettled([
    saveStorySections(f.root, 'save-test', [{ ...f.sections[0], text: '<p>First tab.</p>' }], f.sections),
    saveStorySections(f.root, 'save-test', [{ ...f.sections[0], text: '<p>Second tab.</p>' }], f.sections),
  ]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].status, 'rejected');
  assert.equal(results[1].reason.status, 409);
});
