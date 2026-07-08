"Can't be reached" fixed — GrindNotes gets a live web mirror + a launcher that can't fail silently

- 127.0.0.1:7718 only exists while the server runs on Sasha's PC — nothing was broken,
  nothing was serving. Fixed from both ends.
- GitHub Pages workflow deploys a read-only mirror of the app on every push:
  https://salinator513.github.io/Notes/ — same UI, editing hidden, data from the
  committed notes/ snapshot (notes/index.json built at deploy time with git mtimes).
- ui.html/usage.html auto-detect: no /api → static mode (read-only, slow poll);
  local server → full app, unchanged.
- GrindNotes.bat hardened: checks Node exists, keeps the crash window open, waits for
  the server URL file before opening the browser; server hops ports if 7718 is busy
  and supports --lan for phone-on-same-wifi access.
