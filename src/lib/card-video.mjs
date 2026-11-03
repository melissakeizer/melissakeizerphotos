// A card has one visible surface: its first decoded video frame, or its photo.
// Slow/blocked playback gets a photo after a short, bounded head start.
export function createCardVideo(video, {
  reducedMotion = () => false,
  pageVisible = () => true,
  schedule = setTimeout,
  cancel = clearTimeout,
  graceMs = 1000,
} = {}) {
  const card = video.parentElement;
  let near = false, hasFrame = false, timer, generation = 0, disposed = false;
  const eligible = () => near && !reducedMotion() && pageVisible() && !disposed;
  const clearTimer = () => { if (timer !== undefined) cancel(timer); timer = undefined; };
  const state = value => { card.dataset.videoState = value; };
  const fallback = () => { clearTimer(); state('fallback'); };
  const reveal = () => {
    if (!eligible() || video.paused || video.readyState < 2) return;
    hasFrame = true; clearTimer(); state('playing');
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
  const sync = () => {
    if (reducedMotion()) { stop(); fallback(); }
    else if (eligible()) attempt();
    else stop(); // Keep an already displayed frame, rather than flashing the poster.
  };
  if (reducedMotion()) fallback();
  return {
    setVisible(value) { near = value; sync(); },
    sync,
    retry: attempt,
    dispose() {
      disposed = true; stop();
      video.removeEventListener('playing', playing);
      video.removeEventListener('error', error);
      video.removeEventListener('pause', paused);
      video.removeEventListener('canplay', attempt);
    },
  };
}
