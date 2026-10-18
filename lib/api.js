// The two JSON endpoints, shared by the local server and Vercel.
import { parseSheetRef, getSheet, getTab, SheetError } from "./google.js";

const PAGE = 400;
const CACHE = "public, max-age=60, s-maxage=600, stale-while-revalidate=86400";

function ref(query) {
  const r = parseSheetRef(query.sheet);
  if (!r) throw new SheetError("That doesn't look like a Google Sheets link.");
  return r;
}

async function run(fn) {
  try {
    return { status: 200, headers: { "cache-control": CACHE }, body: await fn() };
  } catch (e) {
    const status = e instanceof SheetError ? e.status : 500;
    if (status === 500) console.error(e);
    return {
      status,
      headers: { "cache-control": "no-store" },
      body: { error: status === 500 ? "Something went wrong reading this sheet." : e.message },
    };
  }
}

// GET /api/sheet?sheet=<link or id>  ->  { title, tabs: [{ gid, name }] }
export const sheet = (query) => run(() => getSheet(ref(query)));

// GET /api/tab?sheet=<link or id>&gid=<tab>&page=0  ->  { total, page, pages, items }
export const tab = (query) =>
  run(async () => {
    const all = await getTab(ref(query), String(query.gid ?? ""));
    const page = Math.max(0, parseInt(query.page, 10) || 0);
    return {
      total: all.length,
      page,
      pages: Math.max(1, Math.ceil(all.length / PAGE)),
      items: all.slice(page * PAGE, (page + 1) * PAGE),
    };
  });

// GET /api/img?u=<picture>  ->  the picture. Only for Google's sheet pictures,
// which Google won't let other sites show directly.
export async function img(query) {
  const u = String(query.u || "");
  if (!u.startsWith("https://docs.google.com/sheets-images-rt/")) {
    return { status: 400, headers: { "content-type": "text/plain" }, body: Buffer.from("Bad picture link") };
  }
  try {
    const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; Sheetshop/1.0)" } });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !type.startsWith("image/")) throw new Error(`${r.status}`);
    return {
      status: 200,
      headers: { "content-type": type, "cache-control": "public, max-age=86400, s-maxage=2592000, immutable" },
      body: Buffer.from(await r.arrayBuffer()),
    };
  } catch {
    return { status: 502, headers: { "content-type": "text/plain", "cache-control": "no-store" }, body: Buffer.from("Picture not available") };
  }
}

// Vercel-style (req, res) wrapper
export const vercel = (handler) => async (req, res) => {
  const { status, headers, body } = await handler(req.query || {});
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (Buffer.isBuffer(body)) res.status(status).send(body);
  else res.status(status).json(body);
};
