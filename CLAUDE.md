# CLAUDE.md — project rules for AI agents

This is a Jekyll + Tailwind CSS blog. Before exploring the repo, read
[`doc/project.md`](doc/project.md) for the current architecture snapshot and known gaps —
it exists so you don't have to re-derive that from scratch.

## Mandatory after every code change

If you changed code, config, build steps, or architecture, before you finish:

1. Update [`doc/update.md`](doc/update.md):
   - Add a dated entry to **Update History** (what changed, why).
   - Update the **Current Goals** checklist — check off finished items, add any new
     follow-up work the change created.
2. If the change affects file structure, a key design decision, or a "known gap", also
   update the file map / decisions / gaps sections in [`doc/project.md`](doc/project.md).
3. If the change affects install, build, or deployment steps, also update `README.md`.

A change whose effect isn't reflected in these files is not done — treat doc drift as
part of the task, not a follow-up.

## Build reminders

- Styles are edited in `assets/tailwind.css` and built with `npm run build:css` to
  `assets/main.css`. `assets/main.css` is gitignored — never edit it directly, it gets
  overwritten.
- `manifest.json` and `sw.js` both require their empty Jekyll front matter (`---\n---`)
  to resolve `{{ site.baseurl }}` — don't strip it.
- If you change the service worker's precache list or cached asset set, bump
  `CACHE_NAME` in `sw.js` so visitors' browsers pick up the change.
