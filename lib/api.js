// The JSON endpoints, shared by the local server and Vercel.
//
// Only the owner can make shops: /api/sign needs SHEETSHOP_PASSWORD and hands
// back a signed shop link. The other endpoints only read sheets named inside a
// valid signed link, so nobody can point the site at their own sheet or swap
// the invite code in a link. Changing the password cancels every link made
// with the old one.
import crypto from "node:crypto";
import { parseSheetRef, getSheet, getTab, sizedImage, SheetError } from "./google.js";
import { agentById } from "../public/agents.js";

const PAGE = 400;
const MAX_SHEETS = 10;
// Short, because the picture links inside expire after a few hours.
const CACHE = "public, max-age=60, s-maxage=600, stale-while-revalidate=900";

const password = () => process.env.SHEETSHOP_PASSWORD || "";
const sha = (s) => crypto.createHash("sha256").update(s).digest();
const hmac = (payload) =>
  crypto.createHmac("sha256", "sheetshop-links:" + password()).update(payload).digest("base64url");
// Pictures are fetched per sheet, so each sheet gets its own short signature.
const imgSig = (sheetId) => hmac("img:" + sheetId).slice(0, 16);

const sameSig = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const notSetUp = () => new SheetError("This site isn't set up yet: SHEETSHOP_PASSWORD is missing.", 503);

