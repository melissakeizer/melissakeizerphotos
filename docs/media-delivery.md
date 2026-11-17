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

Video cards use fast-start H.264 MP4s. The wolf has a separate web derivative,
`wolf-looking-toward-camera-web.mp4`: 2,090,300 bytes instead of 4,901,605
(57% smaller), with the same 720 × 1280 dimensions, 24 fps and four-second
sequence. Its unused audio track is omitted. The original remains unchanged;
unreferenced originals are excluded from deployment. The derivative was checked
against original frames (SSIM 0.986 across the sequence) and at card size.
Other video sources are preserved without another transcode.

The wolf derivative can be regenerated with FFmpeg (not a build dependency):

```sh
ffmpeg -i public/videos/wolf-looking-toward-camera.mp4 -map 0:v:0 -an \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart \
  -map_metadata -1 public/videos/wolf-looking-toward-camera-web.mp4
```

Cards give autoplay one second to provide an actual decoded frame. During that
time the image-loading gradient remains visible. If playback is slow or blocked,
the photograph fades in; a later video frame fades over it for 550ms. The
underlying photograph stays visible until the video is opaque. Looping,
buffering and scrolling do not replay this entrance. Reduced motion uses the
static photograph. If JavaScript arrives late, an already-visible photograph
stays in place instead of being hidden again.

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

## Checking a slow first visit

In Brave/Chrome on the Mac, open Developer Tools → Network, enable **Disable
cache**, choose **Slow 4G** or **3G** from the throttling menu, then reload with
Developer Tools open. Enable the Network screenshot capture to inspect the
loading sequence frame by frame. Restore **No throttling** afterwards. This
simulates traffic in that desktop browser, not iPhone Safari or its autoplay and
power-saving policies.

The 17 November video change was checked with normal cold loads, 3.5-second
video/script delays, a shared 200KiB/s connection with 300ms response latency,
and failed video responses. These were local production-build tests in a
desktop browser at desktop/mobile viewport sizes, not physical-device tests.
The controller regression suite also checks blocked playback, reduced motion,
offscreen pause, loops, stale callbacks and failures during a fade.

Reference: https://developer.chrome.com/docs/devtools/network/reference/
