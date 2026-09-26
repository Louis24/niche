#!/usr/bin/env node

'use strict';

// Minimal read-only static server for the generated site.
//   node preview.js   ->   http://localhost:8000

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PREVIEW_PORT) || 8000;
const HOST = '127.0.0.1';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.csv': 'text/csv; charset=utf-8'
};

http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    const target = path.normalize(path.join(ROOT, pathname));
    if (!target.startsWith(ROOT)) {
        res.writeHead(403).end('forbidden');
        return;
    }

    fs.stat(target, (err, stat) => {
        if (err || !stat.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
            'Content-Length': stat.size,
            'Cache-Control': 'no-store'
        });
        fs.createReadStream(target).pipe(res);
    });
}).listen(PORT, HOST, () => {
    console.log(`NeonStack preview:  http://${HOST}:${PORT}/`);
    console.log(`Apps market:        http://${HOST}:${PORT}/apps/`);
    console.log('Static read-only. Press Ctrl+C to stop.');
});