export function signConfig(cfg) {
  const payload = Buffer.from(JSON.stringify(cfg)).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

function readToken(token) {
  const bad = new SheetError("This shop link isn't valid (or has been cancelled). Ask the owner for a new one.", 403);
  if (!password()) throw notSetUp();
  const t = String(token || "");
  const dot = t.lastIndexOf(".");
  if (dot < 1) throw bad;
  const payload = t.slice(0, dot);
  if (!sameSig(t.slice(dot + 1), hmac(payload))) throw bad;
  let cfg;
  try { cfg = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { throw bad; }
  const refs = (Array.isArray(cfg.s) ? cfg.s : [cfg.s]).map(parseSheetRef);
  if (!refs.length || refs.some((r) => !r) || !Array.isArray(cfg.a)) throw bad;
  return { cfg, refs };
}

async function run(fn, cache = CACHE) {
  try {
    return { status: 200, headers: { "cache-control": cache }, body: await fn() };
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

// POST /api/sign  { password, sheets: [link], agents: [{ id, code }], title, logo }
//   ->  { token, title, sheets, tabs }
export async function sign({ method, body }) {
  if (method !== "POST") return { status: 405, headers: { allow: "POST" }, body: { error: "Use POST." } };
  return run(async () => {
    if (!password()) throw notSetUp();
    if (!crypto.timingSafeEqual(sha(String(body?.password || "")), sha(password()))) {
      await new Promise((r) => setTimeout(r, 800)); // slows down guessing
      throw new SheetError("Wrong password.", 401);
    }
    const links = (Array.isArray(body?.sheets) ? body.sheets : [body?.sheet]).map((x) => String(x || "").trim()).filter(Boolean);
    if (!links.length) throw new SheetError("Paste at least one Google Sheets link.");
    if (links.length > MAX_SHEETS) throw new SheetError(`Up to ${MAX_SHEETS} sheets per shop.`);
    const refs = links.map((l) => {
      const r = parseSheetRef(l);
      if (!r) throw new SheetError(`This doesn't look like a Google Sheets link: ${l.slice(0, 80)}`);
      return r;
    });
    const ids = [...new Set(refs.map((r) => r.id))];
    const agents = (Array.isArray(body?.agents) ? body.agents : [])
      .filter((a) => agentById(a?.id))
      .slice(0, 8)
      .map((a) => [a.id, String(a.code || "").trim().slice(0, 80)]);
    if (!agents.length) throw new SheetError("Choose at least one agent.");

    // Also checks every sheet can be read.
    const infos = await Promise.all(ids.map((id) => getSheet(parseSheetRef(id))));
    const cfg = { s: ids, a: agents };
    const title = String(body?.title || "").trim().slice(0, 60);
    if (title) cfg.t = title;
    const logo = String(body?.logo || "").trim();
    if (/^https:\/\/\S{4,400}$/.test(logo)) cfg.l = logo;
    return {
      token: signConfig(cfg),
      title: title || infos[0].title,
      sheets: infos.length,
      tabs: infos.reduce((n, i) => n + i.tabs.length, 0),
    };
  }, "no-store");
}

// GET /api/sheet?c=<signed link>
//   ->  { title, logo, agents: [[id, code]], sheets: [{ i, id, title, h, tabs: [{ gid, name }] }], umami }
export const sheet = ({ query }) =>
  run(async () => {
    const { cfg, refs } = readToken(query.c);
    const infos = await Promise.all(refs.map((r) => getSheet(r)));
    return {
      title: cfg.t || infos[0].title,
      logo: cfg.l || "",
      agents: cfg.a,
      sheets: infos.map((info, i) => ({ i, id: refs[i].id, title: info.title, h: imgSig(refs[i].id), tabs: info.tabs })),
      // Umami website ID for click counting (public, not a secret); empty = off
      umami: /^[0-9a-f-]{36}$/i.test(process.env.SHEETSHOP_UMAMI_ID || "") ? process.env.SHEETSHOP_UMAMI_ID : "",
    };
  });

// GET /api/tab?c=<signed link>&sh=<sheet number>&gid=<tab>&page=0  ->  { total, page, pages, items }
export const tab = ({ query }) =>
  run(async () => {
    const { refs } = readToken(query.c);
    const ref = refs[Math.max(0, parseInt(query.sh, 10) || 0)];
    if (!ref) throw new SheetError("No such sheet in this shop.", 404);
    const { products } = await getTab(ref, String(query.gid ?? ""));
    const page = Math.max(0, parseInt(query.page, 10) || 0);
    return {
      total: products.length,
      page,
      pages: Math.max(1, Math.ceil(products.length / PAGE)),
      items: products.slice(page * PAGE, (page + 1) * PAGE),
    };
  });

// GET /api/img?s=<sheet id>&g=<tab>&k=<row.n>&w=<size>&h=<signature>  ->  the picture
// Looks up the picture's current link in the sheet (they expire), reading the
// sheet again when the cached link has died. Also gets around docs.google.com
// refusing to show its pictures on other sites.
export async function img({ query }) {
  const fail = (status, text) => ({ status, headers: { "content-type": "text/plain", "cache-control": "no-store" }, body: Buffer.from(text) });
  const s = String(query.s || ""), g = String(query.g ?? ""), k = String(query.k || "");
  const ref = parseSheetRef(s);
  if (!password()) return fail(503, "Not set up");
  if (!ref || !/^-?\d*$/.test(g) || !/^\d+\.\d+$/.test(k) || !sameSig(query.h || "", imgSig(ref.id))) return fail(400, "Bad picture link");
  const w = Math.min(1600, Math.max(100, parseInt(query.w, 10) || 500));

  const load = async (fresh) => {
    const { images } = await getTab(ref, g, { fresh });
    const src = images.get(k);
    if (!src) return null;
    const r = await fetch(sizedImage(src, w), { headers: { "user-agent": "Mozilla/5.0 (compatible; Sheetshop/1.0)" } });
    const type = r.headers.get("content-type") || "";
    return r.ok && type.startsWith("image/") ? { type, data: Buffer.from(await r.arrayBuffer()) } : null;
  };
  try {
    const got = (await load(false)) || (await load(true));
    if (!got) return fail(404, "Picture not available");
    return {
      status: 200,
      headers: { "content-type": got.type, "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800" },
      body: got.data,
    };
  } catch {
    return fail(502, "Picture not available");
  }
}

// GET /api/rates  ->  { base: "USD", rates: { EUR: 0.89, ... } }  (refreshed twice a day)
const FALLBACK_RATES = { USD: 1, EUR: 0.89, GBP: 0.75, CNY: 6.7, CAD: 1.41, AUD: 1.44, MXN: 18.5, CHF: 0.82, PLN: 3.89, SEK: 9.9, NOK: 10.6, DKK: 6.64, BRL: 5.09, JPY: 158, KRW: 1380, INR: 84, TRY: 41, AED: 3.67, SAR: 3.75, RON: 4.5, CZK: 21.9, HUF: 345 };
let ratesCache = null;
export const rates = () =>
  run(async () => {
    if (ratesCache && Date.now() - ratesCache.at < 6 * 3600e3) return ratesCache.body;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const j = await r.json();
      if (j.result !== "success" || !j.rates?.EUR) throw new Error("bad rates");
      const body = { base: "USD", rates: j.rates, updated: j.time_last_update_utc };
      ratesCache = { at: Date.now(), body };
      return body;
    } catch {
      return { base: "USD", rates: FALLBACK_RATES, updated: null };
    }
  }, "public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400");

// Vercel-style (req, res) wrapper
export const vercel = (handler) => async (req, res) => {
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { status, headers, body: out } = await handler({ method: req.method, query: req.query || {}, body: body || {} });
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (Buffer.isBuffer(out)) res.status(status).send(out);
  else res.status(status).json(out);
};
