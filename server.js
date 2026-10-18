// Local server: serves public/ and the two API routes. On Vercel the files in
// api/ do the same job, so this file is only for running it on your computer.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { sign, sheet, tab, img } from "./lib/api.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "public");

// Settings such as SHEETSHOP_PASSWORD can sit in a .env file next to this one.
try {
  for (const line of (await fs.readFile(path.join(here, ".env"), "utf8")).split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
} catch {}
const port = Number(process.env.PORT) || 3210;
const routes = { "/api/sign": sign, "/api/sheet": sheet, "/api/tab": tab, "/api/img": img };
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".ico": "image/x-icon", ".json": "application/json",
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const route = routes[url.pathname];
  if (route) {
    let input = {};
    if (req.method === "POST") {
      let raw = "";
      for await (const chunk of req) { raw += chunk; if (raw.length > 1e5) break; }
      try { input = JSON.parse(raw); } catch {}
    }
    const { status, headers, body } = await route({ method: req.method, query: Object.fromEntries(url.searchParams), body: input });
    if (Buffer.isBuffer(body)) return res.writeHead(status, headers).end(body);
    const json = Buffer.from(JSON.stringify(body));
    const gz = /gzip/.test(req.headers["accept-encoding"] || "");
    res.writeHead(status, {
      ...headers,
      "content-type": "application/json; charset=utf-8",
      ...(gz ? { "content-encoding": "gzip" } : {}),
    });
    return res.end(gz ? gzipSync(json) : json);
  }
  const file = path.join(root, path.normalize(url.pathname === "/" ? "/index.html" : url.pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  }
}).listen(port, () => console.log(`Sheetshop running at http://localhost:${port}`));
