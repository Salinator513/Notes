# GrindNotes — agent context

This repo is the **GrindNotes app** (Sasha's local notes hub for the GRINDWAVE /
GRINDQUEST work). Zero dependencies: `server.mjs` (port **7718**), `ui.html`,
`usage.html`, `cursor.js`, data in `notes/`.

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
- **No Cowork.** Cowork was removed from the app (2026-07-07): prompt targets are
  Code + Codex only; usage shows Claude Code / Codex only.
- **Keep zero dependencies.** No packages, no build step.
- Sasha judges by feel — ship, let him try, expect iteration. Cursor feel knobs are
  the constants at the top of `cursor.js`.

## History warning — TWO GrindNotes exist (confirmed 2026-07-07)

1. **Local canonical** (the one Sasha uses day to day):
   `Documents\Codex\2026-07-06\i-wa\outputs\GrindNotes`, served at
   `http://127.0.0.1:7717/`. Orange redesign, grouped local notes, per-group
   prompts, corner Usage/Type controls, custom swinging cursor. Never reached
   GitHub — cloud sessions CANNOT see it.
2. **This repo**: a 2026-07-07 cloud rebuild from the older grindquest
   `tools/grindnotes` copy (port 7718, hops if busy) + the public GitHub Pages
   mirror (gh-pages branch, static read-only mode). The local redesign is NOT here.

**Merge direction (Sasha, 2026-07-07):** combine the two into a NEW version — his
local design leads (he likes it more), this repo's style second, this repo's
functionality underneath (per-prompt usage cards, scrolling summaries, 360° cursor,
delete/trash, static mirror, hardened launcher). Blocked until the local files get
pushed/uploaded into this repo. Don't blindly overwrite the local install's
`notes/` folder — user data stays. The grindquest `tools/grindnotes` copy is legacy.
