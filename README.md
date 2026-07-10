# Travel Blog (Jekyll)

A Jekyll blog, originally based on [Start Bootstrap's Clean Blog](https://startbootstrap.com/themes/clean-blog-jekyll/) theme, rebuilt on Tailwind CSS with PWA offline support and GitHub Actions deployment.

## Tech Stack

- **Jekyll** — Core Files install (layouts/includes/posts live directly in this repo, not pulled in from a gem theme).
- **Tailwind CSS v4** (`@tailwindcss/cli`) — utility-first styles, built via `npm run build:css`.
- **Vanilla JS** — no framework; `assets/scripts.js` only handles the mobile nav toggle.
- **Inline SVG** — icons are hand-written SVG, no icon font.
- **Self-hosted fonts** — Lora + Open Sans (400/700) as local `woff2` files.
- **PWA** — `manifest.json` + `sw.js` for installability and offline reading.

**Removed** in the last rewrite: Bootstrap 4, jQuery, Font Awesome, Google Fonts CDN.

## Prerequisites

- Ruby 3.2+ with Bundler (builds the site)
- Node 20+ (builds the CSS)

Both toolchains are required — Jekyll doesn't know how to run Tailwind, and Tailwind doesn't know how to render Liquid.

## Local Development

```bash
bundle install
npm install
npm run build:css       # assets/tailwind.css -> assets/main.css (gitignored, ~14KB minified)
bundle exec jekyll serve
```

`assets/main.css` is a build artifact and is not committed — you must run `build:css` at least once after cloning, and again any time you edit `assets/tailwind.css`.

To rebuild CSS automatically while editing styles, run a watcher in a second terminal:

```bash
npx tailwindcss -i ./assets/tailwind.css -o ./assets/main.css --watch
```

`bin/cibuild` runs the full build (`npm run build:css` + `bundle exec jekyll build`) in one command — the same steps CI runs.

## Configuration

Edit `_config.yml`:

- `title`, `email`, `description`, `author`, `*_username` — still placeholder values from the original theme; replace with real values.
- `baseurl` / `url` — currently set for `https://lawrencechh.github.io/travel`.
- `google_analytics` — leave blank to disable (no external request is made); set a GA4 ID to enable tracking via `_includes/google-analytics.html`.

## Contact Form (Formspree)

The contact page submits via `fetch()` to Formspree (`_includes/scripts.html`). You must replace the placeholder endpoint:

```js
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```

with a real form ID from [formspree.io/forms](https://formspree.io/forms). The older `//formspree.io/{email}` endpoint format has been retired by Formspree and will not deliver mail.

## PWA / Offline Support

`manifest.json` and `sw.js` make the site installable and readable offline:

- Static assets (`/assets/`, `/img/`, `/fonts/`) are served cache-first.
- Pages are served network-first, falling back to cache when offline — so pages a visitor has already opened stay readable without a connection.

If you change the precache list or want to force visitors' caches to refresh, bump `CACHE_NAME` in `sw.js` (currently `clean-blog-v1`).

The app icons in `img/icons/` are a placeholder mark — swap them for real brand icons before shipping.

## Deployment (GitHub Actions)

Pushing to `master` triggers `.github/workflows/pages.yml`:

1. **build job** — `npm ci` + `npm run build:css`, then `bundle exec jekyll build` (`JEKYLL_ENV=production`), artifact uploaded via `actions/upload-pages-artifact`.
2. **deploy job** — `actions/deploy-pages` publishes the artifact.

> **One-time manual step required:** GitHub → repo Settings → Pages → Source must be set to **GitHub Actions** (this can't be set from a file in the repo). This replaces the old "Deploy from a branch" mode. You can also set it via:
> ```bash
> gh api -X POST repos/LawrenceCHH/travel/pages -f build_type=workflow
> ```

## Project Structure

```
_layouts/, _includes/    Jekyll templates
_posts/, posts/          blog content
assets/tailwind.css      Tailwind source (edit this, not main.css)
assets/main.css          build output (gitignored)
manifest.json, sw.js     PWA support
.github/workflows/       CI build + deploy
```

See [`doc/project.md`](doc/project.md) for the full file map and design decisions.

## Development Docs

- [`doc/project.md`](doc/project.md) — architecture snapshot for contributors/agents picking up this repo.
- [`doc/update.md`](doc/update.md) — current task checklist, changelog, and verification commands.

## Credits & License

Built on top of [Clean Blog Jekyll](https://startbootstrap.com/themes/clean-blog-jekyll/) by [Start Bootstrap](https://startbootstrap.com/) / [David Miller](http://davidmiller.io/), based on [Bootstrap](https://getbootstrap.com/). Code released under the [MIT](LICENSE) license (Copyright 2013-2021 Start Bootstrap LLC).
