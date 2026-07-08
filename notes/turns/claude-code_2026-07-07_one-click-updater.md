One-click updater — the local install updates itself now

- Sasha asked me to update his PC directly; cloud sessions physically can't
  touch his filesystem, so the next best thing ships instead.
- Update-GrindNotes.bat: download once from the live site, double-click —
  stops the old server, swaps in the 5 app files from GitHub, never touches
  notes/, relaunches GrindNotes. Reusable for every future update.
- Hosted at https://salinator513.github.io/Notes/Update-GrindNotes.bat (the
  Pages mirror now also serves server.mjs and both launchers as downloads).
- Downloads go to *.new first and swap only when all succeed — a failed
  download changes nothing.
