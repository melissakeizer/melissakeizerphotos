import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCardVideo } from '../src/lib/card-video.mjs';

function fixture({ blocked = false, frames = true, videoFirst = true } = {}) {
  const video = new EventTarget();
  Object.assign(video, {
    parentElement: { dataset: { videoState: 'pending' } },
    paused: true, readyState: 0, calls: 0,
    play() { this.calls++; if (blocked) return Promise.reject(Object.assign(new Error('Blocked'), { name: 'NotAllowedError' })); this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; this.dispatchEvent(new Event('pause')); },
  });
  let frame;
  if (frames) video.requestVideoFrameCallback = callback => { frame = callback; };
  const timers = new Map(); let id = 0, reduce = false, visible = true;
  const controller = createCardVideo(video, {
    videoFirst,
    schedule: (fn, ms) => { timers.set(++id, {fn, ms}); return id; },
    cancel: key => timers.delete(key),
    reducedMotion: () => reduce, pageVisible: () => visible,
  });
  return {
    video, controller, timers,
    state: () => video.parentElement.dataset.videoState,
    playing() { video.readyState = 3; video.dispatchEvent(new Event('playing')); },
    frame() { frame?.(); },
    expire(ms = 1000) { for (const [key, task] of [...timers]) if (task.ms === ms) { timers.delete(key); task.fn(); } },
    transition(propertyName = 'opacity') { video.dispatchEvent(Object.assign(new Event('transitionend'), {propertyName})); },
    motion(value) { reduce = value; controller.sync(); },
    page(value) { visible = value; controller.sync(); },
  };
}

test('autoplay starts only nearby, stays muted and reveals only an actual video frame', () => {
  const f = fixture();
  assert.equal(f.video.calls, 0);
  f.controller.setVisible(true);
  assert.equal(f.video.calls, 1);
  assert.equal(f.video.muted, true);
  assert.equal(f.video.defaultMuted, true);
  assert.equal(f.state(), 'pending');
  f.playing(); assert.equal(f.state(), 'pending');
  f.frame(); assert.equal(f.state(), 'revealing');
  assert.equal(f.video.parentElement.dataset.videoUnderlay, 'gradient');
  f.transition('transform'); assert.equal(f.state(), 'revealing');
  f.transition(); assert.equal(f.state(), 'playing');
  assert.equal(f.timers.size, 0);
  f.expire(); assert.equal(f.state(), 'playing');
});

test('slow loading shows a photo after one second and keeps it beneath the first-frame fade', () => {
  const f = fixture(); f.controller.setVisible(true); f.expire();
  assert.equal(f.state(), 'fallback');
  f.playing(); f.frame(); assert.equal(f.state(), 'revealing');
  assert.equal(f.video.parentElement.dataset.videoUnderlay, 'photo');
  f.transition(); assert.equal(f.state(), 'playing');
  assert.equal(f.video.parentElement.dataset.videoUnderlay, undefined);
});

test('blocked playback and media errors show the fallback; real interaction can retry', async () => {
  const f = fixture({ blocked: true }); f.controller.setVisible(true);
  await Promise.resolve(); assert.equal(f.state(), 'fallback');
  assert.equal(f.timers.size, 0);
  f.controller.retry(); await Promise.resolve(); assert.equal(f.video.calls, 2);
  const g = fixture(); g.controller.setVisible(true); g.playing(); g.frame();
  g.video.dispatchEvent(new Event('error')); assert.equal(g.state(), 'fallback');
});

test('scrolling, stalls and tab visibility never flash the photo over an existing frame', () => {
  const f = fixture(); f.controller.setVisible(true); f.playing(); f.frame(); f.transition();
  f.video.dispatchEvent(new Event('waiting')); assert.equal(f.state(), 'playing');
  f.controller.setVisible(false); assert.equal(f.video.paused, true); assert.equal(f.state(), 'playing');
  f.controller.setVisible(true); assert.equal(f.video.paused, false);
  f.page(false); assert.equal(f.video.paused, true); assert.equal(f.state(), 'playing');
  f.page(true); assert.equal(f.video.paused, false);
});

test('reduced motion shows the photograph and stops playback; older browsers still reveal on playing', () => {
  const f = fixture(); f.motion(true); f.controller.setVisible(true);
  assert.equal(f.state(), 'fallback'); assert.equal(f.video.calls, 0);
  f.motion(false); assert.equal(f.video.calls, 1);
  const g = fixture({ frames: false }); g.controller.setVisible(true); g.playing();
  assert.equal(g.state(), 'revealing');
  g.expire(650); assert.equal(g.state(), 'playing');
});

test('a delayed enhancement script keeps the already-visible fallback photo', () => {
  const f = fixture({ videoFirst: false });
  assert.equal(f.state(), 'fallback');
  f.controller.setVisible(true); assert.equal(f.state(), 'fallback');
  f.playing(); f.frame(); assert.equal(f.state(), 'revealing');
  assert.equal(f.video.parentElement.dataset.videoUnderlay, 'photo');
  f.transition(); assert.equal(f.state(), 'playing');
});

test('video loops and buffering resumes do not replay the first-frame fade', () => {
  const f = fixture(); f.controller.setVisible(true); f.playing(); f.frame(); f.transition();
  for (let i = 0; i < 3; i++) { f.playing(); f.frame(); assert.equal(f.state(), 'playing'); }
  assert.equal(f.timers.size, 0);
});

test('a fade settles offscreen and a reduced-motion change cancels pending reveal work', () => {
  const f = fixture(); f.controller.setVisible(true); f.playing(); f.frame();
  f.controller.setVisible(false); f.expire(650); assert.equal(f.state(), 'playing');
  const g = fixture(); g.controller.setVisible(true); g.playing(); g.frame();
  g.motion(true); assert.equal(g.state(), 'fallback'); assert.equal(g.timers.size, 0);
  g.expire(650); g.transition(); assert.equal(g.state(), 'fallback');
  g.motion(false); g.playing(); g.frame(); assert.equal(g.state(), 'revealing');
  g.transition(); assert.equal(g.state(), 'playing');
});

test('media failure during the fade restores the photo and prevents a stale completion', () => {
  const f = fixture(); f.controller.setVisible(true); f.playing(); f.frame();
  f.video.dispatchEvent(new Event('error'));
  assert.equal(f.state(), 'fallback'); assert.equal(f.timers.size, 0);
  f.transition(); f.expire(650); assert.equal(f.state(), 'fallback');
});

test('late frame callbacks cannot reveal a paused/offscreen video', () => {
  const f = fixture(); f.controller.setVisible(true); f.playing();
  f.controller.setVisible(false); f.frame(); assert.equal(f.state(), 'pending');
  f.controller.dispose(); f.controller.retry(); assert.equal(f.video.calls, 1);
});
