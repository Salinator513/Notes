// GrindNotes — zero-dependency local notes server
// Run: node server.mjs   (or double-click GrindNotes.bat)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const NOTES = path.join(ROOT, 'notes');
const PORT = 7718;

// ---- ensure folder layout ----
const DIRS = ['status', 'turns', 'scratch', 'prompts'];
fs.mkdirSync(NOTES, { recursive: true });
for (const d of DIRS) fs.mkdirSync(path.join(NOTES, d), { recursive: true });
const seed = (rel, content) => {
  const p = path.join(NOTES, rel);
  if (!fs.existsSync(p)) fs.writeFileSync(p, content, 'utf8');
};
seed('status/1-LAST-TURN.txt', 'Nothing logged yet.');
seed('status/2-CURRENT.txt', 'Nothing logged yet.');
seed('status/3-GOALS.txt', 'Nothing logged yet.');
seed('prompts/code.md', 'Code prompt\n\n');
seed('prompts/codex.md', 'Codex prompt\n\n');
seed('usage.json', JSON.stringify({ history: [] }, null, 2));

const WRITABLE = (rel) => rel.startsWith('scratch/') || rel.startsWith('prompts/');

// ---- helpers ----
const safe = (rel) => {
  const base = path.resolve(NOTES);
  const p = path.resolve(base, rel);
  if (p !== base && !p.startsWith(base + path.sep)) throw new Error('bad path');
  return p;
};
const listDir = (sub) => {
  const dir = path.join(NOTES, sub);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(f => {
      const st = fs.statSync(path.join(dir, f));
      if (!st.isFile()) return null;
      let title = f.replace(/\.(md|txt)$/i, '');
      let preview = '';
      try {
        const txt = fs.readFileSync(path.join(dir, f), 'utf8');
        const lines = txt.split('\n').filter(l => l.trim());
        if (lines[0]) title = lines[0].replace(/^#+\s*/, '').slice(0, 60);
        preview = (lines[1] || '').slice(0, 80);
      } catch {}
      return { file: sub + '/' + f, title, preview, mtime: st.mtimeMs };
    })
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime);
};
const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};
const page = (res, file, type) => {
  res.writeHead(200, { 'Content-Type': type });
  res.end(fs.readFileSync(path.join(ROOT, file)));
};
const readBody = (req) => new Promise((ok) => {
  let b = '';
  req.on('data', c => b += c);
  req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch { ok({}); } });
});
const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

// ---- server ----
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) {
      return page(res, 'ui.html', 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && (u.pathname === '/usage' || u.pathname === '/usage.html')) {
      return page(res, 'usage.html', 'text/html; charset=utf-8');
    }
    if (req.method === 'GET' && u.pathname === '/cursor.js') {
      return page(res, 'cursor.js', 'application/javascript; charset=utf-8');
    }
    if (req.method === 'GET' && u.pathname === '/api/state') {
      const status = {};
      for (const f of fs.readdirSync(path.join(NOTES, 'status'))) {
        if (f.startsWith('.')) continue;
        const p = path.join(NOTES, 'status', f);
        status[f] = { content: fs.readFileSync(p, 'utf8'), mtime: fs.statSync(p).mtimeMs };
      }
      let usage = { history: [] };
      try { usage = JSON.parse(fs.readFileSync(path.join(NOTES, 'usage.json'), 'utf8')); } catch {}
      return json(res, 200, { status, turns: listDir('turns'), scratch: listDir('scratch'), prompts: listDir('prompts'), usage });
    }
    if (req.method === 'GET' && u.pathname === '/api/file') {
      const name = u.searchParams.get('name') || '';
      if (!name) return json(res, 400, { error: 'name required' });
      const p = safe(name);
      if (!fs.existsSync(p) || !fs.statSync(p).isFile()) return json(res, 404, { error: 'not found' });
      return json(res, 200, { content: fs.readFileSync(p, 'utf8'), mtime: fs.statSync(p).mtimeMs });
    }
    if (req.method === 'POST' && u.pathname === '/api/save') {
      const { name, content } = await readBody(req);
      if (!name || !WRITABLE(name)) return json(res, 403, { error: 'only scratch/prompts are editable' });
      fs.writeFileSync(safe(name), content ?? '', 'utf8');
      return json(res, 200, { ok: true, mtime: fs.statSync(safe(name)).mtimeMs });
    }
    if (req.method === 'POST' && u.pathname === '/api/append') {
      const { name, content } = await readBody(req);
      if (!name || !WRITABLE(name)) return json(res, 403, { error: 'only scratch/prompts are appendable' });
      const p = safe(name);
      const cur = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
      const sep = cur && !cur.endsWith('\n\n') ? (cur.endsWith('\n') ? '\n' : '\n\n') : '';
      fs.writeFileSync(p, cur + sep + (content ?? '') + '\n', 'utf8');
      return json(res, 200, { ok: true, mtime: fs.statSync(p).mtimeMs });
    }
    if (req.method === 'POST' && u.pathname === '/api/new') {
      const { title } = await readBody(req);
      const file = `scratch/${stamp()}.md`;
      fs.writeFileSync(safe(file), (title || 'Note ' + stamp()) + '\n\n', 'utf8');
      return json(res, 200, { ok: true, file });
    }
    if (req.method === 'POST' && u.pathname === '/api/delete') {
      const { name } = await readBody(req);
      if (!name || !name.startsWith('scratch/')) return json(res, 403, { error: 'only scratch notes can be deleted' });
      const p = safe(name);
      if (!fs.existsSync(p)) return json(res, 404, { error: 'not found' });
      const trash = path.join(NOTES, '.trash');
      fs.mkdirSync(trash, { recursive: true });
      fs.renameSync(p, path.join(trash, stamp() + '_' + path.basename(p)));
      return json(res, 200, { ok: true });
    }
    json(res, 404, { error: 'unknown route' });
  } catch (e) {
    json(res, 500, { error: String(e.message || e) });
  }
});
// --lan exposes the server to other devices on the local network (phone etc.)
const HOST = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
function start(port, retriesLeft){
  const onErr = (e) => {
    if (e.code === 'EADDRINUSE' && retriesLeft > 0){
      console.log(`port ${port} is busy — trying ${port + 1}…`);
      start(port + 1, retriesLeft - 1);
    } else {
      console.error('GrindNotes failed to start:', e.message);
      process.exit(1);
    }
  };
  server.once('error', onErr);
  server.listen(port, HOST, () => {
    server.removeListener('error', onErr);
    const url = `http://127.0.0.1:${port}/`;
    try { fs.writeFileSync(path.join(ROOT, '.grindnotes-url'), url); } catch {}
    console.log(`GrindNotes running at ${url}  (notes folder: ${NOTES})`);
    if (HOST === '0.0.0.0') console.log('LAN mode: also reachable from other devices on your network.');
  });
}
start(PORT, 10);
