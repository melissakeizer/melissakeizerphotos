# Legacy photography-domain redirects — live

The source website remains on GitHub Pages. This small Cloudflare Worker answers only the **old** domain, plus its temporary `workers.dev` preview, with fixed 301 destinations. No origin hosting, photography copy or connection to Exposure is required.

## Current state

- Cloudflare reports the old domain **Active** on Free. BigWetFish updated its delegation to `anita.ns.cloudflare.com` and `chance.ns.cloudflare.com`; registration and renewal remain with BigWetFish.
- Both `melissakeizerphotography.com` and `www.melissakeizerphotography.com` are connected to this Worker. The configuration deliberately names only these two old-domain hosts. The new website remains on GitHub Pages.
- On 17 November 2026, after the owner's explicit approval, the three old Exposure DNS records were backed up and replaced with two proxied, Cloudflare-managed Worker records. HTTPS certificates are working for both hosts.
- The `workers.dev` address remains available: https://melissa-photography-redirects.melissakeizer.workers.dev. It runs the **same code as the live old-domain redirects**, not an isolated staging deployment.
- No account IDs or credentials are checked into this folder. The Pages workflow does not deploy the Worker. No Exposure subscription or paid Cloudflare service has been changed.

## Live verification — 17 November 2026

Claws Out update: version `fa1824e4-255b-4b6b-acba-c1ac113866bd`, upload
5.88KiB (1.65KiB gzip), reported startup 2ms. Published after the new
`/stories/claws-out/` page passed GitHub Pages deployment **44068745720**.
The repeated 53-mapping suite passed **648/648 checks** through Cloudflare with
normal hostname/TLS verification. An ordinary www request also returned a direct
301 to the new Claws Out address. The new page, canonical, sitemap, archive link
and old `.photos` compatibility page were checked live; browser navigation from
that compatibility page reached the new address. All 21 gallery photographs and
their order are unchanged. Other mappings, DNS settings and domain bindings are
unchanged; previously noted local DNS-cache limitations still apply.

Initial cutover verification:

Deployment version `a78d13f7-d1b8-4f15-b000-9d24ab436a0b`, upload 5.90KiB (1.64KiB gzip), reported startup 1ms.

- **53 mappings, 648/648 checks passed** across HTTP/HTTPS and www/apex: GET/HEAD, optional trailing slashes, archive queries, stripped query values, robots, unsupported methods and real unknown-page 404s.
- The full suite connected to Cloudflare's authoritative IPv4 address while preserving the requested hostname and normal TLS certificate validation. No redirects were followed, verifying direct 301 Location responses rather than eventual destinations.
- All **47 distinct new-site destinations** returned HTTP 200 through ordinary HTTPS requests. Ordinary www requests also returned direct 301s. A normal browser visit to the old Exposure Finn URL reached the new Finn story; automated Exposure requests returned 403, so this browser result does not establish the platform's exact status-code chain.
- The .com parent delegation, Cloudflare DNS and Google DNS show the new nameservers/addresses. One local resolver still had the former apex addresses cached during verification. **Propagation is not proven complete everywhere**; retain Exposure during that transition and recheck important old links before cancellation.
- Exposure controls its own subdomain and asset URLs; their continued operation after cancellation is not guaranteed.

## Preview verification — 16 November 2026

Deployment version `4daeb7eb-7834-4c2f-98cc-efc75d5bf619`, upload 5.90KiB (1.64KiB gzip), reported startup 1ms. The new preview certificate became ready before the HTTPS checks; no certificate validation was bypassed.

- All 53 mappings checked using GET and HEAD, plus trailing slash, archive/query, robots, unsupported-method and genuine 404 cases: **162/162 checks passed over HTTP and 162/162 over HTTPS**.
- All **47 distinct new-site destination URLs** returned HTTP 200 directly over HTTPS.
- At this initial preview stage, public nameservers remained the four previous Orderbox names and the imported Exposure records were preserved. No parent DNSSEC DS record was found in that preflight check.

These historical preview results are superseded by the live verification above.

## Behaviour and checks

