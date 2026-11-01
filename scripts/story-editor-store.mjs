import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const pendingSaves = new Map();

export function cleanSections(sections) {
  return sections.map(section => {
    const saved = { title: section.title?.trim() || null, text: section.text.trim(), photos: section.photos };
    if (section.layout) saved.layout = section.layout;
    if (section.caption?.trim()) saved.caption = section.caption.trim();
    return saved;
  });
}

export async function saveStorySections(root, slug, sections, baseSections) {
  const storyPath = path.join(root, 'src/content/stories', `${slug}.md`);
  const previousSave = pendingSaves.get(storyPath) ?? Promise.resolve();
  let release;
  const lock = new Promise(resolve => { release = resolve; });
  const queued = previousSave.then(() => lock);
  pendingSaves.set(storyPath, queued);
  await previousSave;
  try {
    const source = await fs.readFile(storyPath, 'utf8');
    const frontmatter = source.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/)?.[1];
    if (!frontmatter) throw new Error('Story frontmatter could not be preserved.');
    const currentSections = cleanSections(JSON.parse(source.slice(frontmatter.length).trim()));
    const cleaned = cleanSections(sections);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    if (baseSections && !same(cleanSections(baseSections), currentSections) && !same(cleaned, currentSections)) {
      const error = new Error('This story changed in another tab. Your draft is safe; reload and review it before saving again.');
      error.status = 409;
      throw error;
    }
    const savedAt = new Date().toISOString();
    if (same(cleaned, currentSections)) return { ok: true, savedAt, sections: currentSections };

    const backupDirectory = path.join(root, '.local/story-editor-backups', slug);
    await fs.mkdir(backupDirectory, { recursive: true });
    await fs.writeFile(path.join(backupDirectory, `${savedAt.replaceAll(':', '-')}-${randomUUID()}.md`), source, { flag: 'wx' });
    const serialized = JSON.stringify(cleaned, null, 2).replace(
      /    "photos": \[\n([\s\S]*?)\n    \]/g,
      (_match, photoLines) => `    "photos": [${photoLines.split('\n').map(line => line.trim().replace(/,$/, '')).join(', ')}]`,
    );
    const nextSource = `${frontmatter}${serialized}\n`;
    const temporaryPath = path.join(path.dirname(storyPath), `.editor-${slug}-${randomUUID()}.tmp`);
    try {
      await fs.writeFile(temporaryPath, nextSource, { flag: 'wx' });
      await fs.rename(temporaryPath, storyPath);
    } finally {
      await fs.unlink(temporaryPath).catch(() => {});
    }
    if (await fs.readFile(storyPath, 'utf8') !== nextSource) throw new Error('The saved story could not be verified. Your local draft is still available.');
    return { ok: true, savedAt, sections: cleaned };
  } finally {
    release();
    if (pendingSaves.get(storyPath) === queued) pendingSaves.delete(storyPath);
  }
}
