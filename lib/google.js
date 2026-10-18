// Reads a Google Sheet through its public HTML view. No API key is needed, and
// the HTML keeps what CSV exports drop: the links behind text and the
// pictures placed inside cells.
import { parseLink } from "../public/agents.js";

const UA = "Mozilla/5.0 (compatible; Sheetshop/1.0)";

export class SheetError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

// Accepts a full sheet link, a "published to the web" link, or a bare ID.
export function parseSheetRef(input) {
  const s = String(input || "").trim();
  let m = s.match(/\/spreadsheets\/d\/e\/(2PACX-[A-Za-z0-9_-]+)/);
  if (m) return { kind: "pub", id: m[1] };
  m = s.match(/\/spreadsheets\/(?:u\/\d+\/)?d\/([A-Za-z0-9_-]{20,})/);
  if (m) return { kind: "doc", id: m[1] };
  if (/^2PACX-[A-Za-z0-9_-]+$/.test(s)) return { kind: "pub", id: s };
  if (/^[A-Za-z0-9_-]{25,}$/.test(s)) return { kind: "doc", id: s };
  return null;
}

const base = (ref) =>
  ref.kind === "pub"
    ? `https://docs.google.com/spreadsheets/d/e/${ref.id}`
    : `https://docs.google.com/spreadsheets/d/${ref.id}`;
const viewName = (ref) => (ref.kind === "pub" ? "pubhtml" : "htmlview");

// Small in-memory cache so scrolling through pages of one tab fetches it once.
const cache = new Map();
const TTL = 5 * 60 * 1000;
function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;
  const value = fn().catch((e) => { cache.delete(key); throw e; });
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 60) cache.delete(cache.keys().next().value);
  return value;
}

async function fetchHtml(url) {
  let res;
  try {
    res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en" }, redirect: "follow" });
  } catch {
    throw new SheetError("Could not reach Google Sheets. Try again in a moment.", 502);
  }
  if (res.url.includes("accounts.google.com") || res.status === 401 || res.status === 403) {
    throw new SheetError(
      'This sheet is private. In Google Sheets: Share → General access → "Anyone with the link" → Viewer.',
      403,
    );
  }
  if (res.status === 404) throw new SheetError("That Google Sheet doesn't exist (check the link).", 404);
  if (!res.ok) throw new SheetError(`Google Sheets answered with error ${res.status}.`, 502);
  return res.text();
}

