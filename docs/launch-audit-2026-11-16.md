# MK Fotos technical launch audit — 16 November 2026

## Follow-up status later on 16 November

- Approved branded sharing artwork now serves homepage, Stories archives and PhotoStream; individual stories retain automatic hero previews. Static owl/hound thumbnails, Tea Party replacement and responsive spacing/labels are published.
- Umami enabled at Melissa's request; live official tracker loading checked. Privacy spacing/copy and the analytics preference correction deployed successfully in run `43914307964`. Dashboard ingestion remains an owner check. 41 regression tests pass.
- Latest deployment: about 669MB of output, 657,793,685-byte uploaded artifact; 71 HTML outputs, 55 indexable pages, clean media/metadata audits.
- Legacy domain confirmed through BigWetFish. Browser audit found 42 public legacy stories and 987 matching photo IDs/references. Both URL forms are mapped; 41 published destinations return HTTP 200. Migration report supersedes the initial candidate-only findings below. No DNS or Exposure changes.

The original sprint baseline and limitations follow for comparison.

## Completed

- Shared canonical URLs on the HTTPS primary domain; distinct archive/category/pagination titles and descriptions; shorter plain-text metadata, with contextual story fallbacks instead of the old commercial description.
- Server-rendered Open Graph/Twitter cards, absolute images, 1200 × 630 automatic hero previews, easy homepage replacement, and representative PhotoStream previews. Preview cropping does not affect site photography.
- Person/WebSite/WebPage/Article/ImageObject JSON-LD, `en-GB`, large-image preview permission, XML sitemap with image URLs, robots.txt. All 43 published stories and both PhotoStream pages are included. Redirects, private tools, studies, drafts and 404 are excluded/noindexed. Content and links are in generated HTML.
- Heading hierarchy corrected while preserving type sizes. Keyboard skip link and a proper story main landmark. Existing shared navigation, button system and anchor clearances retained.
- Designed 404 page with existing components; unconfigured `YOUR_FORM_ID` form replaced by existing direct email route.
- Card video 1px bleed and page-coloured backing included. Existing autoplay/fallback/reduced-motion behaviour retained.
- Reused JPEG source files can no longer carry EXIF/IPTC/XMP into deployment; source originals retained. Other deployed UI PNG metadata is stripped too. Deployed raster scan has no embedded metadata; common MP4 QuickTime location markers absent. No credentials detected by targeted generated-HTML scan, and no tracked environment/key files found. These are targeted checks, not a guarantee against every kind of secret.
- 400px thumbnails limited to card/stream/avatar sources, keeping large photography unchanged. Footer portrait uses responsive delivery and lazy loading. Existing responsive JPEGs, intrinsic dimensions, progressive loading, source pruning and 750MB build guard remain active.
- Umami disabled until configured; clean public route events, query/referrer minimisation, no personal identities, DNT/GPC checks and browser opt-out. Privacy page and account instructions prepared.
- Compatible dependency fixes: Astro 6.0.4 → 6.4.8 and transitive patches. 15 reported dependency findings reduced to 3. No new direct dependencies.
- Local caption/data backup `.local/prelaunch-content-backup-2026-11-16.tar.gz`; 45 candidate Exposure URL mappings and migration checklist. No DNS/account/subscription changes.

## Verification

- Full production build: 69 HTML outputs; 55 indexable pages. Source content check: 45 posts, of which 43 published and 2 drafts.
- 37 regression tests passed, covering video playback, media processing, metadata and PhotoStream/planner behaviour.
- Generated HTML audit: no duplicate titles/descriptions, broken internal routes/fragments, heading jumps, missing alt attributes, missing previews, invalid JSON-LD or visible placeholder markers on indexable pages. Social images are checked for existence and dimensions.
- Media audit verifies all referenced assets, image decodability/resolution and exact-byte duplicates. Previous output 659,918,838 bytes; final output approximately 672MB (about 640MiB). Added previews/thumbnails account for the increase; comfortably under Pages' 1GB and the stricter 750MB project budget. No original source photograph is removed.
- Default desktop browser, simulated 390 × 844 mobile and 1024 × 768 tablet: no horizontal overflow on inspected homepage/archive/story/PhotoStream; fixed navigation; 44px centred homepage buttons. Six related stories on the inspected story. PhotoStream page-2 anchor lands below header. Both home videos autoplay in the inspected browser. Privacy objection control works; 404 links render. Fresh browser console clean.
- **Not actual device testing:** no physical iPad, Android/Samsung, Safari/iOS autoplay or power-saving policy test today. Reduced-motion and blocked-autoplay branches have regression coverage; they were not all manually re-tested on every device.
- Mobile Lighthouse baseline on live homepage: performance **57**, accessibility **98**, best practices **100**, SEO **100**. Local post-change audits: homepage **74/100**, archive **99/100**, individual story **74/100**, PhotoStream **74/100** performance; accessibility/SEO **100** across all four. CLS 0 except story 0.002. Local/network figures are not a controlled before/after performance comparison. A late charset warning was subsequently corrected and will be rechecked on live deployment.
- LCP remains slow in simulation (roughly 10–15s), frequently attributed to decorative SVG artwork/animation. Preserving the current animation limits the scope of this sprint; don't treat this as a Core Web Vitals pass. Real-user CWV/INP require field data; Lighthouse cannot establish them.

## Remaining technical work

1. Dependency audit still flags Astro (critical), sharp (high) and esbuild (low). Current npm remediation requires breaking upgrades to Astro 7.4.12 / sharp 0.35.5. Several advisories concern runtime/server features that a static Pages deployment does not expose, but build/local-editor risks and rendering advisories still need a dedicated upgrade/regression pass. No force upgrade was applied.
2. Further performance work should profile the complex drawings and video transfer budget, with an explicit decision on preserving animation timing. GitHub Pages cache headers are hosting-controlled. No dramatic photography compression or visual redesign was used to inflate scores.
3. Exact older-gallery image descriptions need editorial knowledge; existing title/section labels remain. Three verified card subjects now have more descriptive alt text. Hashed delivery filenames are stable cache identities, not missing source filenames; do not rename them just for keywords.
4. Search Console verification, real social-platform cache previews and real Umami event ingestion require the owner's accounts. Automated metadata validation is complete, but no claim is made about actual LinkedIn/iMessage rendering or Google indexing.
5. Existing public external links were inventoried, not all third-party content independently verified; some historic social/Exposure endpoints block automated requests.

## Owner/admin tasks

See [launch setup](launch-admin.md) for Umami variables/privacy review, Search Console and homepage card replacement. See [Exposure migration](exposure-migration.md) and [candidate URL map](exposure-url-map.csv) before cancelling anything.

- Later owner decision: no additional Exposure export is required; Melissa considers her local images/text sufficient. A Few Favourites is retired, and optional legacy-caption restoration is not a migration blocker. Proceed with the BigWetFish redirect handover and verify redirects before cancellation.
- Finish/review unpublished `From the Front Row` when ready. A Few Favourites is intentionally retired; neither has been silently published.
- Confirm the contact email, missing dates/ISO already recorded in the PhotoStream review notes and individual alt descriptions as time allows.
- Retest work access around **2 December 2026**, after the authoritative RDAP registration reaches 30 days. Access is not guaranteed to be restored then.

Detailed machine reports remain private in `.local/launch-audit.json` and temporary Lighthouse/media audit reports; no visitor data or credentials are committed.
