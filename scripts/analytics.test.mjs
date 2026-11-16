import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const source = await readFile(new URL('../src/components/Analytics.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline define:vars=\{\{ id, src \}\}>([\s\S]*?)<\/script>/)[1];
function setup({ host = 'melissakeizer.photos', disabled = false, dnt = false, gpc = false } = {}) {
  const appended = [], handlers = {}, tracked = [];
  let off = disabled;
  const window = { umami: { track: (...args) => tracked.push(args) } };
  runInNewContext(script, {
    id: 'f1395150-4422-4217-9c52-71b016326278', src: 'https://cloud.umami.is/script.js', window,
    localStorage: { getItem: () => off ? '1' : null },
    location: { hostname: host, pathname: '/posts/', href: `https://${host}/posts/?private=value`, origin: `https://${host}` },
    navigator: { doNotTrack: dnt ? '1' : null, globalPrivacyControl: gpc }, URL,
    document: { createElement: () => ({ dataset: {} }), head: { append: el => appended.push(el) }, addEventListener: (name, fn) => { handlers[name] = fn; } },
  });
  return { appended, handlers, tracked, window, optOut: () => { off = true; } };
}
test('tracking honours host, opt-out, DNT and GPC before loading external code', () => {
  for (const settings of [{ host: '127.0.0.1' }, { disabled: true }, { dnt: true }, { gpc: true }]) assert.equal(setup(settings).appended.length, 0);
});
test('configured tracker removes private URL parts and referrer paths, and stops after objection', () => {
  const s = setup();
  assert.equal(s.appended[0].dataset.websiteId, 'f1395150-4422-4217-9c52-71b016326278');
  assert.equal(s.appended[0].dataset.excludeSearch, 'true');
  const cleaned = s.window.mkAnalyticsBeforeSend('event', { url: '/posts/?email=private#secret', referrer: 'https://example.com/private?q=secret', query: 'private', hash: 'secret' });
  assert.equal(cleaned.url, '/posts/'); assert.equal(cleaned.referrer, 'https://example.com');
  assert.equal(cleaned.query, undefined); assert.equal(cleaned.hash, undefined);
  s.optOut(); assert.equal(s.window.mkAnalyticsBeforeSend('event', {}), false);
});
test('all five navigation event types use public destinations only', () => {
  const s = setup();
  const cases = [
    ['.opening-more', 'see_all_stories', 'https://melissakeizer.photos/posts/?secret=value', '/posts/'],
    ['.home-field-notes__intro', 'browse_photostream', 'https://melissakeizer.photos/photostream/', '/photostream/'],
    ['.field-note-card__photo-link', 'homepage_photostream_photo', 'https://melissakeizer.photos/photostream/2/?secret=value#photo-example', '/photostream/2/#photo-example'],
    ['.related-stories', 'related_story', 'https://melissakeizer.photos/stories/wild-ireland/', '/stories/wild-ireland/'],
    ['.site-footer__links', 'outbound_social', 'https://www.instagram.com/KeizGoesBoom/?secret=value', 'www.instagram.com'],
  ];
  for (const [selector, name, href, destination] of cases) {
    const a = { href, closest: s => s === selector, matches: s => s === selector };
    s.handlers.click({ target: { closest: () => a } });
    assert.equal(s.tracked.at(-1)[0], name); assert.equal(s.tracked.at(-1)[1].destination, destination);
  }
  s.optOut(); s.handlers.click({ target: { closest: () => { throw new Error('Opt-out should stop tracking'); } } });
});
