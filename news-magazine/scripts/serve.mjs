// Serves the public/ folder at http://localhost:3000 (set PORT to change it).

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

http
  .createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const file = path.join(PUBLIC, path.normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, ""));
    const target = pathname.endsWith("/") ? path.join(file, "index.html") : file;
    if (!target.startsWith(PUBLIC)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await fs.readFile(target);
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(target)] ?? "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    }
  })
  .listen(PORT, () => console.log(`The Daily Brief is running at http://localhost:${PORT}`));
