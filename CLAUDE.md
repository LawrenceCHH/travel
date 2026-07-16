# CLAUDE.md — project rules for AI agents

This is a Jekyll + Tailwind CSS blog. Before exploring the repo, read
[`doc/project.md`](doc/project.md) for the current architecture snapshot and known gaps —
it exists so you don't have to re-derive that from scratch.

## Mandatory after every code change

`doc/project.md` holds both the architecture reference and the update history/TODOs (in
its "第二部分：更新歷史與待辦事項" section) — there is no separate `update.md`. If you
changed code, config, build steps, or architecture, before you finish:

1. Add a dated entry to **更新歷史** in `doc/project.md`: keep the two most recent
   entries in full detail, and compress the entry that now becomes third-newest down
   into the one-line summary list below them. Update the **待辦事項** list — check off
   or remove finished items, add any new follow-up work the change created.
2. If the change affects file structure, the 功能 → 程式碼 lookup table, or a key
   design decision, also update the relevant section of `doc/project.md`'s 第一部分.
3. If the change affects install, build, or deployment steps, also update `README.md`.

A change whose effect isn't reflected in these files is not done — treat doc drift as
part of the task, not a follow-up.

## Build reminders

- Styles are edited in `assets/tailwind.css`. There is no `build:css` script — Tailwind
  is compiled on the fly by the `@tailwindcss/vite` plugin during `npm run dev`/
  `npm run build`. `assets/main.css` is a gitignored, unused leftover — never edit it,
  it isn't part of the build.
- `manifest.json` and `sw.js` both require their empty Jekyll front matter (`---\n---`)
  to resolve `{{ site.baseurl }}` — don't strip it.
- If you change the service worker's precache list or cached asset set, bump
  `CACHE_NAME` in `sw.js` so visitors' browsers pick up the change.
