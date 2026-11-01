import path from 'node:path';
import { saveStorySections } from './story-editor-store.mjs';

const VALID_LAYOUTS = new Set([
  '', 'split', 'split-reverse', 'stacked', 'stacked-centered',
  'spotlight', 'full-bleed', 'edge-to-edge', 'parallax',
]);

function readRequest(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error('Request is too large.'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function validSections(value) {
  return Array.isArray(value) && value.every((section) => {
    if (!section || typeof section !== 'object') return false;
    if (!(section.title === null || typeof section.title === 'string')) return false;
    if (typeof section.text !== 'string') return false;
    if (!Array.isArray(section.photos) || !section.photos.every((photo) => typeof photo === 'string')) return false;
    if (section.layout !== undefined && !VALID_LAYOUTS.has(section.layout)) return false;
    if (section.caption !== undefined && typeof section.caption !== 'string') return false;
    return true;
  });
}

export function storyEditorPlugin() {
  return {
    name: 'local-story-editor',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        if (pathname !== '/melissakeizerphotos/__story-editor/save' && pathname !== '/__story-editor/save') return next();
        if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed.' });

        try {
          const payload = JSON.parse(await readRequest(request));
          const slug = typeof payload.slug === 'string' ? payload.slug : '';
          if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return send(response, 400, { error: 'Invalid story slug.' });
          if (!validSections(payload.sections)) return send(response, 400, { error: 'Invalid story sections.' });
          if (payload.baseSections !== undefined && !validSections(payload.baseSections)) return send(response, 400, { error: 'Invalid original story sections.' });

          const storyDirectory = path.resolve(process.cwd(), 'src/content/stories');
          const storyPath = path.resolve(storyDirectory, `${slug}.md`);
          if (!storyPath.startsWith(`${storyDirectory}${path.sep}`)) return send(response, 400, { error: 'Invalid story path.' });

          const result = await saveStorySections(process.cwd(), slug, payload.sections, payload.baseSections);
          send(response, 200, result);
        } catch (error) {
          send(response, error.status || 500, { error: error instanceof Error ? error.message : 'Could not save story.' });
        }
      });
    },
  };
}
