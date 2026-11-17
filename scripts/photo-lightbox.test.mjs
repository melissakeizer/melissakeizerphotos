import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initPhotoLightbox } from '../src/lib/photo-lightbox.mjs';

function fixture({ desktop = true, gated = true } = {}) {
  const doc = new EventTarget();
  class Element extends EventTarget {
    constructor() {
      super(); this.dataset = {}; this.attributes = new Map(); this.isConnected = true;
      const classes = new Set();
      this.classList = { add: v => classes.add(v), remove: v => classes.delete(v), contains: v => classes.has(v) };
    }
    setAttribute(k, v) { this.attributes.set(k, v); }
    getAttribute(k) { return this.attributes.get(k) ?? null; }
    removeAttribute(k) { this.attributes.delete(k); }
    focus() { doc.activeElement = this; }
    click() { this.dispatchEvent(new Event('click')); }
  }
  const media = new EventTarget(); media.matches = desktop;
  const items = ['One', 'Two', 'Three'].map(title => {
    const item = new Element();
    item.dataset = { src: `/large/${title}.jpg`, lightboxLabel: `View ${title} larger` };
    item.querySelector = () => ({ alt: title });
    return item;
  });
  doc.querySelectorAll = () => items;
  doc.defaultView = { matchMedia: () => media };
  doc.body = new Element(); doc.body.style = { overflow: 'auto' };
  const root = new Element(); root.id = 'lightbox'; root.ownerDocument = doc;
  root.dataset = { lightboxSelector: '[data-photo]', ...(gated ? { lightboxMedia: '(min-width: 601px)' } : {}) };
  const image = new Element(), close = new Element(), previous = new Element(), next = new Element();
  const elements = { '#lightbox-img': image, '#lightbox-close': close, '#lightbox-prev': previous, '#lightbox-next': next };
  root.querySelector = selector => elements[selector];
  const key = (target, value, shiftKey = false) => {
    const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: value, shiftKey });
    target.dispatchEvent(event); return event;
  };
  initPhotoLightbox(root);
  return { doc, root, items, image, close, previous, next, key,
    open: () => root.classList.contains('is-open'),
    resize(value) { media.matches = value; media.dispatchEvent(new Event('change')); },
  };
}

test('wider PhotoStream photos expose keyboard controls and open the full-size image', () => {
  const f = fixture();
  assert.equal(f.items[1].getAttribute('role'), 'button');
  assert.equal(f.items[1].getAttribute('tabindex'), '0');
  f.items[1].focus(); f.items[1].click();
  assert.equal(f.open(), true); assert.equal(f.image.src, '/large/Two.jpg'); assert.equal(f.image.alt, 'Two');
  assert.equal(f.doc.body.style.overflow, 'hidden'); assert.equal(f.doc.activeElement, f.close);
  assert.equal(f.root.getAttribute('aria-hidden'), 'false');
  f.close.click(); assert.equal(f.doc.activeElement, f.items[1]); assert.equal(f.doc.body.style.overflow, 'auto');
});

test('mobile photos remain ordinary images and do not intercept taps or Space scrolling', () => {
  const f = fixture({ desktop: false });
  for (const item of f.items) {
    assert.equal(item.getAttribute('role'), null); assert.equal(item.getAttribute('tabindex'), null);
    item.click(); assert.equal(f.open(), false);
    assert.equal(f.key(item, ' ').defaultPrevented, false);
  }
});

test('resizing into mobile closes the viewer and removes triggers, then desktop can reopen', () => {
  const f = fixture(); f.items[0].focus(); f.items[0].click(); f.resize(false);
  assert.equal(f.open(), false); assert.equal(f.doc.body.style.overflow, 'auto');
  assert.equal(f.root.getAttribute('aria-hidden'), 'true'); assert.equal(f.items[0].getAttribute('tabindex'), null);
  f.items[0].click(); assert.equal(f.open(), false);
  f.resize(true); assert.equal(f.items[0].getAttribute('tabindex'), '0');
  assert.equal(f.key(f.items[0], 'Enter').defaultPrevented, true); assert.equal(f.open(), true);
});

test('previous/next and arrow keys follow photo order and wrap, Escape restores focus', () => {
  const f = fixture(); f.items[0].focus(); f.items[0].click();
  f.previous.click(); assert.equal(f.image.alt, 'Three');
  f.next.click(); assert.equal(f.image.alt, 'One');
  f.key(f.doc, 'ArrowRight'); assert.equal(f.image.alt, 'Two');
  f.key(f.doc, 'ArrowLeft'); assert.equal(f.image.alt, 'One');
  f.key(f.doc, 'Escape'); assert.equal(f.open(), false); assert.equal(f.doc.activeElement, f.items[0]);
});

test('Tab stays within the modal; navigating keeps focus on the selected control', () => {
  const f = fixture(); f.items[0].click();
  f.key(f.doc, 'Tab', true); assert.equal(f.doc.activeElement, f.next);
  f.next.click(); assert.equal(f.doc.activeElement, f.next);
  f.key(f.doc, 'Tab'); assert.equal(f.doc.activeElement, f.close);
  f.key(f.doc, 'Tab'); assert.equal(f.doc.activeElement, f.previous);
});

test('story viewers remain enabled on small screens and respect editing mode', () => {
  const f = fixture({ desktop: false, gated: false });
  f.items[0].click(); assert.equal(f.open(), true); f.root.click(); assert.equal(f.open(), false);
  f.doc.body.classList.add('is-story-editing'); f.items[0].click(); f.key(f.items[0], 'Enter');
  assert.equal(f.open(), false);
});
