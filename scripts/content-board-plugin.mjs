import fs from 'node:fs/promises';
import path from 'node:path';

const statuses = new Set(['ideas', 'gathering', 'ready', 'published']);

export function contentBoardPlugin() {
  let pending = Promise.resolve();
  return {
    name: 'local-content-board',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        const endpoint = `${server.config.base.replace(/\/?$/, '/')}__content-board/status`;
        if (pathname !== endpoint && pathname !== '/__content-board/status') return next();
        const send = (status, payload) => {
          response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
          response.end(JSON.stringify(payload));
        };
        if (request.method !== 'POST') return send(405, { error: 'Method not allowed.' });
        if (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`) return send(403, { error: 'Use the local board to update ideas.' });
        try {
          let body = '';
          for await (const chunk of request) {
            body += chunk;
            if (body.length > 4096) return send(413, { error: 'Request too large.' });
          }
          const { id, status, previousStatus } = JSON.parse(body);
          if (typeof id !== 'string' || !statuses.has(status)) return send(400, { error: 'Invalid idea or status.' });
          const update = pending.then(async () => {
            const file = path.resolve(server.config.root, 'content-planning/ideas.json');
            const ideas = JSON.parse(await fs.readFile(file, 'utf8'));
            const idea = ideas.find(item => item.id === id);
            if (!idea) return send(404, { error: 'Idea not found.' });
            if (idea.status !== previousStatus) return send(409, { error: 'This idea changed in another tab. Refresh to see it.' });
            idea.status = status;
            const temporary = `${file}.tmp`;
            await fs.writeFile(temporary, `${JSON.stringify(ideas, null, 2)}\n`);
            await fs.rename(temporary, file);
            send(200, { ok: true });
          });
          pending = update.catch(() => {});
          await update;
        } catch {
          send(500, { error: 'Could not save. Your idea is still on the board.' });
        }
      });
    },
  };
}
