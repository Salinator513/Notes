GRINDNOTES

Open as an app:
1. Double-click GrindNotes-App.vbs for the quiet launcher.
2. Or double-click GrindNotes.bat if you want to see launch messages.

The launcher starts the local server, then opens Edge or Chrome in app mode. If app mode is unavailable, it falls back to the normal browser.

Manual fallback:
1. Open a terminal in this folder.
2. Run: node server.mjs
3. Open the URL printed by the server.

What writes where:
- notes/status/*.txt: assistant-written status, read-only in the app.
- notes/turns/*.md: condensed turn summaries, read-only in the app.
- notes/scratch/*.md: Sasha scratch notes, editable in the app.
- notes/prompts/*.md: local prompt inboxes for Code/Cowork/Codex; prompt bar appends nonblank text here.
- notes/usage.json: live usage history read by the usage popup.

API invariants kept:
- GET /api/state
- GET /api/file?name=rel/path
- POST /api/save {name,content}, scratch-only
- POST /api/new {title?}

UI rules:
- Summaries section rule: do not render separate Completed/Working Towards subtabs; include those sections inside each summary file.
- Notes are local scratch files; AI turn summaries live in notes/turns/*.md and should provide their own short titles plus verbatim chat where useful.
- Response type rail appends the selected style instruction to the bottom of the next nonblank prompt, then clears itself after send.
