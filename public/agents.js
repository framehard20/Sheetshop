// Shopping agents: read any agent or marketplace link down to
// { platform, id }, and build a link for the agent you choose, with your code.
// This file runs in the browser and on the server.
//
// The Weidian format of every agent below was copied from real links found in
// public rep spreadsheets. Uidbuy's 1688 format was checked on uidbuy.com.
// Taobao and 1688 formats for the other agents follow the same pattern as
// their Weidian links but have not been checked one by one.

export const PLATFORMS = ["weidian", "taobao", "1688"];

export function marketUrl(platform, id) {
  if (platform === "weidian") return `https://weidian.com/item.html?itemID=${id}`;
  if (platform === "taobao") return `https://item.taobao.com/item.htm?id=${id}`;
  if (platform === "1688") return `https://detail.1688.com/offer/${id}.html`;
  return "";
}

const enc = encodeURIComponent;
const withCode = (url, key, code) =>
  code ? url + (url.includes("?") ? "&" : "?") + key + "=" + enc(code) : url;

// "/product/weidian/123" style
const pathWord = { weidian: "weidian", taobao: "taobao", "1688": "1688" };
// "shop_type=weidian" style (CNFans family)
const shopType = { weidian: "weidian", taobao: "taobao", "1688": "ali_1688" };
const upper = { weidian: "WEIDIAN", taobao: "TAOBAO", "1688": "ALI_1688" };
// numbered platforms: Uidbuy/USFans use 3 = Weidian, 1 = 1688, 2 = Taobao
const numUid = { weidian: 3, "1688": 1, taobao: 2 };
// Hoobuy/Vigorbuy use 2 = Weidian (the other two numbers are not checked)
const numHoo = { weidian: 2, taobao: 1, "1688": 0 };

const byPath = (host, key) => (p, id, code) =>
  withCode(`https://${host}/product/${pathWord[p]}/${id}`, key, code);
const byShopType = (host, key, path = "/product/") => (p, id, code) =>
  withCode(`https://${host}${path}?shop_type=${shopType[p]}&id=${id}`, key, code);
const byNumber = (host, key, map) => (p, id, code) =>
  withCode(`https://${host}/product/${map[p]}/${id}`, key, code);
const byUrl = (prefix, key) => (p, id, code) =>
  withCode(prefix + enc(marketUrl(p, id)), key, code);
const cssStyle = (host, key) => (p, id, code) => {
  const page = p === "weidian" ? `item-micro-${id}` : p === "1688" ? `item-1688-${id}` : `item-${id}`;
  return withCode(`https://${host}/${page}.html`, key, code);
};

export const AGENTS = [
  { id: "uidbuy", name: "Uidbuy", hosts: ["uidbuy.com"], numbers: numUid,
    build: byNumber("www.uidbuy.com", "ref", numUid),
    signup: (code) => withCode("https://www.uidbuy.com/register", "ref", code) },
  { id: "kakobuy", name: "Kakobuy", hosts: ["kakobuy.com"],
    build: byUrl("https://www.kakobuy.com/item/details?url=", "affcode") },
  { id: "hipobuy", name: "Hipobuy", hosts: ["hipobuy.com"], build: byPath("hipobuy.com", "inviteCode") },
  { id: "oopbuy", name: "Oopbuy", hosts: ["oopbuy.com"], build: byPath("oopbuy.com", "inviteCode") },
  { id: "litbuy", name: "Litbuy", hosts: ["litbuy.com"], build: byPath("litbuy.com", "inviteCode") },
  { id: "gtbuy", name: "GTBuy", hosts: ["gtbuy.com"], build: byPath("gtbuy.com", "inviteCode") },
  { id: "cnfans", name: "CNFans", hosts: ["cnfans.com"], build: byShopType("cnfans.com", "ref") },
  { id: "mulebuy", name: "Mulebuy", hosts: ["mulebuy.com"], build: byShopType("mulebuy.com", "ref") },
  { id: "orientdig", name: "Orientdig", hosts: ["orientdig.com"], build: byShopType("orientdig.com", "ref") },
  { id: "lovegobuy", name: "Lovegobuy", hosts: ["lovegobuy.com"],
    build: byShopType("www.lovegobuy.com", "invite_code", "/product") },
  { id: "joyagoo", name: "Joyagoo", hosts: ["joyagoo.com"],
    build: (p, id, code) => withCode(`https://joyagoo.com/product?platform=${upper[p]}&id=${id}`, "ref", code) },
  { id: "usfans", name: "USFans", hosts: ["usfans.com"], numbers: numUid,
    build: byNumber("www.usfans.com", "ref", numUid) },
  { id: "hoobuy", name: "Hoobuy", hosts: ["hoobuy.com"], numbers: numHoo,
    build: byNumber("hoobuy.com", "inviteCode", numHoo) },
  { id: "vigorbuy", name: "Vigorbuy", hosts: ["vigorbuy.com"], numbers: numHoo,
    build: byNumber("vigorbuy.com", "inviteCode", numHoo) },
  { id: "acbuy", name: "ACBuy", hosts: ["acbuy.com"],
    build: (p, id, code) =>
      withCode(`https://www.acbuy.com/product?id=${id}&source=${{ weidian: "WD", taobao: "TB", "1688": "AL" }[p]}`, "u", code) },
  { id: "allchinabuy", name: "AllChinaBuy", hosts: ["allchinabuy.com"],
    build: byUrl("https://www.allchinabuy.com/en/page/buy/?nTag=Home-search&from=search-input&_search=url&position=&url=", "partnercode") },
  { id: "superbuy", name: "Superbuy", hosts: ["superbuy.com"],
    build: byUrl("https://www.superbuy.com/en/page/buy/?url=", "partnercode") },
  { id: "sugargoo", name: "Sugargoo", hosts: ["sugargoo.com"],
    build: byUrl("https://www.sugargoo.com/products?productLink=", "memberId") },
  { id: "fishgoo", name: "Fishgoo", hosts: ["fishgoo.com"],
    build: byUrl("https://www.fishgoo.com/#/product?productLink=", "memberId") },
  { id: "bbdbuy", name: "BBDBuy", hosts: ["bbdbuy.com", "bbdbuyeu.com"],
    build: (p, id, code) => withCode(`https://www.bbdbuyeu.com/goods/${upper[p]}/${id}`, "inviteCode", code) },
  { id: "fansbuy", name: "Fansbuy", hosts: ["fansbuy.com"], build: cssStyle("fansbuy.com", "promotionCode") },
  { id: "cssbuy", name: "CSSBuy", hosts: ["cssbuy.com"], build: cssStyle("www.cssbuy.com", "promotionCode") },
  { id: "original", name: "Original store (no agent)", hosts: [], build: (p, id) => marketUrl(p, id) },
];

