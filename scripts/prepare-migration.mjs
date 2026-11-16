import { promises as fs } from 'node:fs';
const rows = ['candidate_exposure_url,new_url,status'];
for (const file of await fs.readdir('src/content/stories')) {
  if (!file.endsWith('.md')) continue;
  const text = await fs.readFile(`src/content/stories/${file}`, 'utf8');
  const slug = file.slice(0, -3);
  const draft = /^draft:\s*true\s*$/m.test(text);
  rows.push(`https://melissakeizer.exposure.co/${slug},https://melissakeizer.photos/stories/${slug}/,${draft ? 'DRAFT — do not redirect yet' : 'candidate — verify old URL and content'}`);
}
await fs.writeFile('docs/exposure-url-map.csv', rows.join('\n') + '\n');
console.log(`${rows.length - 1} candidate story mappings prepared; not an authoritative Exposure inventory.`);
