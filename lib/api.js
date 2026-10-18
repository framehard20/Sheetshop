// The JSON endpoints, shared by the local server and Vercel.
//
// Only the owner can make shops: /api/sign needs SHEETSHOP_PASSWORD and hands
// back a signed shop link. The other endpoints only read sheets named inside a
// valid signed link, so nobody can point the site at their own sheet or swap
// the invite code in a link. Changing the password cancels every link made
// with the old one.
import crypto from "node:crypto";
import { parseSheetRef, getSheet, getTab, SheetError } from "./google.js";
import { agentById } from "../public/agents.js";

const PAGE = 400;
const CACHE = "public, max-age=60, s-maxage=600, stale-while-revalidate=86400";

const password = () => process.env.SHEETSHOP_PASSWORD || "";
const sha = (s) => crypto.createHash("sha256").update(s).digest();
const hmac = (payload) =>
  crypto.createHmac("sha256", "sheetshop-links:" + password()).update(payload).digest("base64url");

export function signConfig(cfg) {
  const payload = Buffer.from(JSON.stringify(cfg)).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

function readToken(token) {
  const bad = new SheetError("This shop link isn't valid (or has been cancelled). Ask the owner for a new one.", 403);
  if (!password()) throw new SheetError("This site isn't set up yet: SHEETSHOP_PASSWORD is missing.", 503);
  const t = String(token || "");
  const dot = t.lastIndexOf(".");
  if (dot < 1) throw bad;
  const payload = t.slice(0, dot);
  const given = Buffer.from(t.slice(dot + 1));
  const want = Buffer.from(hmac(payload));
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) throw bad;
  let cfg;
  try { cfg = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { throw bad; }
  const ref = parseSheetRef(cfg.s);
  if (!ref || !Array.isArray(cfg.a)) throw bad;
  return { cfg, ref };
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

// POST /api/sign  { password, sheet, agents: [{ id, code }], title }
//   ->  { token, title, tabs }
export async function sign({ method, body }) {
  if (method !== "POST") return { status: 405, headers: { allow: "POST" }, body: { error: "Use POST." } };
  const res = await run(async () => {
    if (!password()) throw new SheetError("This site isn't set up yet: SHEETSHOP_PASSWORD is missing.", 503);
    const given = String(body?.password || "");
    if (!crypto.timingSafeEqual(sha(given), sha(password()))) {
      await new Promise((r) => setTimeout(r, 800)); // slows down guessing
      throw new SheetError("Wrong password.", 401);
    }
    const ref = parseSheetRef(body?.sheet);
    if (!ref) throw new SheetError("That doesn't look like a Google Sheets link.");
    const agents = (Array.isArray(body?.agents) ? body.agents : [])
      .filter((a) => agentById(a?.id))
      .slice(0, 8)
      .map((a) => [a.id, String(a.code || "").trim().slice(0, 80)]);
    if (!agents.length) throw new SheetError("Choose at least one agent.");
    const info = await getSheet(ref); // also checks the sheet is readable
    const cfg = { s: ref.id, a: agents };
    const title = String(body?.title || "").trim().slice(0, 60);
    if (title) cfg.t = title;
    return { token: signConfig(cfg), title: title || info.title, tabs: info.tabs.length };
  });
  res.headers = { "cache-control": "no-store" };
  return res;
}

// GET /api/sheet?c=<signed link>  ->  { title, tabs: [{ gid, name }], agents: [[id, code]] }
export const sheet = ({ query }) =>
  run(async () => {
    const { cfg, ref } = readToken(query.c);
    const info = await getSheet(ref);
    return { title: cfg.t || info.title, tabs: info.tabs, agents: cfg.a, sheet: ref.id };
  });

// GET /api/tab?c=<signed link>&gid=<tab>&page=0  ->  { total, page, pages, items }
export const tab = ({ query }) =>
  run(async () => {
    const { ref } = readToken(query.c);
    const all = await getTab(ref, String(query.gid ?? ""));
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
export async function img({ query }) {
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
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { status, headers, body: out } = await handler({ method: req.method, query: req.query || {}, body: body || {} });
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (Buffer.isBuffer(out)) res.status(status).send(out);
  else res.status(status).json(out);
};
