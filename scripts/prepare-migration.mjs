import { promises as fs } from 'node:fs';
const inventory = JSON.parse(await fs.readFile('docs/exposure-public-inventory.json', 'utf8'));
const observed = new Map(inventory.stories.map(story => [new URL(story.url).pathname.slice(1), story]));
const rows = ['custom_domain_url,exposure_subdomain_url,new_url,legacy_listing,new_site_state,redirect_status,legacy_photo_ids'];
const redirects = [
  '# PREPARATION ONLY — not installed. Review the migration checklist before use.',
  '# Apache 2.4 / mod_rewrite, in a dedicated legacy-domain document root.',
  '# Both HTTP and HTTPS vhosts must serve this root; TLS for apex and www is required.',
  '# Never install this on melissakeizer.photos. Unmatched paths remain real 404s.',
  'RewriteEngine On',
  'RewriteCond %{HTTP_HOST} !^(www\\.)?melissakeizerphotography\\.com(:[0-9]+)?$ [NC]',
  'RewriteRule ^ - [L]',
  'RewriteRule ^\\.well-known/acme-challenge/ - [L]',
  '# Archive pagination changed from 9 to 20 stories/page; send to the archive.',
  'RewriteCond %{QUERY_STRING} (^|&)page=[1-5](&|$)',
  'RewriteRule ^$ https://melissakeizer.photos/posts/ [R=301,L,QSD]',
  'RewriteRule ^$ https://melissakeizer.photos/ [R=301,L,QSD]',
  'RewriteRule ^categories/?$ https://melissakeizer.photos/posts/ [R=301,L,QSD]',
  'RewriteRule ^categories/travel/?$ https://melissakeizer.photos/categories/adventures/ [R=301,L,QSD]',
  'RewriteRule ^categories/(animals|adventures|pet-sessions)/?$ https://melissakeizer.photos/categories/$1/ [R=301,L,QSD]',
  'RewriteRule ^site/contact/?$ https://melissakeizer.photos/contact/ [R=301,L,QSD]',
  '# Story rules below are limited to public legacy stories also published locally.',
];
let ready = 0;
for (const file of (await fs.readdir('src/content/stories')).sort()) {
  if (!file.endsWith('.md')) continue;
  const text = await fs.readFile(`src/content/stories/${file}`, 'utf8');
  const slug = file.slice(0, -3);
  const draft = /^draft:\s*true\s*$/m.test(text);
  const old = observed.get(slug);
  const status = draft ? 'HOLD — unpublished destination' : old ? 'candidate — content and cutover review required' : 'HOLD — not seen in public legacy archive';
  rows.push(`https://www.melissakeizerphotography.com/${slug},https://melissakeizer.exposure.co/${slug},https://melissakeizer.photos/stories/${slug}/,${old ? 'observed 2026-11-16' : 'not observed'},${draft ? 'draft' : 'published'},${status},${old?.photoIds ?? ''}`);
  if (old && !draft) {
    await fs.access(`dist/stories/${slug}/index.html`);
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    redirects.push(`RewriteRule ^${escaped}/?$ https://melissakeizer.photos/stories/${slug}/ [R=301,L,QSD]`);
    ready++;
  }
}
await fs.writeFile('docs/exposure-url-map.csv', rows.join('\n') + '\n');
await fs.writeFile('docs/exposure-redirects.apache.conf.example', redirects.join('\n') + '\n');
console.log(`${rows.length - 1} story rows cover both legacy URL forms; ${ready} published legacy destinations verified in dist. Nothing installed.`);
