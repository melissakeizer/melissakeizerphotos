# Launch setup — 16 November 2026

## Analytics (prepared; disabled by default)

Create a free Umami Cloud **Hobby** account and add `melissakeizer.photos`. Current public pricing: one website, 100,000 events/month, six months retention. Page views, custom events and stored properties consume the allowance. No paid plan or account has been created.

In GitHub repository Settings → Secrets and variables → Actions → Variables, add:

```
PUBLIC_UMAMI_WEBSITE_ID = your actual website UUID
PUBLIC_UMAMI_SCRIPT_URL = the HTTPS script URL supplied by Umami
PUBLIC_UMAMI_ENABLED = true
```

Keep ENABLED unset until you review Umami’s current DPA, subprocessors, data location, international transfers and this site's privacy wording. Re-run the Pages workflow after adding variables. The website ID is public, not an API credential. Never paste an account API key into these variables.

Page views provide sources, popular stories and device/browser breakdown. Events: `see_all_stories`, `browse_photostream`, `homepage_photostream_photo`, `related_story`, `outbound_social`. Only public route/anchor or social hostname is attached. No identify calls, session replay, heatmaps, forms, query strings or full referrer paths. Local previews and other domains never track. Do Not Track, Global Privacy Control and browser opt-out are honoured. Privacy link is in the footer.

The ICO's current statistical-purpose exception requires sole use for aggregate service-improvement statistics, clear information and an easy objection mechanism. Cookie-free alone does not establish exemption: scripts accessing devices also count. Confirm the actual configured Umami processing meets those conditions before enabling; if it does not, prior consent is required. This integration therefore remains off pending that review. Review the privacy page after choosing the account/data region. Allowing analytics again takes effect on the next page navigation.

Sources checked 16 November 2026:
- https://umami.is/pricing
- https://docs.umami.is/docs/cloud/faq
- https://docs.umami.is/docs/tracker-configuration
- https://docs.umami.is/docs/tracker-functions
- https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/

## Google Search Console

Add a Domain property for `melissakeizer.photos` and complete Google's DNS TXT verification in your registrar account. No DNS has been changed. Alternatively, use a URL-prefix property and set `PUBLIC_GOOGLE_SITE_VERIFICATION` to the HTML verification token in the same GitHub Variables screen, then rebuild. Submit `https://melissakeizer.photos/sitemap.xml` after verification. Inspect homepage, one story, archive pagination and both PhotoStream pages. Search results/indexing are not guaranteed by metadata alone.

## Social preview replacement

Each published story automatically gets a 1200 × 630 JPEG generated from its existing hero image. Homepage currently uses the wolf photograph. To replace it, add `public/social-home.jpg` (your branded 1200 × 630 design) and change `homepagePreview` in `src/lib/social-image.mjs` to `/social-home.jpg`. Share previews may be cached by individual apps; test with their inspector or a new message after deployment. Original photographs remain untouched.

## Editorial checks

- `From the Front Row` remains a local-preview draft, intentionally unpublished. Finish its story copy and explicitly publish when ready.
- Existing personal stories were not rewritten. Review historic service/promotional copy and whether `hi@melissakeizer.com` remains the right public contact.
- Existing `docs/photostream-content-todo.md` and `docs/photostream-content-review.md` list uncertain capture dates/ISO and provisional content. Do not infer dates from Finder's “last opened”.
- Many older gallery photos have a story/section label rather than individual descriptive alt text. Accurate per-photo descriptions need editorial review; no species, identities or locations have been invented.
- Review auto-cropped social cards for important faces near edges. This only affects previews, not photographs displayed on the site.
