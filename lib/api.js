// The JSON endpoints, shared by the local server and Vercel.
//
// Only the owner can change what the site shows. The main site (no ?c= in the
// address) shows the shop saved from /admin; extra shops live in signed links
// made by /api/sign. Both need SHEETSHOP_PASSWORD (or the admin login it
// gives), and the other endpoints only read sheets named in the saved site or
// in a valid signed link, so nobody can point the site at their own sheet or
// swap the invite code. Changing the password cancels every signed link and
// every admin login.
import crypto from "node:crypto";
import { parseSheetRef, getSheet, getTab, getModified, sizedImage, SheetError } from "./google.js";
import { agentById } from "../public/agents.js";
import { getSite, saveSite, storeKind, getValue, setValue, countClick, topClicks, getAiCats, addAiCats } from "./store.js";
import { categorize } from "../public/catalog.js";
import { aiConfigured, classify, BATCH } from "./aicats.js";
import { renderLegal } from "./legal.js";
import { newSecret, checkCode, otpauthUri, newBackupCodes, hashCode } from "./totp.js";

const PAGE = 400;
const MAX_SHEETS = 10;
// Short, because the picture links inside expire after a few hours.
const CACHE = "public, max-age=60, s-maxage=600, stale-while-revalidate=900";
// The sheet list carries the last-edit dates the shop checks for changes.
const CACHE_SHEET = "public, max-age=30, s-maxage=60, stale-while-revalidate=60";

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

// The shop to show: the saved main site when there's no code, else the signed link.
async function readShop(token) {
  if (!password()) throw notSetUp();
  if (token) return readToken(token);
  const cfg = await getSite();
  if (!cfg?.s?.length) throw new SheetError("This site isn't set up yet. The owner can set it up at /admin.", 404);
  return { cfg, refs: cfg.s.map(parseSheetRef).filter(Boolean) };
}

function readToken(token) {
  const bad = new SheetError("This shop link isn't valid (or has been cancelled). Ask the owner for a new one.", 403);
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
      body: { error: status === 500 ? "Something went wrong reading this sheet." : e.message, ...(e.extra || {}) },
    };
  }
}

// ---- admin login: password, then a 6-digit code from an authenticator app
// (two-factor). The login is a cookie signed with the password and tied to the
// current two-factor secret, valid 30 days; turning two-factor on (or resetting
// it) cancels every older login.
const COOKIE = "ss_admin";
const DAYS = 30;
const TOTP = "sheetshop:totp";            // { secret, backups: [hash], last }
const TOTP_PENDING = "sheetshop:totp-new"; // secret shown in the QR, not confirmed yet
const getTotp = () => getValue(TOTP).catch(() => null);
const totpTag = (t) => (t?.secret ? hmac("2fa:" + t.secret).slice(0, 12) : "none");

