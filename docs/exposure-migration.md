# Exposure migration — preparation only, 16 November 2026

No DNS, Exposure settings, plans or subscriptions have changed. No support contact is required by this plan.

## Selected implementation

Cloudflare Free is now the chosen redirect platform. The Worker, preview-only configuration and account-side checklist are in [ops/cloudflare](../ops/cloudflare/README.md). Six dedicated regression tests cover all mapped URLs, host/scheme variants, archive queries, trailing slashes, unknown/retired pages and preview isolation. The temporary preview was deployed and verified on 16 November 2026: all 53 mappings passed 324 HTTP/HTTPS checks, and all 47 distinct new-site destinations returned 200. Nameserver delegation, both old-domain hostname bindings and live HTTPS/redirect verification remain pending. The Apache/provider handover below is retained as background, not the current installation route.

Owner decisions confirmed later on 16 November: Melissa considers her existing local images/text sufficient and declines any further Exposure export or backup. Extra exports and optional legacy-caption restoration are not migration blockers. **A Few Favourites is retired**; preserve its local source files and omit it from the redirect request. Unmapped URLs can return the host's normal 404 response. The next step is a polite support enquiry with the simplified owned-domain CSV; the longer [handover](bigwetfish-handover.md) and server example are optional internal references.

## Scope and evidence

Melissa confirmed that BigWetFish manages `melissakeizerphotography.com`. Preserve HTTP/HTTPS and www/apex. Do not change `melissakeizer.com`, a separate website/email domain. Both legacy story forms are in [the URL map](exposure-url-map.csv):

- `https://www.melissakeizerphotography.com/finn-pointer-puppy`
- `https://melissakeizer.exposure.co/finn-pointer-puppy`
- Destination: `https://melissakeizer.photos/stories/finn-pointer-puppy/`

The owned domain is the priority; Exposure links are best effort and must not block migration.

Verified today:

- DNS: www CNAME `domains.exposure.co`; apex A `174.129.25.170`.
- Browser navigation from the Exposure Finn URL reached the corresponding HTTPS www story. Its canonical names that custom-domain URL. This verifies forwarding, **not the redirect status code**.
- Automated requests to Exposure and www returned 403. HTTP apex returned **301** to HTTP www, then 403. HTTPS apex timed out after 20 seconds. Raw results: `.local/exposure-http-audit-2026-11-16.json`. These blocks do not establish that regular visitors cannot view the site.
- All five public archive pages were inspected: **42 stories**, all with local counterparts. [Inventory](exposure-public-inventory.json) records observed URLs and counts.
- **987 legacy photo IDs** match local source filenames and story references; none missing. This checks identity/presence, not pixel equality or original resolution.
- **41** are published on the new site. **A Few Favourites** is public on Exposure but is now intentionally retired and omitted from the redirect request. **From the Front Row** remains a local draft, not seen in the public archive. Barcelona and Wild Ireland are new-site publications not seen there; no legacy existence is assumed.
- Some old photo/group captions are absent locally. Review Dubrovnik & Cavtat, Pet Expo Belfast, Creatures, Mutley & Dexter, Hybrid Conf, Stablemates and Designers/Explorers. Examples include Mutley's silver ears and numerous Hybrid Conf captions. Saved text was not silently inserted or rewritten.

Public text, caption/location observations, photo references, inventory and comparisons are saved privately in `.local/exposure-migration-2026-11-16/`. Some captured HTML is truncated. This is a research backup, **not a complete account/original-media export**. Gallery photo IDs were read from rendered elements because initial images can be lazy placeholders. Private/unlisted work remains outside this audit.

## Google visibility

Actual Google Search was inspected in the browser. A combined `site:` search showed custom-domain results including the homepage, Claws Out, Vegas, Candy & Basil, Sky & Odin, Electric Pup and categories. A separate `site:melissakeizer.exposure.co` search showed Melissa's Exposure profile and Dubrovnik & Cavtat. Both legacy forms have visible search results worth preserving.

These sampled results are not a complete index/backlink inventory or proof about Finn specifically. Visible result text is saved privately. Search Console is needed for complete indexing, selected canonicals, links and image-search reports.

## Exposure policy findings

