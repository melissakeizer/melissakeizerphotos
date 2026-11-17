# Melissa Keizer’s photo journal

Personal photography stories, galleries and PhotoStream at **https://melissakeizer.photos**. Built with Astro as a static website and published through GitHub Pages. Photography and editorial content live in this repository; local planning tools are available during development.

## Run the site locally

Requires Node.js **22.12 or newer** and npm. Open Terminal in the project folder. For a fresh checkout:

```sh
git clone https://github.com/melissakeizer/melissakeizerphotos.git
cd melissakeizerphotos
npm ci
```

For normal day-to-day work, start the server:

```sh
npm run dev -- --host 127.0.0.1 --port 4322
```

Open **http://127.0.0.1:4322/melissakeizerphotos/**. Keep that Terminal window open while using the site; press **Control+C** to stop the server. If Astro chooses another port, use the address printed in Terminal. Reuse an existing running server instead of starting several.

Local development uses `/melissakeizerphotos/` in the address. The live site uses the domain root. Starting a local server does not publish changes.

Run `npm ci` again after pulling dependency/lockfile changes. If an edited module or stylesheet appears stale, restart the local server and reload the page.

## Internal tools

Keep the development server bound to `127.0.0.1`; these are local editing tools, not a public authenticated administration system. They are excluded from the published experience.

| Tool | Where to find it | What it saves |
| --- | --- | --- |
| Design grid | **Show grid / Hide grid** on local site pages | A 12-column overlay; visibility is remembered in that browser. Does not edit content. |
| Story editor | Open a narrative story and click **Edit story** | Edit section text, headings, captions and photo layouts. **Save changes** writes the local story file. Browser drafts and `.local/story-editor-backups/` provide recovery. Gallery files are edited through the content workflow rather than this story editor. |
| PhotoStream arranger | `/melissakeizerphotos/photostream-arranger/`, or **Arrange this feed** | Auto-saves the arrangement in the same browser. Supports pages, rows, replacements, waiting area, Q&A notes and desktop uploads. **Copy changes for Codex** exports the plan; applying it is a separate content change. |
| Content board | `/melissakeizerphotos/content-board/` | Moves ideas between planning stages in the local `content-planning/ideas.json` file. A Published status is a planning label, not a deployment action. |
| Sharing artwork | `/melissakeizerphotos/previews/social-home-v2/` | A fixed 1200 × 630 HTML composition. The selected exported image is `public/social-home.jpg`. |

The arranger’s **Reset to match live feed** means the current **local source feed**, not a download of the public site. Only use it when intentionally replacing the browser draft. Clearing browser storage can lose an unsaved/export-only arrangement. Uploaded originals are staged privately under `.local/photostream-uploads/`; uploads do not publish automatically.

Story-editor saves modify source files immediately, but still require Git review and deployment to reach the public site. Avoid editing the same story in several tabs; the editor detects conflicting saves.

The content board needs the private `content-planning/ideas.json` file. It is intentionally ignored by Git. On a new checkout, restore your private copy, or create an empty JSON array (`[]`) there for an empty board. This does not affect the public website.

The Astro developer toolbar can be disabled on a new machine with:

```sh
npm run astro -- preferences disable devToolbar
```

## Content and source files

| Location | Purpose |
| --- | --- |
| `src/content/stories/` | Story/gallery metadata and section content. The Markdown filename determines the story slug. |
| `public/photos/` | Source photography. Preserve originals; do not delete them to reduce deployment size. Some original collections are intentionally ignored locally. |
| `src/lib/field-notes.ts` | PhotoStream titles, captions, locations and displayed camera details. |
| `src/data/photo-stream-plan.json` | Applied PhotoStream page and row order. |
| `src/lib/photo-stream-questions.ts` | PhotoStream Q&A content. |
| `src/components/`, `src/styles/`, `src/pages/` | Shared components, styles and routes. |
| `src/components/Analytics.astro` | Configurable Umami loader and navigation events. |
| `public/social-home.jpg` | Shared homepage/archive/PhotoStream social artwork. Individual story cards are generated from their hero photographs. |
| `ops/cloudflare/` | Live legacy-domain redirect service. Deployed separately from the GitHub Pages workflow. |

Read [Adding a story or gallery](docs/ADDING-A-STORY.md) before creating content. Narrative stories use `type: "story"`; galleries use `type: "gallery"` and a gallery layout. Drafts remain unpublished until intentionally changed. Narrative section bodies use the project’s existing JSON format inside the Markdown file; use a similar existing story as the starting point.

## Check and preview a production build

```sh
npm run check:content
node --experimental-strip-types --test scripts/*.test.mjs
npm run build
npm run check:deployment
npm run check:launch
npm run preview -- --host 127.0.0.1 --port 4323
```

Open **http://127.0.0.1:4323/** for production preview. Local editing tools are intentionally unavailable there. A production build does not publish by itself.

The media pipeline generates responsive web copies, removes unnecessary source/cache files from `dist` only, and preserves aspect ratios/orientation. It checks images, videos, internal links and metadata. The project enforces a **750MB** deployment budget to leave room below GitHub Pages’ 1GB limit. See [media delivery](docs/media-delivery.md).

Stories and PhotoStream share the same photo lightbox, with previous/next, arrow
keys, Escape, and focus returned to the selected photo when closed. PhotoStream
enables it only above 600px, where its feed uses columns; at 600px and below the
full-width photos remain ordinary images. Resizing into the mobile layout closes
an open PhotoStream lightbox. Story lightboxes remain available at every width.

Do not manually edit `dist`, `public/_media`, `public/_drawings`, `public/_responsive` or `public/social`: they are generated output/caches. Replacing a source photograph or social image changes its generated cache identity automatically.

## Publish changes

Review `git status` and the diff, run the relevant checks, then commit only the intended files and push to `main`. The workflow in `.github/workflows/deploy.yml` builds, audits and deploys to GitHub Pages. Check its result under the repository’s **Actions** tab and verify the live page afterwards.

Untracked uploads, private planning notes and local backups should not be swept into a commit. Do not put credentials, passwords or private account/billing notes in this public repository.

Umami is enabled through GitHub Actions repository variables `PUBLIC_UMAMI_ENABLED`, `PUBLIC_UMAMI_WEBSITE_ID` and `PUBLIC_UMAMI_SCRIPT_URL`. `PUBLIC_GOOGLE_SITE_VERIFICATION` is optional for a Search Console HTML-verification token. Public website IDs/tokens are configuration; account API keys and credentials must remain private. Localhost does not send analytics.

Domain/DNS and legacy redirects are separate from the website deployment. Changing this repository does not automatically update registrar nameservers or publish the Cloudflare redirect service. See [Cloudflare setup](ops/cloudflare/README.md) and [launch administration](docs/launch-admin.md).
