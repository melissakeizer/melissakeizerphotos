import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const storiesDir = join(root, 'src/content/stories');
const stories = readdirSync(storiesDir).filter((file) => file.endsWith('.md') && !file.startsWith('_'));
const errors = [];

for (const file of stories) {
  const path = join(storiesDir, file);
  const source = readFileSync(path, 'utf8');
  const label = file.replace(/\.md$/, '');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatter) {
    errors.push(`${label}: missing frontmatter.`);
    continue;
  }

  const fields = frontmatter[1];
  const type = fields.match(/^type: "(story|gallery)"$/m)?.[1];

  if (!/^title: ".+"$/m.test(fields)) errors.push(`${label}: missing title.`);
  if (!type) errors.push(`${label}: choose type "story" or "gallery".`);
  if (!/^coverImage: "\/photos\/.+"$/m.test(fields)) errors.push(`${label}: missing local cover image.`);
  if (type === 'gallery' && !/^galleryLayout: "(fitted-grid|horizontal)"$/m.test(fields)) {
    errors.push(`${label}: gallery posts need galleryLayout "fitted-grid" or "horizontal".`);
  }
  if (type === 'story' && /^galleryLayout:/m.test(fields)) {
    errors.push(`${label}: story posts must not have galleryLayout.`);
  }

  for (const match of source.matchAll(/"(\/photos\/[^"\n]+)"/g)) {
    if (!existsSync(join(root, 'public', match[1]))) errors.push(`${label}: missing image ${match[1]}.`);
  }
}

if (errors.length) {
  console.error(`Content check failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Content check passed for ${stories.length} posts.`);
