# GrindNotes — agent context

This repo is the **GrindNotes app** (Sasha's local notes hub for the GRINDWAVE /
GRINDQUEST work). Zero dependencies: `server.mjs` (port **7717**, hops if busy),
`ui.html` (cursor physics inline in `initCursor()`), `usage.html`, data in `notes/`.

## Where the project context lives

The shared hub is the **`Salinator513/grindquest`** repo: `CHATLOG-GRINDWAVE.md`
(verbatim transcript), goals docs, `PROGRESS.md`. Add that repo to the session
before reading it.

## Standing rules

- **Log verbatim.** Every user message and assistant response goes word-for-word
  (typos included) into `grindquest/CHATLOG-GRINDWAVE.md`. If a session can't push
  to grindquest, park the entry in `docs/` here (see `docs/CHATLOG-SYNC-*.md`) and
  say so.
- **Turn summaries.** Each agent turn appends `notes/turns/<source>_<date>_<topic>.md`
  (≤5 bullets, first line = short English title) and a usage entry to
  `notes/usage.json` (`{ts, source, context_pct, plan_pct, note}` — the note is the
  prompt title shown in the Usage window).
- **No Cowork.** Cowork was removed from the app ENTIRELY (Sasha, 2026-07-07):
  prompt targets are Code + Codex only; usage tabs Claude / Codex; no cowork icons,
  chips, or styling anywhere. Old cowork-era files fall back to the Code chip.
- **Keep zero dependencies.** No packages, no build step.
- Sasha judges by feel — ship, let him try, expect iteration. Cursor feel knobs are
  the numeric constants in `initCursor()` in `ui.html` (kick .45/±28, gravity 1.2,
  drag .95 spinning / .86 settling, vel cap ±45).

## History — the merge is DONE (2026-07-07, this repo is now canonical)

The repo root app is the COMBINED version Sasha asked for: his local orange design
(grouped note Sets, prompt dock, corner Usage/Type rail, collapsible sidebar) with
the cloud rebuild's functionality underneath (per-prompt usage cards, 360°-capable
pendulum cursor, delete→notes/.trash, static GitHub Pages mirror mode, hardened
launcher, port hopping, --lan). The local install's source snapshot is archived in
`local-grindnotes-current/` (also on branch `codex/local-grindnotes-current`).

**To update Sasha's local install** (`Documents\Codex\2026-07-06\i-wa\outputs\
GrindNotes`): copy ui.html, usage.html, server.mjs, GrindNotes.bat,
GrindNotes-App.vbs from this repo over the install's files. Do NOT touch the
install's `notes/` folder — user data stays. The grindquest `tools/grindnotes`
copy is legacy; this repo wins.

Public read-only mirror: https://salinator513.github.io/Notes/ (auto-deploys from
every push via .github/workflows/pages.yml → gh-pages).
