import fs from 'node:fs/promises';
import { maxPhotoUploadBytes, savePhotoUpload, listPhotoUploads, uploadPhotoForBrowser, previewFile } from './photostream-upload-store.mjs';

export function photoStreamUploadPlugin() {
  return { name: 'local-photostream-uploads', apply: 'serve', configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const base = server.config.base.replace(/\/?$/, '/'), url = new URL(request.url || '/', 'http://localhost');
      const prefix = `${base}__photostream-uploads`;
      const route = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : url.pathname.startsWith('/__photostream-uploads') ? url.pathname.slice('/__photostream-uploads'.length) : null;
      if (route === null || (route && !route.startsWith('/'))) return next();
      const test = url.searchParams.has('test');
      const send = (status, payload) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(payload)); };
      const expectedOrigin = `${request.socket.encrypted ? 'https' : 'http'}://${request.headers.host}`;
      if (request.headers.origin && request.headers.origin !== expectedOrigin) return send(403, { error: 'Use the local planner to upload photos.' });
      if (request.headers['sec-fetch-site'] === 'cross-site') return send(403, { error: 'Use the local planner to upload photos.' });
      try {
        if (request.method === 'GET' && (route === '' || route === '/')) return send(200, { photos: (await listPhotoUploads(server.config.root, test)).map(photo => uploadPhotoForBrowser(photo, base, test)) });
        const preview = route.match(/^\/([a-f0-9]{40})\/preview\.jpg$/);
        if (request.method === 'GET' && preview) {
          const bytes = await fs.readFile(previewFile(server.config.root, preview[1], test));
          response.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': bytes.length, 'Cache-Control': 'private, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' }); return response.end(bytes);
        }
        if (request.method !== 'POST' || (route !== '' && route !== '/')) return send(405, { error: 'Method not allowed.' });
        if (request.headers.origin !== expectedOrigin || request.headers['content-type'] !== 'application/octet-stream') return send(403, { error: 'Upload from the local planner.' });
        if (+request.headers['content-length'] > maxPhotoUploadBytes) return send(413, { error: 'Photos must be 50 MB or smaller.' });
        const chunks = []; let size = 0;
        for await (const chunk of request) { size += chunk.length; if (size > maxPhotoUploadBytes) return send(413, { error: 'Photos must be 50 MB or smaller.' }); chunks.push(chunk); }
        let filename;
        try { filename = decodeURIComponent(String(request.headers['x-photo-name'] || 'Photo')); } catch { return send(400, { error: 'Invalid photo name.' }); }
        const result = await savePhotoUpload(server.config.root, Buffer.concat(chunks), filename, test);
        send(200, { ...result, photo: uploadPhotoForBrowser(result.photo, base, test) });
      } catch (error) { send(error.code === 'ENOENT' ? 404 : error.status || 500, { error: error.status ? error.message : 'Could not save the upload. Your existing photos and plan are unchanged.' }); }
    });
  } };
}
