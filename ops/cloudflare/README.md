# Legacy photography-domain redirects — preview deployed

The source website remains on GitHub Pages. This small Cloudflare Worker answers only the **old** domain, plus its temporary `workers.dev` preview, with fixed 301 destinations. No origin hosting, photography copy or connection to Exposure is required.

## Current state

- Free Cloudflare zone onboarding started by the owner on 16 November 2026. The zone is still Pending and public nameservers remain with the previous DNS provider; no registrar change has been made here.
- `worker.mjs`, generated `redirect-map.mjs` and preview-only `wrangler.jsonc` are deployed to https://melissa-photography-redirects.melissakeizer.workers.dev. The old domain is not attached yet.
- No account IDs, credentials or custom-domain bindings are checked into this folder.
- The Pages workflow does not deploy these files. Nothing in this preparation changes DNS or cancels Exposure.

## Preview verification — 16 November 2026

Deployment version `4daeb7eb-7834-4c2f-98cc-efc75d5bf619`, upload 5.90KiB (1.64KiB gzip), reported startup 1ms. The new preview certificate became ready before the HTTPS checks; no certificate validation was bypassed.

- All 53 mappings checked using GET and HEAD, plus trailing slash, archive/query, robots, unsupported-method and genuine 404 cases: **162/162 checks passed over HTTP and 162/162 over HTTPS**.
- All **47 distinct new-site destination URLs** returned HTTP 200 directly over HTTPS.
- Public nameservers remain the four previous Orderbox names. Direct queries to Cloudflare's assigned nameserver return the two existing root A addresses and the existing www CNAME, preserving the current origin for the initial delegation step. No parent DNSSEC DS record was found in the latest public preflight check.

These are preview results, not evidence that the old domain redirects yet. After nameserver delegation and both Custom Domain bindings, repeat the live checks on the actual old hostnames before cancelling Exposure.

## Behaviour and checks

- 41 published stories plus homepage, category, contact and archive mappings: 53 URL cases.
- Both HTTP/HTTPS and www/apex go directly to the final new HTTPS destination.
- Optional trailing slash and HEAD support. Archive `?page=1` through `?page=5` goes to the Stories index.
- Other query values are discarded. Unknown/retired/draft pages return genuine 404s; no catch-all sends everything to home.
- No analytics, cookies, visitor logging, personal identifiers, arbitrary destination parameters or upstream fetches.
- `robots.txt` allows crawling. POST and other non-navigation methods return 405.

From the main repository directory:

```sh
node scripts/prepare-migration.mjs
node --test scripts/cloudflare-redirects.test.mjs
```

The generator requires an existing production build to verify mapped story targets. Re-run it after deliberately changing the legacy mapping or publishing a previously excluded story, then review the generated diff.

## Account-side sequence

1. Create/sign into Cloudflare, add `melissakeizerphotography.com`, choose **Free**, and scan/review DNS. Keep the imported two A records and www CNAME **DNS only** during initial setup so they retain the existing Exposure connection. The screenshot supplied by the owner matches the public records inspected today. No email setup is required for this domain.
2. Stop at the two assigned Cloudflare nameservers. Check records against the existing provider before changing them. Current public records include root A `174.129.25.170` and `162.215.226.4`, plus www CNAME `domains.exposure.co`. Do not assume an automatic scan includes every private/custom record. No parent DS record was found in the preflight lookup; re-check DNSSEC before a later nameserver change.
3. Deploy the Worker to a **temporary workers.dev address only**, using Cloudflare's official dashboard or Wrangler. The checked-in configuration intentionally has no live-domain routes. With the official Wrangler CLI available, run `wrangler deploy` from this folder after signing into the intended account. Do not enable a paid Workers subscription for this small service.
4. Verify the preview's mapped destinations, queries, 404s and response headers. Local tests are not a substitute for the account-side preview and TLS checks.
5. When ready and explicitly authorised, replace the old domain's nameservers at BigWetFish with the exact two Cloudflare-assigned values. This delegates DNS; it is not a domain transfer or a DNS-level 301. Keep existing imported web records DNS-only initially. BigWetFish is only needed if the owner cannot change nameservers herself. Preserve unrelated domain/services.
6. Once Cloudflare reports the zone **Active**, attach **both** old hostnames to this Worker. Custom Domains require an active zone. Existing CNAME records conflict with Custom Domain creation, so replace the existing www CNAME deliberately at this stage; do not delete it early. Review existing apex A records when creating the apex binding. Cloudflare provisions managed certificates for Custom Domains; wait for both hosts' certificate/binding readiness and verify HTTPS. The two hostnames need separate bindings, giving direct redirects without a www-normalisation hop.
7. Verify every mapping live over both schemes and both hostnames, optional slashes, archive queries, robots, unknown paths, status codes, Location headers and certificate validity. Confirm the new site is unchanged. Only then cancel the Exposure subscription, while retaining old-domain renewal at BigWetFish.

The remaining account-side steps depend on the actual Cloudflare dashboard and assigned nameservers. No nameserver values should be guessed or copied from another domain.

## Plan limits and sources

Workers Free currently allows **100,000 requests/day** and 10ms CPU per invocation. This map lookup performs no upstream fetches and is intended to fit comfortably within that compute allowance; actual traffic must stay within the free request limit. No paid plan or usage commitments have been activated.

Bulk Redirects is another Cloudflare option, but its CSV source URLs cannot include queries. This Worker handles the old archive queries and real unknown-page 404s in one small service, without depending on a continuing Exposure origin. The earlier provider CSV is a human handover list, not a Cloudflare Bulk Redirect import file.

Official sources checked 16 November 2026:

- https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/csv-file-format/
