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
};

const server = http.createServer((req, res) => {
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

  fs.readFile(filePath, (err, data) => {
    if (err) { sendApp(); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, Object.assign({ 'Content-Type': MIME[ext] || 'application/octet-stream' }, noCache));
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Mock Trial server running at http://localhost:${PORT}/mock_trial.html`);
});