function cookieValue(cookieHeader) {
  for (const part of String(cookieHeader || "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE) return decodeURIComponent(v.join("="));
  }
  return "";
}
async function loginState(cookieHeader) {
  if (!password()) return { ok: false };
  const [exp, tag, sig] = cookieValue(cookieHeader).split(".");
  if (!(+exp > Date.now()) || !sameSig(sig || "", hmac(`admin:${exp}:${tag}`))) return { ok: false };
  const totp = await getTotp();
  if (tag !== totpTag(totp)) return { ok: false };
  return { ok: true, totp };
}
const loginCookie = (secure, totp) => {
  const exp = Date.now() + DAYS * 86400e3;
  const tag = totpTag(totp);
  return `${COOKIE}=${exp}.${tag}.${hmac(`admin:${exp}:${tag}`)}; Path=/api; Max-Age=${DAYS * 86400}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
};
const logoutCookie = `${COOKIE}=; Path=/api; Max-Age=0; HttpOnly; SameSite=Strict`;
const slow = () => new Promise((r) => setTimeout(r, 800)); // slows down guessing
async function checkPassword(given) {
  if (!password()) throw notSetUp();
  if (!crypto.timingSafeEqual(sha(String(given || "")), sha(password()))) {
    await slow();
    throw new SheetError("Wrong password.", 401);
  }
}
// A 6-digit code or an unused backup code; the used one is remembered/removed.
async function checkSecondFactor(totp, code) {
  const c = String(code || "").trim();
  const step = checkCode(totp.secret, c, totp.last ?? -1);
  if (step >= 0) { await setValue(TOTP, { ...totp, last: step }); return true; }
  const h = hashCode(c);
  if (c.length >= 8 && totp.backups?.includes(h)) {
    await setValue(TOTP, { ...totp, backups: totp.backups.filter((x) => x !== h) });
    return true;
  }
  await slow();
  return false;
}
// Changing the site needs a full login, with two-factor already on.
async function requireAdmin(cookie) {
  const st = await loginState(cookie);
  if (!st.ok) throw new SheetError("Please log in.", 401);
  if (!st.totp?.secret) throw new SheetError("Turn on two-factor login first.", 403);
  return st;
}

// Sheets, agents, title and logo as typed in -> checked settings + what was found.
async function checkShop(body) {
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
  if (logo && !/^https:\/\/\S{4,400}$/.test(logo)) throw new SheetError("The logo must be an https:// link to a picture.");
  if (logo) cfg.l = logo;
  return { cfg, summary: { title: title || infos[0].title, sheets: infos.length, tabs: infos.reduce((n, i) => n + i.tabs.length, 0) } };
}

// POST /api/sign  { sheets: [link], agents: [{ id, code }], title, logo }  (logged in)
//   ->  { token, title, sheets, tabs }
export async function sign({ method, body, cookie }) {
  if (method !== "POST") return { status: 405, headers: { allow: "POST" }, body: { error: "Use POST." } };
  return run(async () => {
    await requireAdmin(cookie);
    const { cfg, summary } = await checkShop(body);
    return { token: signConfig(cfg), ...summary };
  }, "no-store");
}

// /api/admin
//   POST { action: "login", password, code }  -> sets the login cookie
//        (without two-factor yet, the password alone logs in to set it up)
//   POST { action: "logout" }
//   GET                                        -> { site, storage } or { setup2fa: true }
//   POST { action: "2fa-start" }               -> { secret, uri }  (QR for the app)
//   POST { action: "2fa-confirm", code }       -> { backups }      (two-factor on)
//   POST { action: "save", sheets, agents, title, logo } -> saves the main site
const sheetLink = (id) => (id.startsWith("2PACX-") ? `https://docs.google.com/spreadsheets/d/e/${id}/pubhtml` : `https://docs.google.com/spreadsheets/d/${id}/edit`);
export async function admin({ method, body, cookie, secure }) {
  let setCookie = "";
  const res = await run(async () => {
    const action = method === "POST" ? body?.action : "get";
    if (action === "login") {
      await checkPassword(body.password);
      const totp = await getTotp();
      if (totp?.secret) {
        if (!body.code) {
          const e = new SheetError("Enter the 6-digit code from your authenticator app.", 401);
          e.extra = { need2fa: true };
          throw e;
        }
        if (!(await checkSecondFactor(totp, body.code))) {
          const e = new SheetError("That code isn't right (or was already used). Try the newest one.", 401);
          e.extra = { need2fa: true };
          throw e;
        }
      }
      setCookie = loginCookie(secure, await getTotp());
      return { ok: true };
    }
    if (action === "logout") { setCookie = logoutCookie; return { ok: true }; }

    const st = await loginState(cookie);
    if (!st.ok) throw new SheetError("Please log in.", 401);
    const has2fa = !!st.totp?.secret;

    if (action === "2fa-start") {
      if (has2fa) throw new SheetError("Two-factor login is already on.", 409);
      const secret = newSecret();
      try { await setValue(TOTP_PENDING, { secret, at: Date.now() }); } catch (e) { throw new SheetError(e.message, 503); }
      return { secret, uri: otpauthUri(secret, "admin", "Sheetshop") };
    }
    if (action === "2fa-confirm") {
      if (has2fa) throw new SheetError("Two-factor login is already on.", 409);
      const pending = await getValue(TOTP_PENDING);
      if (!pending?.secret || Date.now() - pending.at > 30 * 60e3) throw new SheetError("The QR code expired. Start again.", 410);
      const step = checkCode(pending.secret, body?.code);
      if (step < 0) { await slow(); throw new SheetError("That code isn't right. Type the 6 digits the app shows now.", 401); }
      const backups = newBackupCodes();
      const totp = { secret: pending.secret, backups: backups.map(hashCode), last: step, since: new Date().toISOString() };
      await setValue(TOTP, totp);
      await setValue(TOTP_PENDING, null);
      setCookie = loginCookie(secure, totp); // this browser stays logged in; older logins end
      return { ok: true, backups };
    }
    if (!has2fa) {
      if (action === "get") return { setup2fa: true, storage: storeKind() };
      throw new SheetError("Turn on two-factor login first.", 403);
    }

    if (action === "get") {
      const site = await getSite().catch(() => null);
      return {
        storage: storeKind(),
        backupsLeft: st.totp.backups?.length ?? 0,
        site: site && {
          title: site.t || "", logo: site.l || "",
          sheets: site.s.map(sheetLink),
          agents: site.a.map(([id, code]) => ({ id, code })),
          savedAt: site.at || null,
          starting: !!site.starting,
        },
      };
    }
    // Claude sorts the products the rules leave in "other", a slice per request
    // (the panel repeats it until nothing is left)
    if (action === "aicats") {
      if (!aiConfigured()) throw new SheetError("Claude's key is missing: add ANTHROPIC_API_KEY to this project in Vercel and deploy again.", 503);
      if (!storeKind()) throw new SheetError("Saving the categories needs the database (Upstash for Redis).", 503);
      const pending = await pendingForAi();
      const now = pending.slice(0, AI_PER_REQUEST);
      const batches = [];
      for (let i = 0; i < now.length; i += BATCH) batches.push(now.slice(i, i + BATCH));
      let done = 0;
      // three at a time, so a slice fits in one request
      for (let i = 0; i < batches.length; i += 3) {
        const results = await Promise.all(batches.slice(i, i + 3).map(async (batch) => {
          const items = await Promise.all(batch.map(async (p, n) => ({ n, name: p.name, picture: await pictureOf(p) })));
          const picked = await classify(items);
          // a product Claude didn't answer for is stored as "other", so it isn't asked again
          return Object.fromEntries(batch.map((p, n) => [p.key, picked[n] || "other"]));
        }));
        for (const r of results) { await addAiCats(r); done += Object.keys(r).length; }
      }
      return { done, left: pending.length - done };
    }
    if (action === "aicats-count") return { left: (await pendingForAi()).length, ai: aiConfigured() };

    if (action === "save") {
      const { cfg, summary } = await checkShop(body);
      cfg.at = new Date().toISOString();
      try { await saveSite(cfg); } catch (e) { throw new SheetError(e.message, 503); }
      return { ok: true, ...summary };
    }
    throw new SheetError("Unknown request.", 400);
  }, "no-store");
  if (setCookie) res.headers["set-cookie"] = setCookie;
  return res;
}

// GET /api/sheet?c=<signed link>
//   ->  { title, logo, agents: [[id, code]], sheets: [{ i, id, title, h, tabs: [{ gid, name }] }], umami }
export const sheet = ({ query }) =>
  run(async () => {
    const { cfg, refs } = await readShop(query.c);
    const modified = await Promise.all(refs.map((r) => getModified(r)));
    const infos = await Promise.all(refs.map((r, i) => getSheet(r, { version: modified[i] || "" })));
    return {
      title: cfg.t || infos[0].title,
      logo: cfg.l || "",
      agents: cfg.a,
      sheets: infos.map((info, i) => ({ i, id: refs[i].id, title: info.title, h: imgSig(refs[i].id), modified: modified[i], tabs: info.tabs })),
      // Umami website ID for click counting (public, not a secret); empty = off
      umami: /^[0-9a-f-]{36}$/i.test(process.env.SHEETSHOP_UMAMI_ID || "") ? process.env.SHEETSHOP_UMAMI_ID : "",
    };
  }, CACHE_SHEET);

// GET /api/tab?c=<signed link>&sh=<sheet number>&gid=<tab>&page=0&v=<last edit>  ->  { total, page, pages, items }
export const tab = ({ query }) =>
  run(async () => {
    const { refs } = await readShop(query.c);
    // by ID when given, so a cached answer never mixes up sheets after the list changes
    const ref = query.id ? refs.find((r) => r.id === query.id) : refs[Math.max(0, parseInt(query.sh, 10) || 0)];
    if (!ref) throw new SheetError("No such sheet in this shop.", 404);
    // v (the sheet's last-edit date) makes a new edit a new address, so caches never serve the old list
    const { products } = await getTab(ref, String(query.gid ?? ""), { version: String(query.v || "").slice(0, 40) });
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

// GET /api/health  ->  { storage, database, siteSaved, twoFactor }  (nothing private: for checking the setup)
export const health = () =>
  run(async () => {
    const kind = storeKind();
    let database = kind ? "ok" : "not connected", siteSaved = false, twoFactor = false;
    try {
      const site = await getValue("sheetshop:site"); siteSaved = !!site?.s?.length;
      twoFactor = !!(await getValue(TOTP))?.secret;
    }
    catch (e) { database = "error: " + String(e.message).slice(0, 120); }
    return { storage: kind || "none", database, siteSaved, twoFactor };
  }, "no-store");

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

// POST /api/click { k: "weidian:123" }  ->  counts a Buy tap for "Most popular".
// The visitor is a keyed hash of the IP address: nothing personal is stored.
const visitorOf = (ip) => sha("visitor:" + password() + ":" + ip).toString("base64url").slice(0, 16);
export const click = ({ method, body, ip }) =>
  run(async () => {
    if (method !== "POST") throw new SheetError("Use POST.", 405);
    const k = String(body?.k || "");
    if (!/^(weidian|taobao|1688):[0-9]{4,20}$/.test(k)) throw new SheetError("Unknown product.", 400);
    if (!storeKind()) return { ok: false };
    return { ok: await countClick(k, visitorOf(ip || "")) };
  }, "no-store");

// GET /api/popular  ->  { counts: { "weidian:123": 14, ... } }  (the 120 most tapped)
export const popular = () =>
  run(async () => ({ counts: storeKind() ? await topClicks(120) : {} }), "public, max-age=120, s-maxage=300, stale-while-revalidate=600");

// ---- categories chosen by Claude -----------------------------------------
const AI_PER_REQUEST = 60;

/** Products of the main site that the rules leave in "other" and Claude hasn't seen yet. */
async function pendingForAi() {
  const site = await getSite();
  const refs = (site?.s || []).map(parseSheetRef).filter(Boolean);
  const known = await getAiCats();
  const seen = new Set();
  const out = [];
  for (const ref of refs) {
    const info = await getSheet(ref);
    for (const t of info.tabs) {
      const { products } = await getTab(ref, t.gid);
      for (const p of products) {
        const key = `${p.platform}:${p.id}`;
        if (seen.has(key)) continue; // the first sheet and tab that has it decides, as in the shop
        seen.add(key);
        if (known[key] || !p.ik || categorize(p, t.name) !== "other") continue;
        out.push({ key, name: p.name, ref, gid: t.gid, ik: p.ik });
      }
    }
  }
  return out;
}

/** A small picture of the product, through the same relay the shop uses. */
async function pictureOf(p) {
  const r = await img({ query: { s: p.ref.id, g: p.gid, k: p.ik, w: "300", h: imgSig(p.ref.id) } });
  const type = String(r.headers["content-type"] || "");
  return r.status === 200 && /^image\/(jpeg|png|webp|gif)$/.test(type) ? { type, data: r.body.toString("base64") } : null;
}

// GET /api/cats  ->  { cats: { "weidian:123": "hats", ... } }
export const cats = () =>
  run(async () => ({ cats: storeKind() ? await getAiCats() : {} }), "public, max-age=300, s-maxage=600, stale-while-revalidate=1800");

// GET /api/legal?p=aviso-legal|terminos|privacidad  ->  the page (HTML), at /aviso-legal etc.
export const legal = ({ query }) => {
  const html = renderLegal(String(query.p || ""));
  if (!html) return { status: 404, headers: { "content-type": "text/plain; charset=utf-8" }, body: Buffer.from("Not found") };
  return {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300, s-maxage=3600" },
    body: Buffer.from(html),
  };
};

// Vercel-style (req, res) wrapper
export const vercel = (handler) => async (req, res) => {
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { status, headers, body: out } = await handler({
    method: req.method, query: req.query || {}, body: body || {},
    cookie: req.headers?.cookie || "", secure: true,
    ip: String(req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || "").split(",")[0].trim(),
  });
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (Buffer.isBuffer(out)) res.status(status).send(out);
  else res.status(status).json(out);
};
