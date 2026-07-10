# Project Snapshot (for agents)

Jekyll travel blog, **Core Files install** (layouts/includes/posts are in this repo, not pulled from a gem theme). Just rewritten from Bootstrap 4 to Tailwind CSS. Read this file before exploring the repo — it should save you the grep.

Install/build/deploy commands → [`../README.md`](../README.md). Open tasks, changelog, verification commands → [`./update.md`](./update.md).

## Tech Stack

- Jekyll + `jekyll-feed` / `jekyll-paginate` / `jekyll-sitemap`
- Tailwind CSS v4 via `@tailwindcss/cli` (CSS-first config, no `tailwind.config.js`)
- Vanilla JS (no framework), inline SVG icons, self-hosted Lora + Open Sans (woff2)
- PWA: `manifest.json` + `sw.js`
- Deploy: GitHub Actions → GitHub Pages (not branch-based Pages)

**Removed**: Bootstrap 4, jQuery, Font Awesome, Google Fonts CDN. If you see a class like `btn-primary` or `masthead` it's a **custom Tailwind `@layer components` class** defined in `assets/tailwind.css`, not a Bootstrap leftover — don't assume Bootstrap semantics.

## How to Use This Repo

**Rebuild CSS after any class/style change** — Jekyll does not process Tailwind; you must:

```bash
npm run build:css                                              # one-off
npx tailwindcss -i ./assets/tailwind.css -o ./assets/main.css --watch   # while editing
```

Forgetting this means `bundle exec jekyll serve` renders with a stale or missing `assets/main.css`.

