> **Maintenance rule:** after any code change, update this file — check off finished
> Current Goals items (add new ones if the change created follow-up work) and add a dated
> entry to Update History. If the change affects file structure or a design decision, also
> update [`./project.md`](./project.md). See root `CLAUDE.md` for the full rule.

## Current Goals

Cleanup remaining from the Bootstrap → Tailwind + PWA + GitHub Actions rewrite:

- [ ] Switch GitHub Pages Settings → Source to "GitHub Actions" (Settings UI, or `gh api -X POST repos/LawrenceCHH/travel/pages -f build_type=workflow`)
- [ ] Get a real Formspree form ID from [formspree.io/forms](https://formspree.io/forms) and replace `YOUR_FORM_ID` in `_includes/scripts.html`
- [ ] Run `bundle exec jekyll serve` end-to-end in an environment with Ruby installed and confirm pages/PWA/contact form all work (see Verification below — this has never actually been run)
- [ ] Replace placeholder values in `_config.yml` (`title`, `email`, `description`, `author`, `*_username`) with real values
- [ ] Replace the placeholder PWA icons in `img/icons/` with real brand icons
- [ ] Delete leftover files: `assets/app.css` (stray build output), `jekyll-theme-clean-blog.gemspec` and `screenshot.png` (gem-theme-mode leftovers not used by the Core Files install)
- [ ] Update `package.json` metadata (`name`, `description`, `author`, `repository`, `bugs`) — still the original theme's values

## Update History

### 2026-07-10 — Documented GitHub Pages workflow, built and pushed rewrite (e5be734)

- Added a "GitHub Pages Deployment" section to `doc/project.md` with the full `pages.yml`
  workflow content, the reasoning behind its shape (Node-before-Ruby ordering, required
  `pages`/`id-token` permissions, `concurrency` group, two-job build/deploy split), and the
  one-time manual setup steps (switching Pages Settings → Source to "GitHub Actions", with
  both the UI path and the `gh api` one-liner).
- Ran `npm run build:css`, committed the full Bootstrap→Tailwind+PWA+Actions rewrite (136
  files changed) and pushed to `origin/master` (`1f8996f..e5be734`).

### 2026-07-10 — Bootstrap 4 → Tailwind CSS + PWA + GitHub Actions rewrite

- Removed Bootstrap 4, jQuery, Font Awesome, and Google Fonts CDN entirely; deleted `assets/vendor/bootstrap/`, `assets/vendor/startbootstrap-clean-blog/{scss,js}`, `_sass/styles.scss`, `assets/main.scss`.
- Added Tailwind CSS v4 build pipeline (`assets/tailwind.css` → `npm run build:css` → `assets/main.css`, ~14KB minified vs. Bootstrap's 150KB+).
- Replaced all Font Awesome icons with inline SVG; self-hosted Lora + Open Sans (400/700 woff2) instead of Google Fonts CDN.
- Rewrote mobile nav toggle and contact form submission in vanilla JS (`fetch()` to Formspree); dropped the navbar hide-on-scroll and floating-label decorative effects rather than reimplementing them.
- Added PWA support: `manifest.json` + `sw.js` (both need their empty front matter to resolve `baseurl` via Liquid), placeholder app icons.
- Fixed `_config.yml` `baseurl`/`url` (were still template placeholders pointing at StartBootstrap's own GitHub Pages); disabled Google Analytics loading by default when `google_analytics` is blank.
- Switched deployment from GitHub Pages "Deploy from a branch" to a GitHub Actions workflow (`.github/workflows/pages.yml`), since Tailwind's npm build step can't run in Pages' sandboxed branch build.
- Plan was drafted, then reviewed and revised by an Opus-level review pass before implementation (caught: missing GA CDN dependency, a dead endpoint in the old Formspree integration, a `main.css` filename collision risk during the migration, and the need for empty front matter on `manifest.json`/`sw.js`).
- Created `doc/project.md`, `doc/update.md`, and rewrote `README.md` to reflect the new architecture.

## Verification

**Can run now (no Ruby required):**

```bash
npm run build:css               # should succeed, produce assets/main.css (~14KB)
```

- Confirm no leftover Bootstrap/jQuery/Font Awesome references: `grep -rIn "bootstrap\|jquery\|font-awesome" --include="*.html" _layouts _includes *.html posts/*.html`
- Confirm `manifest.json` and `sw.js` still start with the empty `---\n---` front matter (required for Liquid to run on them).
- Confirm no placeholder values are about to ship: `grep -rn "YOUR_FORM_ID\|your-email@example.com" _includes _config.yml`

**Requires a Ruby environment (not yet run — do this before the next deploy):**

```bash
bundle install
npm install && npm run build:css
bundle exec jekyll serve
```

- Open `http://localhost:4000/travel/` (note the baseurl) and check: home/post/about/contact pages render with Lora/Open Sans and the teal accent color; mobile nav opens/closes (`toggleNav()`); prev/next post links work.
- DevTools → Application tab: manifest parses without errors, service worker registers, and reloading offline still shows a previously-visited page.
- Submit the contact form (after a real Formspree ID is in place) and confirm the success/error message renders.
- Run `bin/cibuild` to confirm the full CI build sequence succeeds locally.
