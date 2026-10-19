// Where the main site's settings live (title, logo, sheets, agents and codes),
// edited from /admin.
//
// Online: an Upstash Redis database connected to the Vercel project (Vercel →
// Storage → Upstash for Redis), which adds KV_REST_API_URL and
// KV_REST_API_TOKEN. On your own computer without those: a file, data/site.json.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KEY = "sheetshop:site";
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const onVercel = () => !!process.env.VERCEL;
const localFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "site.json");

// "redis", "file" (local testing) or "" (online but no database connected yet)
export const storeKind = () => (url() && token() ? "redis" : onVercel() ? "" : "file");

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

let cache = null; // { at, value }

export async function getSite() {
  if (cache && Date.now() - cache.at < 15000) return cache.value;
  let raw = null;
  const kind = storeKind();
  if (kind === "redis") raw = await redis(["GET", KEY]);
  else if (kind === "file") raw = await fs.readFile(localFile, "utf8").catch(() => null);
  let value = null;
  try { value = raw ? JSON.parse(raw) : null; } catch {}
  cache = { at: Date.now(), value };
  return value;
}

export async function saveSite(site) {
  const raw = JSON.stringify(site);
  const kind = storeKind();
  if (kind === "redis") await redis(["SET", KEY, raw]);
  else if (kind === "file") {
    await fs.mkdir(path.dirname(localFile), { recursive: true });
    await fs.writeFile(localFile, raw);
  } else {
    throw new Error("No database is connected yet. In Vercel: Storage → Create → Upstash for Redis → connect it to this project, then deploy again.");
  }
  cache = { at: Date.now(), value: site };
}