- 41 published stories plus homepage, category, contact and archive mappings: 53 URL cases.
- Both HTTP/HTTPS and www/apex go directly to the final new HTTPS destination.
- Optional trailing slash and HEAD support. Archive `?page=1` through `?page=5` goes to the Stories index.
- Other query values are discarded. Unknown/retired/draft pages return genuine 404s; no catch-all sends everything to home.
- No application analytics, cookies, custom visitor logging, personal identifiers, arbitrary destination parameters or upstream fetches.
- `robots.txt` allows crawling. POST and other non-navigation methods return 405.

From the main repository directory:

```sh
node scripts/prepare-migration.mjs
node --test scripts/cloudflare-redirects.test.mjs
```

The generator requires an existing production build to verify mapped story targets. Re-run it after deliberately changing the legacy mapping or publishing a previously excluded story, then review the generated diff.

## Original staged setup (cutover complete)

This records the staged cutover. Propagation checks and the owner's later Exposure cancellation remain follow-up tasks. Do not repeat the DNS deletion or nameserver changes for routine updates.

1. Create/sign into Cloudflare, add `melissakeizerphotography.com`, choose **Free**, and scan/review DNS. Keep the imported two A records and www CNAME **DNS only** during initial setup so they retain the existing Exposure connection. The screenshot supplied by the owner matches the public records inspected today. No email setup is required for this domain.
2. Stop at the two assigned Cloudflare nameservers. Check records against the existing provider before changing them. Current public records include root A `174.129.25.170` and `162.215.226.4`, plus www CNAME `domains.exposure.co`. Do not assume an automatic scan includes every private/custom record. No parent DS record was found in the preflight lookup; re-check DNSSEC before a later nameserver change.
3. Initially deploy to a **temporary workers.dev address only**, before adding live-domain routes. The current checked-in configuration now includes both production hosts. Do not enable a paid Workers subscription for this small service.
4. Verify the preview's mapped destinations, queries, 404s and response headers. Local tests are not a substitute for the account-side preview and TLS checks.
5. When ready and explicitly authorised, replace the old domain's nameservers at BigWetFish with the exact two Cloudflare-assigned values. This delegates DNS; it is not a domain transfer or a DNS-level 301. Keep existing imported web records DNS-only initially. BigWetFish is only needed if the owner cannot change nameservers herself. Preserve unrelated domain/services.
6. Once the zone is **Active**, back up and deliberately remove conflicting Exposure A/CNAME records, then attach **both** old hostnames. The actual cutover required removal of all three old records, with explicit owner approval. Cloudflare created two managed Worker records and certificates. Separate hostname bindings give direct redirects without a www-normalisation hop.
7. Verify mappings and HTTPS on both old hostnames, then allow DNS caches to update and recheck important bookmarks before Exposure cancellation. Retain old-domain renewal at BigWetFish.

## Updating this service

Claws Out's destination is now `/stories/claws-out/`. Its original Exposure path
`/746862776d2576268afc65758bbab369` remains the source key, so legacy links go
directly to the readable address. `prepare-migration.mjs` explicitly preserves
that original slug when regenerating the map. The separate compatibility page
on GitHub Pages at `/stories/746862776d2576268afc65758bbab369/` uses Astro's
zero-delay HTML refresh and canonical link. GitHub Pages serves that HTML with
HTTP 200; it is not a server-side 301. Google documents zero-delay refresh as a
[permanent redirect signal](https://developers.google.com/search/docs/crawling-indexing/301-redirects).
The old owned domain continues to use real HTTP 301 responses from this Worker.

After changing the source mapping, regenerate it from the repository root and run the tests above. Then, using the authorised official Wrangler CLI, run `wrangler deploy` from `ops/cloudflare/`. This updates the **live** redirect service; pushing to GitHub alone does not. Use a different Worker name and a preview-only configuration for isolated experiments. Do not manually replace the managed Worker DNS records or copy the currently returned Cloudflare IP addresses into DNS.

## Plan limits and sources

Workers Free currently allows **100,000 requests/day** and 10ms CPU per invocation. This map lookup performs no upstream fetches and is intended to fit comfortably within that compute allowance; actual traffic must stay within the free request limit. No paid plan or usage commitments have been activated.

Bulk Redirects is another Cloudflare option, but its CSV source URLs cannot include queries. This Worker handles the old archive queries and real unknown-page 404s in one small service, without depending on a continuing Exposure origin. The earlier provider CSV is a human handover list, not a Cloudflare Bulk Redirect import file.

Official sources checked 16 November 2026:

- https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/csv-file-format/
