// Enhance only after handlers exist. Without JavaScript the photographs stay visible.
document.querySelectorAll<HTMLImageElement>('img[data-photo]').forEach(image => {
  const frame = image.parentElement;
  if (!frame) return;
  const reveal = () => {
    image.classList.remove('photo-pending');
    frame.classList.remove('photo-loading');
  };
  const ready = () => {
    if (typeof image.decode === 'function') image.decode().then(reveal, reveal);
    else reveal();
  };
  if (image.complete) { if (image.naturalWidth) ready(); return; }
  frame.classList.add('photo-loading');
  image.classList.add('photo-pending');
  image.addEventListener('load', ready, { once: true });
  image.addEventListener('error', reveal, { once: true });
});