- [Custom-domain overview](https://support.exposure.co/en/articles/2342913-an-overview-on-using-your-own-custom-domain-name/): username URLs forward to the connected domain. No promise is given for forwarding after DNS moves away or paid access ends.
- [Cancellation](https://support.exposure.co/en/articles/2350132-cancelling-subscription-payments/): stories stay available through the paid period, then become unavailable to visitors. They remain stored for possible resubscription.
- [Free access](https://support.exposure.co/en/articles/4257244-what-you-get-for-free/): **no ongoing free plan**, only a trial. Historical three-free-story advice is not a dependable migration strategy.
- [Domain removal](https://support.exposure.co/en/articles/2343047-removing-or-changing-custom-domain/): old-domain forwarding must be arranged outside Exposure. The statement about username URLs remaining accessible when removing a custom domain does not override cancellation restrictions.

No publicly documented permanent external redirect service after cancellation was found. Exposure → owned domain → new story could continue while the current forwarding survives: this is an inference, not a persistence guarantee. Accept eventual Exposure URL loss. Do not connect the new primary domain to Exposure in pursuit of redirects. No support cooperation is assumed.

## BigWetFish redirect preparation

[Apache example](exposure-redirects.apache.conf.example), generated by `node scripts/prepare-migration.mjs` after a production build, contains 41 explicit published-story redirects, optional trailing slashes, host guard, homepage/archive/category/contact mappings and query removal. Retired/draft/unobserved slugs are excluded. It is **not installed** and need not be sent; BigWetFish can implement its own rules. The simplified [provider CSV](bigwetfish-redirects.csv) has 53 old/new URL pairs on the owned domain only, listing each HTTPS www source once. The support request asks them to cover HTTP/HTTPS and www/apex variants too.

The example assumes Apache 2.4/mod_rewrite in a dedicated legacy-domain document root. Confirm the existing BigWetFish plan provides suitable hosting, both-domain certificates and those controls; registration alone is insufficient. Translate rules if the server differs. Do not purchase services without agreement. References: [cPanel manual redirects](https://docs.cpanel.net/knowledge-base/general-systems-administration/how-to-configure-redirects-manually/), [Apache flags](https://httpd.apache.org/docs/2.4/en/rewrite/flags.html).

All four scheme/host variants should go directly to the final HTTPS destination. TLS must work before an HTTPS redirect can be read. Old archive queries `?page=1` through `?page=5` go to the archive because page sizes differ; Travel maps to Adventures. Unknown stories remain genuine 404s. Subscription/feed/search/accessibility paths, unseen categories and aliases need decisions before adding rules; do not send all of them to home.

## URLs we cannot control

Exposure subdomain paths, embeds/share links/feeds and CDN URLs belong to Exposure. Observed images use `exposure.accelerator.net/production/photos/<id>/original.jpg;…` and `/production/gallery_<id>/photos/ph_<id>/photo.jpg;…`, plus avatars/transformed variants. We cannot redirect these hosts or guarantee continued availability. Disqus comments and external video/embed services are separate backup concerns.

Owned-domain redirects preserve routes we control, but cannot transfer every CDN image URL or guarantee image rankings. Keep local media, crawlable markup and the image sitemap, and monitor image-search results after moving.

## Before cutover and cancellation

1. No further export requested: Melissa confirms she has the images/text she wants. Existing local material stays intact. The Internet Archive may help recover some public material, but its completeness has not been checked or guaranteed.
2. A Few Favourites is retired. Optional old-caption restoration is not required by Melissa for this migration. Additional URLs discovered through Search Console or backlinks can be added to the map as needed.
3. Confirm hosting features and export DNS. Melissa confirms there are no email accounts on the old photography domain, so no email migration is required. Prepare redirects and certificates on the target host before any DNS change; test using an explicit host override where supported. Keep Exposure connected and subscribed during preparation.
4. When separately authorised, change only required web records. Verify 301 Location, TLS, every destination, four variants, trailing slashes, archive queries, unknown paths, chains and loops. Re-test Exposure forwarding as a bonus, not a dependency.
5. Verify old/new Search Console properties, use Change of Address where applicable, submit the new sitemap, update controlled links and monitor 404/search/referral traffic. [Google recommends](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) relevant permanent redirects, generally kept at least a year; prefer longer while traffic/backlinks remain.
6. Only cancel after redirect/live tests pass; the owner's content/backup decisions above are settled. Record paid-access end date and retain the account rather than deleting it. No Exposure support contact is needed.

## New domain age

Authoritative [RDAP](https://rdap.identitydigital.services/rdap/domain/melissakeizer.photos) returned registration **2 November 2026, 13:16:51 UTC**. Thirty days is **2 December 2026, around 13:17 UK time**. Defender access is not guaranteed then; retest or use the organisation's approved review process.
