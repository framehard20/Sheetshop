// Where the owner's settings live: the main site (title, logo, sheets, agents
// and codes) edited from /admin, and the admin's two-factor secret.
//
// Online: an Upstash Redis database connected to the Vercel project (Vercel →
// Storage → Upstash for Redis), which adds KV_REST_API_URL and
// KV_REST_API_TOKEN. On your own computer without those: files in data/.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const onVercel = () => !!process.env.VERCEL;
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const fileFor = (key) => path.join(dataDir, key.replace(/^sheetshop:/, "").replace(/[^a-z0-9-]/gi, "_") + ".json");

// "redis", "file" (local testing) or "" (online but no database connected yet)
export const storeKind = () => (url() && token() ? "redis" : onVercel() ? "" : "file");

const noDatabase = () => new Error("No database is connected yet. In Vercel: Storage → Create → Upstash for Redis → connect it to this project, then deploy again.");

async function redis(command) {
  const r = await fetch(url(), {
    method: "POST",
    headers: { authorization: `Bearer ${token()}`, "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `Database answered ${r.status}`);
  return j.result;
}

export async function getValue(key) {
  let raw = null;
  const kind = storeKind();
  if (kind === "redis") raw = await redis(["GET", key]);
  else if (kind === "file") raw = await fs.readFile(fileFor(key), "utf8").catch(() => null);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export async function setValue(key, value) {
  const kind = storeKind();
  if (kind === "redis") await redis(value == null ? ["DEL", key] : ["SET", key, JSON.stringify(value)]);
  else if (kind === "file") {
    await fs.mkdir(dataDir, { recursive: true });
    if (value == null) await fs.rm(fileFor(key), { force: true });
    else await fs.writeFile(fileFor(key), JSON.stringify(value));
  } else throw noDatabase();
}

// ---- the main site, read on every shop visit, so kept for 15 s
const SITE = "sheetshop:site";
// What the site shows until something is saved from /admin.
export const STARTING_SITE = {
  t: "Masterspread",
  s: ["17WHP0zYLfmwC9NZ9itCUNSPT9ymWnxT6qIXDKgO09Cs"],
  a: [["uidbuy", "UWSV3X"]],
  starting: true,
};
let cache = null; // { at, value }

export async function getSite() {
  if (cache && Date.now() - cache.at < 15000) return cache.value;
  const value = (await getValue(SITE)) || STARTING_SITE;
  cache = { at: Date.now(), value };
  return value;
}

// ---- "Most popular": how many visitors tapped Buy on each product. Counted
// once per visitor, product and day, and at most 40 products a visitor a day,
// so refreshing or a script can't push an item up the list.
const CLICKS = "sheetshop:clicks";
const DAY = 90000; // seconds the per-day markers live (a day plus a margin)

export async function countClick(key, visitor) {
  const kind = storeKind();
  if (kind === "redis") {
    const day = new Date().toISOString().slice(0, 10);
    const first = await redis(["SET", `sheetshop:ck:${day}:${visitor}:${key}`, "1", "NX", "EX", String(DAY)]);
    if (first !== "OK") return false;
    const n = await redis(["INCR", `sheetshop:ckv:${day}:${visitor}`]);
    if (n === 1) await redis(["EXPIRE", `sheetshop:ckv:${day}:${visitor}`, String(DAY)]);
    if (n > 40) return false;
    await redis(["ZINCRBY", CLICKS, "1", key]);
    return true;
  }
  if (kind === "file") {
    const all = (await getValue(CLICKS)) || {};
    all[key] = (all[key] || 0) + 1;
    await setValue(CLICKS, all);
    return true;
  }
  return false;
}

/** The most tapped products: { "weidian:123": 14, ... } */
export async function topClicks(n = 100) {
  const kind = storeKind();
  if (kind === "redis") {
    const r = (await redis(["ZREVRANGE", CLICKS, "0", String(n - 1), "WITHSCORES"])) || [];
    const out = {};
    for (let i = 0; i < r.length; i += 2) out[r[i]] = Number(r[i + 1]);
    return out;
  }
  if (kind === "file") {
    const all = (await getValue(CLICKS)) || {};
    return Object.fromEntries(Object.entries(all).sort((a, b) => b[1] - a[1]).slice(0, n));
  }
  return {};
}

// ---- categories Claude chose for products the rules couldn't place
const AICAT = "sheetshop:aicat";

/** { "weidian:123": "hats", ... } */
export async function getAiCats() {
  const kind = storeKind();
  if (kind === "redis") {
    const r = (await redis(["HGETALL", AICAT])) || [];
    const out = {};
    for (let i = 0; i < r.length; i += 2) out[r[i]] = r[i + 1];
    return out;
  }
  if (kind === "file") return (await getValue(AICAT)) || {};
  return {};
}

export async function addAiCats(map) {
  const entries = Object.entries(map);
  if (!entries.length) return;
  const kind = storeKind();
  if (kind === "redis") await redis(["HSET", AICAT, ...entries.flat()]);
  else if (kind === "file") await setValue(AICAT, { ...((await getValue(AICAT)) || {}), ...map });
}

export async function saveSite(site) {
  await setValue(SITE, site);
  cache = { at: Date.now(), value: site };
}
