GrindNotes moves to the Notes repo — usage panel, 360° cursor, cowork removed

- GrindNotes app now lives in Salinator513/Notes (built from the grindquest copy; the
  local install with Codex's grouped-notes redesign was unreachable from the cloud).
- Usage window: per-prompt cards (title + small date on the right + usage/context deltas
  only); no weekly, no descriptions; cowork stripped from the whole app per Sasha.
- Cursor can now spin full 360° — spin drag regime added on top of the pendulum
  (gravity + heavy settle) from the 07-06 fix; shared cursor.js on both pages.
- Turn summaries scroll with ~3 visible; status files reseeded with current state;
  scratch notes deletable (✕ → notes/.trash); server on 7718 with /api/delete.
- Fixed silent-save-loss on failed saves, unload save (keepalive), path-prefix hole.