**Adding a new blog post** — create a file in `_posts/` named `YYYY-MM-DD-slug.md` (kramdown is
configured, so `.md` works — the 6 demo posts happen to be `.html`, but new posts don't need to be).
Front matter is required:

```yaml
---
layout: post
title: "Post Title"
subtitle: "One-line subtitle shown under the title."
date: 2026-07-10 09:00:00 -0000
background: '/img/posts/01.jpg'
---
```

Body content goes below the closing `---`, written as plain Markdown (or HTML). No other file
needs to change — the home page, `/posts` index, and RSS feed all pick up new posts from `_posts/`
automatically via Liquid (`site.posts`), sorted by the `date` in front matter.

**Adding a static page** (like About/Contact) — create `name.html` at the repo root with
`layout: page` front matter (`title`, `description`, `background`), then add a nav link in
`_includes/navbar.html` if it should appear in the menu (the menu is hand-written HTML, not
config-driven — see File Map below).

**Directory structure:**

```
_config.yml        site-wide settings (see below)
_layouts/           default.html (shell) / home.html / page.html / post.html
_includes/           navbar, footer, head, scripts, google-analytics, read_time
_posts/              one file per post, filename = YYYY-MM-DD-slug.{md,html}
posts/index.html     paginated post listing (layout: page)
about.html           static page
contact.html         static page with the Formspree form
assets/
  tailwind.css         Tailwind source — edit styles here
  main.css             build output (gitignored, run npm run build:css)
  scripts.js           vanilla JS (nav toggle)
  fonts/               self-hosted woff2
img/                 post/page background images, img/icons/ (PWA icons)
manifest.json, sw.js  PWA support
```

**Configuring `_config.yml`:**

| Field | Purpose |
|---|---|
| `title`, `description`, `author` | Site name/tagline/byline shown in the header and page `<title>`. |
| `email` | Used for the footer mail icon and `mailto:` link. |
| `baseurl` | Subpath the site is served under (currently `/travel`, matching GitHub Pages project-site rules). Change this if the repo/site name changes. |
| `url` | Fully-qualified site origin (currently `https://lawrencechh.github.io`), used to build absolute URLs (canonical tag, RSS feed). |
| `twitter_username` / `facebook_username` / `github_username` / `linkedin_username` / `instagram_username` | Each renders one social icon in the footer if set; leave blank to hide it. |
| `google_analytics` | Leave blank to disable (no external request made); set a GA4 ID to enable tracking. |
| `paginate` / `paginate_path` | Posts per page and pagination URL pattern for `/posts`. |
| `plugins` | Jekyll plugins in use — don't add plugins here if deploying via the old branch-based Pages build (it only whitelists specific plugins); the GitHub Actions workflow in this repo has no such restriction. |

After changing `baseurl`/`url`, rebuild and restart `jekyll serve` — Jekyll only reads `_config.yml` at startup, not on every file change.

## GitHub Pages Deployment (GitHub Actions)

Deployment is **not** the old "Deploy from a branch" Pages mode — it's a two-job GitHub Actions
workflow at `.github/workflows/pages.yml`, triggered on every push to `master` (or manually via
`workflow_dispatch`):

```yaml
name: Build and deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build:css
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
          bundler-cache: true
      - env:
          JEKYLL_ENV: production
        run: bundle exec jekyll build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Why this shape:
- **`build` runs Node before Ruby** — Tailwind must produce `assets/main.css` before `jekyll build`
  copies `assets/` into `_site/`, otherwise Jekyll ships a stylesheet-less site.
- **`permissions: pages: write` + `id-token: write`** are required by `actions/deploy-pages` (OIDC
  token exchange) — without them the deploy job fails with a permissions error, not a build error.
- **`concurrency: group: pages`** prevents two overlapping deploys from racing if you push twice
  quickly.
- **Split into `build` + `deploy` jobs** (rather than one job) is the pattern GitHub's own
  `configure-pages`/`deploy-pages` actions expect — `deploy` consumes the artifact `build` uploads.

### One-time setup steps (not yet done — see Known Gaps / `update.md`)

1. Push this workflow file to `master` (already committed, so this just means: don't delete it).
2. In the GitHub repo → **Settings → Pages → Build and deployment → Source**, switch from
   "Deploy from a branch" to **"GitHub Actions"**. This is the step that actually wires Pages to
   this workflow — without it, the workflow runs and uploads an artifact but nothing gets served.
   - UI path: `github.com/LawrenceCHH/travel/settings/pages`
   - Or via CLI: `gh api -X POST repos/LawrenceCHH/travel/pages -f build_type=workflow`
     (use `-X PUT` instead of `-X POST` if a Pages site already exists for this repo).
3. Push to `master` (or re-run manually via the Actions tab / `workflow_dispatch`) to trigger the
   first deploy.
4. Confirm at `https://lawrencechh.github.io/travel/` — check the Actions tab for the `page_url`
   output if the URL isn't obvious.

Once switched to GitHub Actions, any old Pages build from the branch-based mode stops being
served — this workflow becomes the only path to production.

## File Map

| Path | What it is / gotcha |
|---|---|
| `assets/tailwind.css` | **Source of truth for styles.** `@theme` defines `--color-primary:#0085a1`, `--font-serif` (Lora), `--font-sans` (Open Sans). `@layer components` defines `.masthead`, `.overlay`, `.page-heading`/`.post-heading`, `.subheading`, `.post-preview`, `.btn-primary`, `.section-heading`, `.reading-time`. Edit here, then rebuild. |
| `assets/main.css` | Build output of `npm run build:css`. **Gitignored.** Don't edit directly — it gets overwritten. Must exist locally or Jekyll serves an unstyled site. |
| `assets/app.css` | Leftover file from the Bootstrap→Tailwind migration (a permission error blocked its deletion). Gitignored, safe to delete, not referenced anywhere. |
| `assets/scripts.js` | One function: `toggleNav()` (mobile nav open/close). No jQuery. |
| `assets/fonts/*.woff2` | Self-hosted Lora + Open Sans, weights 400/700 only. |
| `manifest.json`, `sw.js` | **Both carry an empty Jekyll front matter (`---\n---`)** at the top — required so Liquid (`{{ site.baseurl }}` etc.) gets parsed. Don't strip those two lines or the baseurl-aware paths break. |
| `sw.js` | Cache-first for `/assets/`, `/img/`, `/fonts/`; network-first-with-cache-fallback for pages; cross-origin requests pass through uncached. `CACHE_NAME` is `clean-blog-v1` — **bump this string whenever the precache list or cached assets change**, or visitors keep stale caches. |
| `_includes/scripts.html` | Registers the service worker; also holds the contact form's `fetch()` submit logic (Formspree endpoint is currently a placeholder — see update.md). |
| `_includes/google-analytics.html` | Wrapped in `{% if site.google_analytics %}` — blank config value means zero external requests. |
| `_config.yml` | `baseurl: /travel`, `url: https://lawrencechh.github.io`. Social/author fields are still theme placeholders. |
| `.github/workflows/pages.yml` | CI: `npm ci` + `build:css` → `bundle exec jekyll build` → `upload-pages-artifact` → `deploy-pages`. |
| `bin/cibuild` | Local one-liner for the same build steps CI runs. |
| `img/icons/` | PWA icons — a placeholder abstract mark generated for this rewrite, not real brand identity. |

## Key Design Decisions

- CSS is a **build step**, not a CDN or runtime dependency — `assets/main.css` only exists after `npm run build:css` runs. This is why it's gitignored: it's CI's job to produce it, not git's job to store it.
- Decorative JS effects from the old theme (navbar hide-on-scroll, floating form labels) were deliberately dropped rather than reimplemented in vanilla JS — simpler, and consistent with the lightweight/offline goals that motivated this rewrite.
- Fonts are self-hosted (not CDN) specifically because offline support was a hard requirement — a CDN font request fails offline.
- Deployment moved from "Deploy from a branch" to GitHub Actions because Tailwind's build step (`npm run build:css`) can't run inside GitHub Pages' sandboxed branch-build.

## Known Gaps (details + checklist: see [`./update.md`](./update.md))

1. GitHub Pages Settings → Source has not been switched to "GitHub Actions" yet (manual, one-time, can't be done from a repo file).
2. Formspree contact form endpoint is still a placeholder (`YOUR_FORM_ID`) — form doesn't send mail yet.
3. This rewrite was never run through `bundle exec jekyll serve` (no Ruby in the environment it was built in) — only static checks were done.
4. `_config.yml` and `package.json` still carry the original theme's placeholder metadata (title/email/author/social/package name).
5. `img/icons/` PWA icons are a placeholder, not final brand identity.
