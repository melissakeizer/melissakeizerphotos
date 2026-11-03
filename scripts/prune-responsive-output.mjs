import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The dev cache can contain older variants. Ship only those referenced by this build.
export function pruneResponsiveOutput() {
  return { name: 'responsive-photo-output', hooks: { 'astro:build:done': async ({ dir }) => {
    const root = fileURLToPath(dir);
    const used = new Set();
    async function visit(folder) {
      for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
        const file = path.join(folder, entry.name);
        if (entry.isDirectory()) { if (entry.name !== '_responsive') await visit(file); }
        else if (entry.name.endsWith('.html')) {
          const html = await fs.readFile(file, 'utf8');
          for (const match of html.matchAll(/\/_responsive\/([a-f0-9]+-\d+\.jpg)/g)) used.add(match[1]);
        }
      }
    }
    await visit(root);
    const output = path.join(root, '_responsive');
    for (const name of await fs.readdir(output).catch(() => [])) {
      if (/^[a-f0-9]+-\d+\.jpg$/.test(name) && !used.has(name)) await fs.unlink(path.join(output, name));
    }
  } } };
}
