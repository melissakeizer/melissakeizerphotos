# Launch setup — 16 November 2026

## Analytics (enabled 16 November 2026)

Melissa created her Umami account and supplied the website ID. At her request, the official Cloud tracker is now enabled and deployed. No account or paid service was created by Codex. Current Hobby allowance: one website, 100,000 events/month and six months retention; page views and custom events consume it.

In GitHub repository Settings → Secrets and variables → Actions → Variables, add:

```
PUBLIC_UMAMI_WEBSITE_ID = f1395150-4422-4217-9c52-71b016326278
PUBLIC_UMAMI_SCRIPT_URL = https://cloud.umami.is/script.js
PUBLIC_UMAMI_ENABLED = true
```

These repository variables are configured and deployed. Browser inspection confirmed the live script loads without console errors; dashboard ingestion still needs Melissa's account-side check. The website ID is public, not an API credential. Never paste an API key into these variables. To pause later, set ENABLED to false and rebuild.

Page views provide sources, popular stories and device/browser breakdown. Events: `see_all_stories`, `browse_photostream`, `homepage_photostream_photo`, `related_story`, `outbound_social`. Only public route/anchor or social hostname is attached. No identify calls, session replay, heatmaps, forms, query strings or full referrer paths. Local previews and other domains never track. Do Not Track, Global Privacy Control and browser opt-out are honoured. Privacy link is in the footer.

The ICO's current statistical-purpose exception requires sole use for aggregate service-improvement statistics, clear information and an easy objection mechanism. Cookie-free alone does not establish exemption: scripts accessing devices also count. Review the actual account's DPA, subprocessors, data location and transfers alongside the privacy wording; activation at Melissa's request is not a compliance certification. If processing does not meet the exception, prior consent is required. Allowing analytics again takes effect on the next page navigation; it clears Umami's opt-out key.

Sources checked 16 November 2026:
- https://umami.is/pricing
- https://docs.umami.is/docs/cloud/faq
- https://docs.umami.is/docs/tracker-configuration
- https://docs.umami.is/docs/tracker-functions
- https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/

## Google Search Console

Add a Domain property for `melissakeizer.photos` and complete Google's DNS TXT verification in your registrar account. No DNS has been changed. Alternatively, use a URL-prefix property and set `PUBLIC_GOOGLE_SITE_VERIFICATION` to the HTML verification token in the same GitHub Variables screen, then rebuild. Submit `https://melissakeizer.photos/sitemap.xml` after verification. Inspect homepage, one story, archive pagination and both PhotoStream pages. Search results/indexing are not guaranteed by metadata alone.

## Social preview replacement

Each published story automatically gets a 1200 × 630 JPEG from its hero image. Homepage, Stories archives and PhotoStream use Melissa's approved branded design from `public/social-home.jpg`; replace that source file to update it. `homepagePreview` in `src/lib/social-image.mjs` already selects it. Platforms may cache previews; use their inspector or a new message after deployment. Original photographs remain untouched.

## Editorial checks

- `From the Front Row` remains a local-preview draft, intentionally unpublished. Finish its story copy and explicitly publish when ready. `A Few Favourites` was intentionally retired on 16 November; retain source photography and omit it from the redirect request.
- Existing personal stories were not rewritten. Review historic service/promotional copy and whether `hi@melissakeizer.com` remains the right public contact.
- Existing `docs/photostream-content-todo.md` and `docs/photostream-content-review.md` list uncertain capture dates/ISO and provisional content. Do not infer dates from Finder's “last opened”.
- Many older gallery photos have a story/section label rather than individual descriptive alt text. Accurate per-photo descriptions need editorial review; no species, identities or locations have been invented.
- Review auto-cropped social cards for important faces near edges. This only affects previews, not photographs displayed on the site.
