// GrindNotes — zero-dependency local notes server
// Run: node server.mjs   (or double-click GrindNotes.bat)
// Optional: --lan exposes it to other devices on your wifi; GRINDNOTES_PORT overrides the port.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const NOTES = path.join(ROOT, 'notes');
const PORT = Number(process.env.GRINDNOTES_PORT || 7717);
const HOST = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';

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
  const p = path.resolve(NOTES, rel);
  const root = path.resolve(NOTES);
  if (!(p === root || p.startsWith(root + path.sep))) throw new Error('bad path');
  return p;
};
const listDir = (sub) => {
  const dir = path.join(NOTES, sub);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(f => {
      const st = fs.statSync(path.join(dir, f));
      let title = f.replace(/\.(md|txt)$/i, '');
      let preview = '';
      let firstLine = '';
      try {
        const txt = fs.readFileSync(path.join(dir, f), 'utf8');
        const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines[0]) {
          firstLine = lines[0].replace(/^#+\s*/, '');
          title = firstLine.slice(0, 60);
        }
        preview = (lines[1] || '').slice(0, 80);
      } catch {}
      return { file: sub + '/' + f, title, preview, firstLine, mtime: st.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
};
const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};
const readBody = (req) => new Promise((ok) => {
  let b = '';
  req.on('data', c => b += c);
  req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch { ok({}); } });
});
let lastStampMs = 0;
let stampSeq = 0;
const stamp = () => {
  const d = new Date();
  const now = d.getTime();
  if (now === lastStampMs) stampSeq += 1;
  else {
    lastStampMs = now;
    stampSeq = 0;
  }
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' +
    p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '_' +
    p(d.getMilliseconds(), 3) + '_' + p(stampSeq);
};

// ---- server ----
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(ROOT, 'ui.html')));
    }
    if (req.method === 'GET' && (u.pathname === '/usage' || u.pathname === '/usage.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(ROOT, 'usage.html')));
    }
    if (req.method === 'GET' && u.pathname === '/api/state') {
      const status = {};
      for (const f of fs.readdirSync(path.join(NOTES, 'status'))) {
        const p = path.join(NOTES, 'status', f);
        status[f] = { content: fs.readFileSync(p, 'utf8'), mtime: fs.statSync(p).mtimeMs };
      }
      let usage = { history: [] };
      try { usage = JSON.parse(fs.readFileSync(path.join(NOTES, 'usage.json'), 'utf8')); } catch {}
      return json(res, 200, { status, turns: listDir('turns'), scratch: listDir('scratch'), prompts: listDir('prompts'), usage });
    }
    if (req.method === 'GET' && u.pathname === '/api/file') {
      const p = safe(u.searchParams.get('name') || '');
      if (!fs.existsSync(p)) return json(res, 404, { error: 'not found' });
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
      const left = cur.replace(/[\r\n]+$/g, '');
      const right = String(content ?? '').replace(/^[\r\n]+|[\r\n]+$/g, '');
      const next = left ? (right ? left + '\n' + right + '\n' : left + '\n') : (right ? right + '\n' : '');
      fs.writeFileSync(p, next, 'utf8');
      return json(res, 200, { ok: true, mtime: fs.statSync(p).mtimeMs });
    }
    if (req.method === 'POST' && u.pathname === '/api/delete') {
      const { name } = await readBody(req);
      if (!name || !name.startsWith('scratch/')) return json(res, 403, { error: 'only scratch notes can be deleted' });
      const p = safe(name);
      if (fs.existsSync(p)) {
        // recoverable delete: park it in notes/.trash instead of unlinking
        const trash = path.join(NOTES, '.trash');
        fs.mkdirSync(trash, { recursive: true });
        fs.renameSync(p, path.join(trash, stamp() + '_' + path.basename(p)));
      }
      return json(res, 200, { ok: true });
    }
    if (req.method === 'POST' && u.pathname === '/api/new') {
      const { title } = await readBody(req);
      const file = `scratch/${stamp()}.md`;
      fs.writeFileSync(safe(file), title ? title + '\n\n' : '', 'utf8');
      return json(res, 200, { ok: true, file });
    }
    json(res, 404, { error: 'unknown route' });
  } catch (e) {
    json(res, 500, { error: String(e.message || e) });
  }
});

// hop to the next port if this one is taken (an older instance, another app…)
function start(port, retriesLeft) {
  const onErr = (e) => {
    if (e.code === 'EADDRINUSE' && retriesLeft > 0) {
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
    try {
      fs.writeFileSync(path.join(ROOT, '.grindnotes-url'), url, 'utf8');
      fs.writeFileSync(path.join(ROOT, '.grindnotes-pid'), String(process.pid), 'utf8');
    } catch {}
    console.log(`GrindNotes running at ${url}  (notes folder: ${NOTES})`);
    if (HOST === '0.0.0.0') console.log('LAN mode: also reachable from other devices on your network.');
  });
}
start(PORT, 10);
