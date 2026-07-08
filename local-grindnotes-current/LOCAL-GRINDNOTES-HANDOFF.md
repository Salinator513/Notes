# Local GrindNotes Current Handoff

This folder contains the real local GrindNotes app that Codex and Sasha were editing on the PC.

Local source path on Sasha's machine:

`C:\Users\Sasha\Documents\Codex\2026-07-06\i-wa\outputs\GrindNotes`

Local app URL when the server is running:

`http://127.0.0.1:7717/`

Use these files as the source for the combined/new version:

- `local-grindnotes-current/ui.html` - current orange UI with grouped local notes, summaries, prompt bar, corner Usage/Type controls, and swinging cursor.
- `local-grindnotes-current/usage.html` - current local usage popup styling.
- `local-grindnotes-current/server.mjs` - current local zero-dependency server/API.

Do not use the repository-root `ui.html`, `usage.html`, or `server.mjs` as the source of truth for Sasha's local redesign. Those came from the older public mirror rebuild.

Notes/data warning:

- The local `notes/` folder was intentionally not copied here. Do not overwrite Sasha's local `notes/` folder from the repo.
- If you need sample data, create throwaway fixtures separately.

File timestamps copied from local source:

- ui.html: 2026-07-07T19:12:09.138Z
- usage.html: 2026-07-07T18:49:17.272Z
- server.mjs: 2026-07-07T18:28:36.447Z

Requested direction from Sasha:

Combine the local GrindNotes website style/functionality with the newer public/Notes repo functionality into a new version, using this folder as the local-app source.
