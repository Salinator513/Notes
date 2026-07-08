// Builds the static read-only mirror of GrindNotes (for GitHub Pages).
// Output: <outdir>/ with index.html (= ui.html), usage.html, cursor.js, notes/,
// and notes/index.json — a snapshot in the same shape as GET /api/state.
// Usage: node tools/build-site.mjs [outdir]   (default: dist)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOTES = path.join(ROOT, 'notes');
const OUT = path.resolve(ROOT, process.argv[2] || 'dist');

// git checkout resets file mtimes, so take the last-commit time when available
const mtimeOf = (p) => {
  try {
    const t = execSync(`git log -1 --format=%ct -- "${path.relative(ROOT, p)}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (t) return Number(t) * 1000;
  } catch {}
  return fs.statSync(p).mtimeMs;
};
const listDir = (sub) => {
  const dir = path.join(NOTES, sub);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(f => {
      const p = path.join(dir, f);
      if (!fs.statSync(p).isFile()) return null;
      let title = f.replace(/\.(md|txt)$/i, '');
      let preview = '';
      try {
        const lines = fs.readFileSync(p, 'utf8').split('\n').filter(l => l.trim());
        if (lines[0]) title = lines[0].replace(/^#+\s*/, '').slice(0, 60);
        preview = (lines[1] || '').slice(0, 80);
      } catch {}
      return { file: sub + '/' + f, title, preview, mtime: mtimeOf(p) };
    })
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime);
};
const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    // dotfiles stay out of the mirror except the note-groups meta the UI needs
    if (f.startsWith('.') && f !== '.groups.json') continue;
    const src = path.join(from, f);
    if (fs.statSync(src).isDirectory()) copyDir(src, path.join(to, f));
    else fs.copyFileSync(src, path.join(to, f));
  }
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
// app + launcher files ride along so the site doubles as the download source
for (const f of ['ui.html', 'usage.html', 'server.mjs', 'GrindNotes.bat', 'GrindNotes-App.vbs', 'Update-GrindNotes.bat'])
  fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
fs.copyFileSync(path.join(ROOT, 'ui.html'), path.join(OUT, 'index.html'));
copyDir(NOTES, path.join(OUT, 'notes'));

const status = {};
for (const f of fs.readdirSync(path.join(NOTES, 'status'))) {
  if (f.startsWith('.')) continue;
  const p = path.join(NOTES, 'status', f);
  status[f] = { content: fs.readFileSync(p, 'utf8'), mtime: mtimeOf(p) };
}
let usage = { history: [] };
try { usage = JSON.parse(fs.readFileSync(path.join(NOTES, 'usage.json'), 'utf8')); } catch {}
const state = { static: true, status, turns: listDir('turns'), scratch: listDir('scratch'), prompts: listDir('prompts'), usage };
fs.writeFileSync(path.join(OUT, 'notes', 'index.json'), JSON.stringify(state));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('built static mirror at', OUT);
