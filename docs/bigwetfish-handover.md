# BigWetFish redirect request — simplified

Prepared for Melissa Keizer, 16 November 2026. Preparation only: no redirects, DNS or Exposure settings have been changed.

## Request

Provide permanent, unmasked HTTP 301 redirects from `melissakeizerphotography.com` and `www.melissakeizerphotography.com` to the corresponding pages on `https://melissakeizer.photos`.

The new website remains on GitHub Pages. This request concerns redirecting the old domain only; it is not a website transfer to BigWetFish.

## What to send

Send only `BigWetFish-redirects.csv` with the short support message. It contains old and new URLs for 41 stories plus homepage, archive, categories and contact. Ask them to apply the same mapping to HTTP/HTTPS and www/non-www, accepting optional trailing slashes. The CSV lists the HTTPS www source once for readability.

The earlier server-rules example is an optional internal technical reference; BigWetFish can choose the correct implementation for its own systems. It is not an AI instruction file and need not be sent. The longer migration audit is for Melissa, not the support ticket.

## Requirements

1. Cover both HTTP and HTTPS and both www/non-www, with valid certificates and ongoing renewal for the two old hostnames. Prefer a single redirect to the final new URL.
2. Match story URLs with or without a trailing slash. Example: `/finn-pointer-puppy` → `https://melissakeizer.photos/stories/finn-pointer-puppy/`.
3. Naked homepage → new homepage. Old homepage pagination `?page=1` through `?page=5` → `/posts/`, as pagination sizes differ. Travel category → Adventures, as specified in the CSV. Discard old query strings after choosing the correct rule.
4. Unmapped URLs should return genuine 404s, not redirect to the homepage.
5. Melissa confirms there are no email accounts on this old photography domain; no email migration is required. Do not change `melissakeizer.com` or the new primary site's DNS/hosting. Domain registration and redirect hosting should remain active for at least a year, preferably longer.
6. Please confirm whether the existing account can provide this, any ongoing/setup cost and the proposed cutover before changing live DNS. Prepare and test certificates/rules first where possible. Melissa will cancel Exposure herself after the owned-domain redirects have been verified live.

## Checks after cutover

Verify all CSV mappings, optional trailing slashes, all four scheme/hostname variants, TLS renewal, HTTP status/Location, unknown-path 404, and no loops/chains. Every new published story destination returned HTTP 200 during preparation.

The support request covers the owned domain only. No Exposure-owned URLs or CDN addresses are included.

## What is included in support?

BigWetFish's public terms list panel/DNS/SSL assistance under managed dedicated/VPS/cloud services, but do not promise this specific redirect setup free on every plan. Its business page lists several panel/hosting options. Melissa's actual account entitlement is unverified. This should be a modest configuration task for a hosting technician once suitable redirect hosting and certificates are available; effort and charges depend on the account. Ask politely whether it is included and request a quote before any charge or live DNS change.

Sources checked 16 November 2026: https://bigwetfish.hosting/terms-conditions/ and https://bigwetfish.hosting/business/.
