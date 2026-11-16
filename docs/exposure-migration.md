# Exposure migration — preparation only

No DNS, subscriptions or domain settings have been changed.

## Evidence and boundaries

Public search evidence links Melissa's old stories to `melissakeizer.exposure.co` (including `/cat-colony-of-cala-bona` and `/designers-explorers`). The Exposure host currently returns HTTP 403 to automated requests, so its complete inventory/captions could not be compared reliably. The candidate custom domain `melissakeizerphotography.com` has `www` CNAME `domains.exposure.co` and apex A `174.129.25.170`; its HTTPS request timed out. These DNS records are consistent with Exposure, but **Melissa must confirm the exact old domain** before any changes. Do not confuse `melissakeizer.com`, which is also used for email, with the photography domain.

## Before cancellation

1. Confirm the old custom domain, registrar login and Exposure account. Export/download all originals, text, captions, dates, ordering, cover selections and URL slugs using Exposure's account tools; retain at least two independent backups. Local imports are not proof the account is fully backed up.
2. Export the full public and private story inventory, including drafts/unlisted work. Compare with the local story files and `exposure-url-map.csv`. Mark missing stories/photos/captions and verify each intended replacement visually. Resolve public drafts intentionally; do not automatically publish private work.
3. Check the old sitemap, Search Console and backlinks for aliases, trailing slash differences and renamed slugs. Preserve existing story slugs when possible. The CSV is a candidate mapping based on local slugs, **not a verified old-site inventory**.
4. Select a redirect-capable host/service for the retained domain. DNS alone cannot issue HTTP redirects. GitHub Pages cannot provide arbitrary server-side 301 mapping for another domain; a static meta-refresh page is not equivalent. Choose a provider with HTTPS for both apex and www and explicit permanent path mapping. Review availability/cost with Melissa before adopting any service.
5. Configure and test redirects before disconnecting Exposure: old homepage → new homepage; each matched story → exact new story; unmigrated content → closest relevant page only if genuinely relevant. Avoid redirecting all old stories to home. Avoid chains/loops. Keep query strings only if useful; do not carry personal tokens.
6. Test HTTP and HTTPS, apex and www variants; valid TLS must exist before an HTTPS redirect can be read. Record actual 301 status + Location for representative paths. Check email MX/TXT records are preserved.
7. Verify old/new Search Console ownership, submit the new sitemap and use Change of Address if applicable. Update social/profile links and important backlinks. Monitor 404s and indexing. Retain domain and redirects for at least a year, preferably longer while traffic/backlinks remain.
8. Only cancel Exposure after exports, inventory comparison, missing content decisions, redirects and certificate tests are complete. Confirm what cancellation does to the Exposure subdomain; redirects for that subdomain require Exposure cooperation.

## New domain age

Authoritative public RDAP (`https://rdap.identitydigital.services/rdap/domain/melissakeizer.photos`) returned registration **2 November 2026, 13:16:51 UTC** and expiry 2 November 2027. Thirty elapsed days falls on **2 December 2026, around 13:17 UK time**. Defender may still block it after that: domain age is only one possible reputation/policy input. Retest on the work network then; request the organisation's approved review/allow-list process if needed. Do not bypass endpoint protection.
