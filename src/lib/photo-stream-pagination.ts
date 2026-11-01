export const photoStreamPageSize = 10;

// Paginate complete visual rows, never splitting a pair of portraits.
export function paginatePhotoStream<T extends { image: string }>(
  notes: T[], landscapeImages: Set<string>, breaksBefore: Set<string>, pageSize = photoStreamPageSize,
): T[][] {
  const rows: T[][] = [];
  for (const note of notes) {
    const previous = rows.at(-1);
    if (!landscapeImages.has(note.image) && !breaksBefore.has(note.image)
      && previous?.length === 1 && !landscapeImages.has(previous[0].image)) {
      previous.push(note);
    } else rows.push([note]);
  }
  const pages: T[][] = [];
  let page: T[] = [];
  for (const row of rows) {
    page.push(...row);
    if (page.length >= pageSize) { pages.push(page); page = []; }
  }
  if (page.length) pages.push(page);
  return pages;
}
