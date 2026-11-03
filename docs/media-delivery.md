# Photography delivery and Pages size budget

Original photographs remain in `public/photos` (including locally ignored camera
originals). The build never edits or removes those files. Do not delete sources
to reduce deployment size.

`Photo.astro` creates content-addressed web copies through `scripts/web-media.mjs`:

- Preserve orientation, aspect ratio and composition; never crop or enlarge.
- Maximum long edge: 3200 pixels for large displays and story lightboxes.
- Responsive widths: 800, 1600 and 2400 pixels where useful, plus the bounded
  largest copy. Most existing 1600-pixel exports need only two copies.
- Quality-88 progressive MozJPEG; preserve 4:4:4 colour sampling for the largest
  copy when the source uses it. Standard JPEG deliberately supports older iPad
  Safari without requiring duplicate modern-format/fallback asset libraries.
- Identical source bytes share the same generated files, irrespective of name.
- Replacing a source invalidates its generated cache.

The production integration also rewrites original-photo references in lightboxes,
backgrounds, video posters and metadata to the bounded web copies. It copies the
referenced generated assets into `dist`, then excludes unused media, source
originals, stale variants and Finder metadata **from dist only**.

The device drawings keep their original vector paths, stroke masks and timings.
Artwork layers are external SVG images cached across pages, instead of several
megabytes of paths inlined repeatedly into every HTML document. Both SVG `href`
and legacy `xlink:href` are supplied for older Safari.

Videos currently used on the site are already modest-resolution, fast-start
H.264 MP4s. They are preserved without another lossy transcode. Unused video
sources remain in the repository but are not deployed.

## Verification

```
npm run test:media
npm run check:content
npm run build
npm run check:deployment
```

The build fails above **750,000,000 bytes**, leaving room below the Pages limit.
GitHub Actions checks every generated image, stylesheet/font reference, poster,
SVG drawing layer and lightbox target before uploading the artifact.

For a detailed audit, including directory totals, largest files and duplicates:

```
node scripts/audit-deployment.mjs dist --verify --report=.local/deployment-audit.json
```

Use `--compare=/absolute/path/to/previous/dist` to check that page image order,
labels and video placements have not changed. Use
`--live=https://melissakeizer.photos` to additionally check referenced assets over
HTTPS. Reports and generated caches are ignored by Git and never published.

New original files can be added normally. Only photographs actually referenced
by published pages are deployed; draft-only and waiting-area sources are not.
No separate optimization step or manual compression is required when adding a
photograph.
