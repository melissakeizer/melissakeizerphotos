// Place successive photographs in the shortest column. DOM, phone and lightbox
// order stay identical, while desktop reads across instead of down each column.
document.querySelectorAll<HTMLElement>('[data-ordered-gallery]').forEach(gallery => {
  const items = [...gallery.querySelectorAll<HTMLElement>('.masonry-gallery__item')];
  let previousWidth = -1;
  let previousColumns = -1;
  const layout = () => {
    const styles = getComputedStyle(gallery);
    const columns = Number(styles.getPropertyValue('--gallery-columns')) || 3;
    const gap = Number.parseFloat(styles.columnGap) || 0;
    const width = gallery.clientWidth;
    if (!width || (width === previousWidth && columns === previousColumns)) return;
    previousWidth = width;
    previousColumns = columns;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const heights = Array<number>(columns).fill(0);
    for (const item of items) {
      const column = heights.indexOf(Math.min(...heights));
      const ratio = Number(item.dataset.photoRatio) || 1;
      const span = Math.ceil(columnWidth / ratio + gap);
      item.style.gridColumn = String(column + 1);
      item.style.gridRow = `${heights[column] + 1} / span ${span}`;
      heights[column] += span;
    }
    gallery.classList.add('is-ordered');
  };
  layout();
  new ResizeObserver(layout).observe(gallery);
});
