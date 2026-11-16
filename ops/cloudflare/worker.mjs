import redirects from './redirect-map.mjs';

const legacyHosts = new Set(['melissakeizerphotography.com', 'www.melissakeizerphotography.com']);
const plain = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export function handleRequest(request) {
  const url = new URL(request.url);
  const preview = url.hostname.endsWith('.workers.dev');
  if ((!legacyHosts.has(url.hostname) && !preview) || !['http:', 'https:'].includes(url.protocol)) {
    return new Response('Not found.', { status: 404, headers: plain });
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed.', { status: 405, headers: { ...plain, Allow: 'GET, HEAD' } });
  }
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (path === '/robots.txt') {
    return new Response(request.method === 'HEAD' ? null : 'User-agent: *\nAllow: /\n', { headers: plain });
  }
  const page = url.searchParams.get('page');
  const key = path === '/' && /^[1-5]$/.test(page || '') ? `/?page=${page}` : path;
  const destination = Object.hasOwn(redirects, key) ? redirects[key] : null;
  if (!destination) {
    return new Response(request.method === 'HEAD' ? null : 'This page was not found.\nVisit https://melissakeizer.photos/ for the photo journal.\n', { status: 404, headers: plain });
  }
  // No origin request, cookies, tracking, query forwarding or user-supplied destinations.
  return new Response(null, { status: 301, headers: {
    Location: destination,
    'Cache-Control': 'public, max-age=3600',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  } });
}

export default { fetch: handleRequest };
