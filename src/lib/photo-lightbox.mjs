// Shared by stories and PhotoStream. A media query can leave small-screen
// photographs entirely non-interactive, including their keyboard semantics.
export function initPhotoLightbox(root) {
  const doc = root.ownerDocument;
  const items = Array.from(doc.querySelectorAll(root.dataset.lightboxSelector));
  const image = root.querySelector('#lightbox-img');
  const closeButton = root.querySelector('#lightbox-close');
  const previousButton = root.querySelector('#lightbox-prev');
  const nextButton = root.querySelector('#lightbox-next');
  if (!items.length || !image || !closeButton || !previousButton || !nextButton) return;
  const media = root.dataset.lightboxMedia ? doc.defaultView.matchMedia(root.dataset.lightboxMedia) : null;
  const enabled = () => !media || media.matches;
  const isOpen = () => root.classList.contains('is-open');
  const controls = [closeButton, previousButton, nextButton];
  let current = 0, returnFocus, previousOverflow;

  function openAt(index) {
    if (!enabled() || doc.body.classList.contains('is-story-editing')) return;
    const item = items[index];
    if (!item?.dataset.src) return;
    const wasOpen = isOpen();
    if (!wasOpen) {
      returnFocus = item;
      previousOverflow = doc.body.style.overflow;
    }
    current = index;
    image.src = item.dataset.src;
    image.alt = item.querySelector('img')?.alt || '';
    root.setAttribute('aria-hidden', 'false');
    root.classList.add('is-open');
    doc.body.style.overflow = 'hidden';
    if (!wasOpen) closeButton.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen()) return;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = previousOverflow;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  const previous = () => openAt((current - 1 + items.length) % items.length);
  const next = () => openAt((current + 1) % items.length);

  function sync() {
    if (!enabled()) close();
    items.forEach((item, index) => {
      if (enabled()) {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-haspopup', 'dialog');
        item.setAttribute('aria-controls', root.id);
        item.setAttribute('aria-label', item.dataset.lightboxLabel || item.getAttribute('aria-label') || `View photo ${index + 1}`);
      } else {
        for (const attribute of ['role', 'tabindex', 'aria-haspopup', 'aria-controls', 'aria-label']) item.removeAttribute(attribute);
      }
    });
  }
  items.forEach((item, index) => {
    item.addEventListener('click', () => openAt(index));
    item.addEventListener('keydown', event => {
      if (!enabled() || doc.body.classList.contains('is-story-editing')) return;
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openAt(index); }
    });
  });
  closeButton.addEventListener('click', close);
  previousButton.addEventListener('click', previous);
  nextButton.addEventListener('click', next);
  root.addEventListener('click', event => { if (event.target === root) close(); });
  doc.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
    else if (event.key === 'Tab') {
      event.preventDefault();
      const index = controls.indexOf(doc.activeElement);
      const nextIndex = index < 0 ? (event.shiftKey ? controls.length - 1 : 0) : (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      controls[nextIndex].focus();
    }
  });
  if (media?.addEventListener) media.addEventListener('change', sync);
  else media?.addListener(sync);
  sync();
}