const unescapeJs = (s) =>
  s.replace(/\\x([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\(.)/g, "$1");

const decodeEntities = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");

// Title and tab list of a sheet.
export function getSheet(ref) {
  return cached(`sheet:${ref.kind}:${ref.id}`, async () => {
    const html = await fetchHtml(`${base(ref)}/${viewName(ref)}`);
    const title = decodeEntities(
      (html.match(/<meta property="og:title" content="([^"]*)"/) || html.match(/<title>([^<]*)<\/title>/) || [, "Catalog"])[1],
    ).replace(/ - Google (Drive|Sheets|Docs)$/, "").trim();

    const tabs = [];
    for (const m of html.matchAll(/items\.push\(\{name: "((?:[^"\\]|\\.)*)",[^}]*?gid: "(-?\d+)"/g)) {
      tabs.push({ gid: m[2], name: unescapeJs(m[1]).trim() });
    }
    if (!tabs.length) {
      for (const m of html.matchAll(/id="sheet-button-(-?\d+)"[^>]*>(?:<a[^>]*>)?([^<]*)/g)) {
        tabs.push({ gid: m[1], name: decodeEntities(m[2]).trim() });
      }
    }
    // A sheet with a single tab has no tab menu; its table is on the page itself.
    if (!tabs.length && /<table class="waffle/.test(html)) tabs.push({ gid: "", name: title });
    if (!tabs.length) throw new SheetError("No tabs found in this sheet.", 422);
    return { title, tabs };
  });
}

// ---- reading one tab ----------------------------------------------------

function realLink(href) {
  href = decodeEntities(href);
  if (href.startsWith("#")) return null;
  if (/^https?:\/\/(www\.)?google\.com\/url\?/.test(href)) {
    try { return new URL(href).searchParams.get("q"); } catch { return null; }
  }
  return /^https?:/.test(href) ? href : null;
}

function bigImage(src) {
  src = decodeEntities(src);
  // Google serves pictures from cells at any size: swap "=w166-h176" for a bigger one.
  if (/googleusercontent\.com|docs\.google\.com\/sheets-images/.test(src)) {
    src = src.replace(/=[swh]\d+[^/?#]*$/, "") + "=s600";
  }
  // docs.google.com refuses to show these on other sites, so they go through /api/img.
  if (src.startsWith("https://docs.google.com/sheets-images-rt/")) return `/api/img?u=${encodeURIComponent(src)}`;
  return src;
}

function parseCell(raw) {
  const attrs = raw.slice(0, raw.indexOf(">"));
  const inner = raw.slice(raw.indexOf(">") + 1).replace(/<\/td>[\s\S]*$/, "");
  const links = [...inner.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => ({ url: realLink(m[1]), text: decodeEntities(m[2].replace(/<[^>]+>/g, "")).trim() }))
    .filter((l) => l.url);
  const imgs = [...inner.matchAll(/<img [^>]*src="([^"]+)"/g)].map((m) => bigImage(m[1]));
  const text = decodeEntities(inner.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+/g, " ").replace(/\n\s*/g, "\n").trim();
  return {
    colspan: +((attrs.match(/colspan="(\d+)"/) || [])[1] || 1),
    rowspan: +((attrs.match(/rowspan="(\d+)"/) || [])[1] || 1),
    links, imgs, text,
  };
}

// Rows of cells; a cell merged over several rows shows up in each of them.
export function parseRows(html) {
  const body = html.slice(Math.max(0, html.indexOf("<tbody>")), html.lastIndexOf("</tbody>") + 1 || undefined);
  const rows = [];
  let carry = []; // cells from rows above that also cover this row: { col, cell, left }
  for (const tr of body.split("<tr").slice(1)) {
    const cells = [];
    const added = [];
    let col = 0;
    for (const td of tr.split("<td").slice(1)) {
      let p;
      while ((p = carry.find((c) => c.col === col))) {
        cells.push({ ...p.cell, col });
        col += p.cell.colspan;
      }
      const cell = parseCell(td);
      cells.push({ ...cell, col });
      if (cell.rowspan > 1) added.push({ col, cell, left: cell.rowspan - 1 });
      col += cell.colspan;
    }
    for (const p of carry) if (p.col >= col) cells.push({ ...p.cell, col: p.col });
    carry = [...carry.map((c) => ({ ...c, left: c.left - 1 })).filter((c) => c.left > 0), ...added];
    rows.push(cells.sort((a, b) => a.col - b.col));
  }
  return rows;
}

const PRICE = /(?:[$€£¥￥]|\b(?:usd|cny|rmb|eur|gbp)\b)\s*\d|\d[\d.,]*\s*(?:[$€£¥￥元]|\b(?:usd|cny|rmb|eur|gbp)\b)/i;
const JUNK = /^(?:\d+\s*(?:styles?|colou?rs?|pcs|pieces|options?)|click.*|back to top|n\/?a|-+|sold out|\d+(?:[.,]\d+)?|qc|qc pics?|image|photo|link)$/i;
const GENERIC_LINK =
  /\b(link|buy|click|here|agent|qc|weidian|taobao|1688|store|shop|ink)\b|kakobuy|oopbuy|hipobuy|cnfans|mulebuy|litbuy|acbuy|usfans|uidbuy|hoobuy|allchinabuy|sugargoo|joyagoo|orientdig|lovegobuy|fansbuy|gtbuy|bbdbuy|vigorbuy|fishgoo|superbuy|cssbuy/i;

function cleanName(s) {
  return s.replace(/\n+/g, " · ").replace(/\s+/g, " ").trim().slice(0, 140);
}

const DATE = /^\d{1,4}[\s\/.-]+(?:[a-z]{3,9}|\d{1,2})[\s\/.-]+\d{2,4}$/i;
const SECTION_JUNK = /ctrl\s*\+|bookmark|search for|click|scroll|back to top|⬇|👇|↓/i;
const letters = (s) => (s.match(/\p{L}/gu) || []).length;

// Every row that holds a product link becomes one product: name, price,
// picture and extra photos come from the other cells of that row.
export function productsFromTab(html) {
  // Cells merged down a long stretch of rows are decoration (side banners,
  // labels), not part of any one product.
  const rows = parseRows(html).map((cells) => cells.filter((c) => c.rowspan <= 4));

  const linkRows = rows.map((cells) => {
    const found = [];
    for (const c of cells) for (const l of c.links) {
      const p = parseLink(l.url);
      if (p) found.push({ ...p, key: `${p.platform}:${p.id}`, url: l.url, text: l.text });
    }
    return found;
  });
  // Rows usually list one product through several agents. Some sheets fill an
  // agent column with the same placeholder item again and again, so an item
  // repeated all over the tab counts for less than one that appears once.
  const spread = new Map();
  for (const found of linkRows) for (const k of new Set(found.map((f) => f.key))) spread.set(k, (spread.get(k) || 0) + 1);

  const out = [];
  const seen = new Set();
  let section = "";

  rows.forEach((cells, i) => {
    const found = linkRows[i];
    if (!found.length) {
      const texts = cells.map((c) => c.text).filter(Boolean);
      const t = texts[0];
      if (texts.length === 1 && !cells.some((c) => c.imgs.length) && t.length <= 60 && letters(t) >= 2 && !JUNK.test(t) && !SECTION_JUNK.test(t)) {
        section = cleanName(t);
      }
      return;
    }

    // The item most of the row's links point to wins; then the least
    // repeated one; then the leftmost.
    const votes = new Map();
    for (const f of found) votes.set(f.key, (votes.get(f.key) || 0) + 1);
    const best = found.reduce((a, f) => {
      const dv = votes.get(f.key) - votes.get(a.key);
      if (dv) return dv > 0 ? f : a;
      return spread.get(f.key) < spread.get(a.key) ? f : a;
    });

    const isName = (t) => t && letters(t) >= 3 && !PRICE.test(t) && !JUNK.test(t) && !DATE.test(t);
    const nameCell = cells.find((c) => !c.links.length && isName(c.text));
    const linkName = found.find((f) => isName(f.text) && !GENERIC_LINK.test(f.text));
    const name = cleanName(nameCell?.text || linkName?.text || `${best.platform} ${best.id}`);

    const prices = cells.map((c) => c.text).filter((t) => t && PRICE.test(t) && t.length < 40);
    const price = (prices.find((t) => /\$|usd/i.test(t)) || prices[0] || "").replace(/\s+/g, " ");

    const imgs = [...new Set(cells.flatMap((c) => c.imgs))];
    const dupe = best.key;
    if (seen.has(dupe)) return;
    seen.add(dupe);

    out.push({
      name,
      price,
      img: imgs[0] || "",
      gallery: imgs.slice(1, 9),
      platform: best.platform,
      id: best.id,
      src: best.url,
      section,
    });
  });
  return out;
}

export function getTab(ref, gid) {
  return cached(`tab:${ref.kind}:${ref.id}:${gid}`, async () => {
    const q = gid === "" ? "headers=false" : `headers=false&gid=${encodeURIComponent(gid)}`;
    const html = await fetchHtml(`${base(ref)}/${viewName(ref)}/sheet?${q}`);
    return productsFromTab(html);
  });
}
