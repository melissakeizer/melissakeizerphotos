// Give autoplay a bounded head start, then fade the first decoded frame over
// the loading gradient or an already-visible photo. Never restart on a loop/stall.
export function createCardVideo(video, {
  reducedMotion = () => false,
  pageVisible = () => true,
  schedule = setTimeout,
  cancel = clearTimeout,
  graceMs = 1000,
  fadeMs = 550,
  videoFirst = true,
} = {}) {
  const card = video.parentElement;
  let near = false, hasFrame = false, timer, fadeTimer, generation = 0, disposed = false;
  const eligible = () => near && !reducedMotion() && pageVisible() && !disposed;
  const clearTimer = () => { if (timer !== undefined) cancel(timer); timer = undefined; };
  const state = value => { card.dataset.videoState = value; };
  const clearFade = () => { if (fadeTimer !== undefined) cancel(fadeTimer); fadeTimer = undefined; };
  const fallback = () => { clearTimer(); clearFade(); delete card.dataset.videoUnderlay; state('fallback'); };
  const finishReveal = () => {
    clearFade();
    if (!disposed && hasFrame && card.dataset.videoState === 'revealing') {
      state('playing'); delete card.dataset.videoUnderlay;
    }
  };
  const transitioned = event => {
    if (event.target === video && event.propertyName === 'opacity') finishReveal();
  };
  const reveal = () => {
    if (!eligible() || video.paused || video.readyState < 2) return;
    if (hasFrame && ['revealing', 'playing'].includes(card.dataset.videoState)) return;
    card.dataset.videoUnderlay = card.dataset.videoState === 'fallback' ? 'photo' : 'gradient';
    hasFrame = true; clearTimer(); state('revealing');
    // transitionend is authoritative; the timer also settles older browsers or
    // a backgrounded tab where the browser doesn't deliver the event.
    fadeTimer = schedule(() => { fadeTimer = undefined; finishReveal(); }, fadeMs + 100);
  };
  const playing = () => {
    const token = generation;
    if (typeof video.requestVideoFrameCallback === 'function') {
      video.requestVideoFrameCallback(() => { if (token === generation) reveal(); });
    } else reveal();
  };
  const attempt = () => {
    if (!eligible()) return;
    video.muted = true; video.defaultMuted = true;
    if (!hasFrame && card.dataset.videoState === 'pending' && timer === undefined) {
      timer = schedule(() => { timer = undefined; if (!hasFrame) state('fallback'); }, graceMs);
    }
    const token = generation;
    try {
      const result = video.play();
      result?.catch(error => {
        // A scroll/page-hide pause may abort an outstanding play request.
        if (token === generation && eligible() && !hasFrame && error?.name !== 'AbortError') fallback();
      });
    } catch { if (!hasFrame) fallback(); }
  };
  const stop = () => { generation++; clearTimer(); video.pause(); };
  const error = () => { hasFrame = false; fallback(); };
  const paused = () => { if (eligible() && !hasFrame) fallback(); };
  video.addEventListener('playing', playing);
  video.addEventListener('error', error);
  video.addEventListener('pause', paused);
  video.addEventListener('canplay', attempt);
  video.addEventListener('transitionend', transitioned);
  const sync = () => {
    if (reducedMotion()) { stop(); fallback(); }
    else if (eligible()) attempt();
    else stop(); // Keep an already displayed frame, rather than flashing the poster.
  };
  // The inline fail-open timer may already have exposed the photo if the page
  // script arrived slowly. Keep that photo instead of blanking it again.
  if (!videoFirst || reducedMotion()) fallback();
  return {
    setVisible(value) { near = value; sync(); },
    sync,
    retry: attempt,
    dispose() {
      disposed = true; stop(); clearFade();
      video.removeEventListener('playing', playing);
      video.removeEventListener('error', error);
      video.removeEventListener('pause', paused);
      video.removeEventListener('canplay', attempt);
      video.removeEventListener('transitionend', transitioned);
    },
  };
}
