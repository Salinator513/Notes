# GrindNotes

Tiny zero-dependency local notes hub for the GRINDWAVE / GRINDQUEST work.
One Node server, three HTML/JS files, no build, no packages.

## Run

Windows: double-click `GrindNotes.bat`.
Anywhere: `node server.mjs` → http://127.0.0.1:7718/

## What's in the window

- **Status** — `notes/status/*.txt`, the live last-turn / current / goals snapshot
  (read-only in the UI; agents update the files). A dot marks files touched in the
  last 24 h.
- **Prompts** — `notes/prompts/code.md` and `codex.md`, editable; the bottom box
  appends to whichever target is selected (Enter adds, Shift+Enter = newline), and
  notes can be dragged onto a prompt to append them.
- **Turn summaries** — `notes/turns/`, one file per agent turn
  (`<source>_<date>_<topic>.md`, first line = short English title). The list
  scrolls, ~3 visible at a time.
- **Scratchpad** — `notes/scratch/`, free-form notes (+ New note). Hover ✕ deletes
  (moved to `notes/.trash/`, never hard-deleted).
- **Usage** — popup fed by `notes/usage.json`
  (`{ts, source, context_pct, plan_pct, note}` appended per prompt). One card per
  prompt: title, date, how much usage the prompt burned and how much context it
  added. Tabs: Claude Code / Codex. Cowork is gone from the app entirely.

## The cursor

The arrow dangles from its tip and swings (`cursor.js`): real pendulum — gravity
pulls it back to the normal pose, heavy damping settles it fast, and a hard flick
can whip it through full 360° loops. Feel knobs are the constants at the top of
`cursor.js`.

## API (all JSON)

`GET /api/state` · `GET /api/file?name=` · `POST /api/save` · `POST /api/append`
· `POST /api/new` · `POST /api/delete` (scratch only, → `notes/.trash/`).
Only `scratch/` and `prompts/` are writable through the API.

Project hub / planning history: the `Salinator513/grindquest` repo
(`CHATLOG-GRINDWAVE.md`, goals docs). See `CLAUDE.md` here for agent rules.
