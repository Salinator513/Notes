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

## History warning

Sasha's local install (`Documents\Codex\2026-07-06\i-wa\outputs\GrindNotes`) carried
a Codex redesign (grouped notes + per-group prompts) that never reached GitHub. This
repo was rebuilt 2026-07-07 from the older grindquest `tools/grindnotes` copy, so
that redesign is NOT here. Don't blindly overwrite the local install's `notes/`
folder — user data stays. The grindquest `tools/grindnotes` copy is now legacy.