export const agentById = (id) => AGENTS.find((a) => a.id === id);

function platformWord(v) {
  v = String(v || "").toLowerCase();
  if (/^(weidian|wd|micro|wdzg)$/.test(v)) return "weidian";
  if (/^(taobao|tb|tmall|tm)$/.test(v)) return "taobao";
  if (/^(1688|ali_1688|ali1688|al|alibaba)$/.test(v)) return "1688";
  return null;
}

// Any agent or marketplace link -> { platform, id }, or null.
export function parseLink(raw, depth = 0) {
  if (!raw || depth > 3) return null;
  let u;
  try { u = new URL(String(raw).trim()); } catch { return null; }
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const q = (k) => u.searchParams.get(k) || u.searchParams.get(k.toLowerCase());
  const path = u.pathname;

  // 1. The marketplace itself
  if (host === "weidian.com" || host.endsWith(".weidian.com") || host.endsWith("youshop10.com")) {
    const id = q("itemID") || q("itemId") || (path.match(/\/item\/(\d{6,})/) || [])[1];
    return id && /^\d+$/.test(id) ? { platform: "weidian", id } : null;
  }
  if (/(^|\.)(taobao|tmall)\.com$/.test(host)) {
    const id = q("id") || (path.match(/\/item\/(\d{6,})/) || [])[1];
    return id && /^\d+$/.test(id) ? { platform: "taobao", id } : null;
  }
  if (/(^|\.)1688\.com$/.test(host)) {
    const id = (path.match(/\/offer\/(\d{6,})/) || [])[1] || q("offerId");
    return id && /^\d+$/.test(id) ? { platform: "1688", id } : null;
  }

  // 2. A marketplace link tucked inside a parameter (Kakobuy, Sugargoo, ...)
  const params = [...u.searchParams.values()];
  const hashQuery = u.hash.includes("?") ? u.hash.slice(u.hash.indexOf("?") + 1) : "";
  if (hashQuery) params.push(...new URLSearchParams(hashQuery).values());
  for (const v of params) {
    if (/^https?:|%3A%2F%2F/i.test(v)) {
      // a badly encoded link in a sheet must not take the whole tab down
      let decoded = v;
      if (/%3A/i.test(v)) {
        try { decoded = decodeURIComponent(v); } catch {
          // decode what can be decoded and keep the broken bits as they are
          decoded = v.replace(/%[0-9a-f]{2}/gi, (m) => { try { return decodeURIComponent(m); } catch { return m; } });
        }
      }
      const inner = parseLink(decoded, depth + 1);
      if (inner) return inner;
    }
  }
  const hp = new URLSearchParams(hashQuery);
  const get = (k) => q(k) || hp.get(k);

  // 3. platform + id parameters (shop_type=weidian&id=, platform=WEIDIAN&id=, ...)
  const id = get("id") || get("itemId") || get("goodsId") || get("productId");
  const word = get("shop_type") || get("platform") || get("channel") || get("source") || get("shopType") || get("type");
  if (id && /^\d{6,}$/.test(id) && platformWord(word)) return { platform: platformWord(word), id };

  // 4. platform in the path (/product/weidian/123, /goods/WEIDIAN/123)
  const segs = path.split("/").filter(Boolean);
  for (let i = 0; i < segs.length - 1; i++) {
    const p = platformWord(segs[i]);
    const n = segs[i + 1].match(/^(\d{6,})/);
    if (p && n) return { platform: p, id: n[1] };
  }

  // 5. numbered platform in the path (/product/3/123), meaning depends on the agent
  const agent = AGENTS.find((a) => a.hosts.some((h) => host === h || host.endsWith("." + h)));
  const num = path.match(/\/product\/(\d)\/(\d{6,})/);
  if (num && agent?.numbers) {
    const p = Object.keys(agent.numbers).find((k) => String(agent.numbers[k]) === num[1]);
    if (p) return { platform: p, id: num[2] };
  }

  // 6. CSSBuy-style pages (item-micro-123.html)
  const css = path.match(/item-(micro-|1688-)?(\d{6,})\.html/);
  if (css) return { platform: css[1] === "micro-" ? "weidian" : css[1] ? "1688" : "taobao", id: css[2] };

  return null;
}

export function agentOfLink(raw) {
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    return AGENTS.find((a) => a.hosts.some((h) => host === h || host.endsWith("." + h))) || null;
  } catch { return null; }
}

export function buildLink(agentId, platform, id, code) {
  const a = agentById(agentId) || agentById("original");
  return a.build(platform, id, code);
}
