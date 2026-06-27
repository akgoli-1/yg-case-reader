// Minimal static file server for the Mock Trial simulator.
// Usage: node server.js   ->   http://localhost:8080/mock_trial.html
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  // Reverse-proxy to Ollama so the browser only ever talks to THIS origin (no CORS).
  // The app fetches /ollama/api/... and we forward it to localhost:11434/api/...
  if (req.url === '/ollama' || req.url.startsWith('/ollama/')) {
    const sub = req.url.replace(/^\/ollama/, '') || '/';
    const proxyReq = http.request(
      { host: '127.0.0.1', port: 11434, path: sub, method: req.method,
        headers: { 'Content-Type': req.headers['content-type'] || 'application/json' } },
      (pr) => { res.writeHead(pr.statusCode || 502, { 'Content-Type': pr.headers['content-type'] || 'application/json', 'Access-Control-Allow-Origin': '*' }); pr.pipe(res); }
    );
    proxyReq.on('error', (e) => { res.writeHead(502, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Ollama not reachable: ' + (e.message || e) })); });
    req.pipe(proxyReq);
    return;
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/mock_trial.html';
  if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return; }

  // Prevent directory traversal
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  const noCache = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' };
  const sendApp = () => {
    // Fallback: serve the app for any unknown path so typos like
    // /mock_trial (missing .html), trailing slashes, etc. still load it.
    fs.readFile(path.join(ROOT, 'mock_trial.html'), (e2, html) => {
      if (e2) { res.writeHead(404, {'Content-Type': 'text/plain'}); res.end('404 Not Found'); return; }
      res.writeHead(200, Object.assign({ 'Content-Type': MIME['.html'] }, noCache));
      res.end(html);
    });
  };

  const reqExt = path.extname(urlPath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Real asset (e.g. a .pdf/.png) that's missing → honest 404.
      // Extension-less navigation (typos) → serve the app so it never 404s.
      if (reqExt && reqExt !== '.html') { res.writeHead(404, {'Content-Type': 'text/plain'}); res.end('404 Not Found'); return; }
      sendApp(); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, Object.assign({ 'Content-Type': MIME[ext] || 'application/octet-stream' }, noCache));
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Mock Trial server running at http://localhost:${PORT}/mock_trial.html`);
});
