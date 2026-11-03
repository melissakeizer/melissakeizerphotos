// Near-square crops can work either beside a portrait or as a full-width frame.
// This describes placement compatibility, never a crop or resize instruction.
export function photoShape(width, height) {
  if (!(width > 0 && height > 0)) throw new Error('Photo dimensions are required');
  const ratio = width / height;
  if (ratio >= 0.9 && ratio <= 1 / 0.9) return 'square';
  return ratio > 1 ? 'landscape' : 'portrait';
}

export function photoFitsRow(photo, kind) {
  return Boolean(photo && ['pair', 'landscape'].includes(kind)
    && (photo.shape === 'square' || photo.shape === (kind === 'pair' ? 'portrait' : 'landscape')));
}
