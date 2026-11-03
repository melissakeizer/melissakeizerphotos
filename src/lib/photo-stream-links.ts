// Filename identity survives title edits and feed reordering. The suffix avoids
// collisions between filenames that produce the same readable slug.
export function photoStreamAnchor(image: string): string {
  const slug = image.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let hash = 2166136261;
  for (const character of image) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `photo-${slug}-${(hash >>> 0).toString(36)}`;
}

export function photoStreamLocations(pages: Array<Array<{ image: string }>>) {
  const locations = new Map<string, { page: number; id: string }>();
  pages.forEach((notes, index) => notes.forEach(note => locations.set(note.image, {
    page: index + 1, id: photoStreamAnchor(note.image),
  })));
  return locations;
}
