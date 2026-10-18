import { AGENTS, agentById, buildLink } from "./agents.js";
import { CATEGORY_ORDER, categorize, brandOf, indexText, makeQuery } from "./catalog.js";
import { LANGS, CURRENCIES, translator, pickLang, pickCurrency, catNames, localeFor } from "./i18n.js";
import { startTracking, track } from "./track.js";

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k.startsWith("aria-") || k.startsWith("data-")) n.setAttribute(k, v);
    else n[k] = v;
  }
  for (const k of kids) if (k != null) n.append(k);
  return n;
};
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem("sheetshop:" + k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem("sheetshop:" + k, JSON.stringify(v)); } catch {} },
};
const session = {
  get(k) { try { return sessionStorage.getItem("sheetshop:" + k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem("sheetshop:" + k, v); } catch {} },
};
async function api(path, params, post) {
  const res = post
    ? await fetch(`/api/${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(post) })
    : await fetch(`/api/${path}?${new URLSearchParams(params || {})}`);
  const body = await res.json().catch(() => ({ error: "The server sent a broken answer." }));
  if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
  return body;
}

// Dialogs close with their ✕ / "later" buttons and by tapping outside
// (except the language window, which needs an answer).
for (const d of document.querySelectorAll("dialog")) {
  d.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || (e.target === d && !d.hasAttribute("data-must-answer"))) d.close();
  });
}

// While a pop-up is open the page behind it stays still: only the pop-up
// moves. (A fixed body is what stops iPhones from scrolling behind it.)
let locks = 0, lockedAt = 0;
function lockPage() {
  if (locks++) return;
  lockedAt = scrollY;
  Object.assign(document.body.style, { position: "fixed", top: `-${lockedAt}px`, left: "0", right: "0", width: "100%" });
  document.documentElement.style.overflow = "hidden";
}
function unlockPage() {
  if (--locks > 0) return;
  locks = 0;
  document.body.style.cssText = "";
  document.documentElement.style.overflow = "";
  window.scrollTo({ top: lockedAt, behavior: "instant" });
}
function openModal(d) {
  if (d.open) return;
  d.showModal();
  lockPage();
  d.addEventListener("close", unlockPage, { once: true });
}

// ---- appearance: light / dark / follow the device
function applyTheme(mode) {
  if (mode === "light" || mode === "dark") document.documentElement.dataset.theme = mode;
  else delete document.documentElement.dataset.theme;
  store.set("theme", mode);
}
const isDark = () => document.documentElement.dataset.theme
  ? document.documentElement.dataset.theme === "dark"
  : matchMedia("(prefers-color-scheme: dark)").matches;

const qs = new URLSearchParams(location.search);
// Shop links carry ?c=<signed settings>; older ?s= links are no longer accepted.
if (qs.has("c") || qs.has("s")) shop(qs.get("c") || ""); else builder();

// ======================================================================== builder

function builder() {
  $("#builder").hidden = false;
  const saved = store.get("builder") || {};

  const rowList = (box, make) => (value) => {
    const row = make(value);
    const del = el("button", { type: "button", className: "row-x", textContent: "✕", title: "Remove" });
    del.onclick = () => { if (box.children.length > 1) row.remove(); };
    row.append(del);
    box.append(row);
  };
  const sheetBox = $("#b-sheets");
  const addSheet = rowList(sheetBox, (v = "") => el("div", { className: "row-2" },
    el("input", { type: "url", inputMode: "url", autocomplete: "off", value: v, placeholder: "https://docs.google.com/spreadsheets/d/…", "aria-label": "Google Sheet link" })));
  const agentBox = $("#b-agents");
  const addAgent = rowList(agentBox, (a = {}) => {
    const select = el("select", { "aria-label": "Agent" });
    for (const ag of AGENTS) select.append(el("option", { value: ag.id, textContent: ag.name }));
    select.value = a.id || "uidbuy";
    const code = el("input", { type: "text", placeholder: "Invite code", value: a.code || "", autocomplete: "off", "aria-label": "Invite code" });
    select.onchange = () => { code.disabled = select.value === "original"; };
    select.onchange();
    return el("div", { className: "agent-row" }, select, code);
  });

  (saved.sheets?.length ? saved.sheets : [""]).forEach(addSheet);
  (saved.agents?.length ? saved.agents : [{}]).forEach(addAgent);
  $("#b-add-sheet").onclick = () => { if (sheetBox.children.length < 10) addSheet(""); };
  $("#b-add").onclick = () => addAgent({ id: "kakobuy" });
  $("#b-title").value = saved.title || "";
  $("#b-logo").value = saved.logo || "";

  $("#b-form").onsubmit = async (e) => {
    e.preventDefault();
    const msg = $("#b-msg");
    const sheets = [...sheetBox.querySelectorAll("input")].map((i) => i.value.trim()).filter(Boolean);
    const agents = [...agentBox.children].map((r) => ({ id: r.querySelector("select").value, code: r.querySelector("input").value.trim() }));
    const title = $("#b-title").value.trim();
    const logo = $("#b-logo").value.trim();
    store.set("builder", { sheets, agents, title, logo }); // never the password
    msg.className = "msg"; msg.textContent = "Reading the sheets…";
    $("#b-go").disabled = true;
    $("#b-result").hidden = true;
    try {
      const info = await api("sign", null, { password: $("#b-pass").value, sheets, agents, title, logo });
      const url = `${location.origin}/?c=${info.token}`;
      msg.textContent = `Found “${info.title}”: ${info.sheets} sheet${info.sheets === 1 ? "" : "s"}, ${info.tabs} tab${info.tabs === 1 ? "" : "s"}.`;
      $("#b-url").value = url;
      $("#b-open").href = url;
      $("#b-result").hidden = false;
    } catch (err) {
      msg.className = "msg err"; msg.textContent = err.message;
    } finally {
      $("#b-go").disabled = false;
    }
  };
  $("#b-copy").onclick = async () => {
    const i = $("#b-url");
    try { await navigator.clipboard.writeText(i.value); } catch { i.select(); document.execCommand("copy"); }
    $("#b-copy").textContent = "Copied";
    setTimeout(() => ($("#b-copy").textContent = "Copy"), 1500);
  };
}

// ======================================================================== shop

async function shop(token) {
  $("#shop").hidden = false;
  let lang = pickLang(qs.get("lang") || store.get("lang"));
  let t = translator(lang);
  let locale = localeFor(lang);
  let currency = pickCurrency(store.get("currency"));
  document.documentElement.lang = lang;

  // ---- first thing on arrival: language and currency (asked once per
  // device; changeable any time with the 🌐 button)
  let onLocale = () => {}; // replaced once the shop is drawn
  const introDone = new Promise((resolve) => {
    if (store.get("localeOk")) return resolve();
    const d = $("#intro"), ls = $("#intro-lang"), cs = $("#intro-cur");
    ls.replaceChildren(...Object.entries(LANGS).map(([v, n]) => el("option", { value: v, textContent: n })));
    ls.value = lang;
    const paint = () => {
      const tt = translator(ls.value);
      $("#intro-title").textContent = tt("introTitle");
      $("#intro-text").textContent = tt("introText");
      $("#intro-lang-l").textContent = tt("language");
      $("#intro-cur-l").textContent = tt("currency");
      $("#intro-ok").textContent = tt("accept");
      let name = (c) => c;
      try { const dn = new Intl.DisplayNames([localeFor(ls.value)], { type: "currency" }); name = (c) => `${c} · ${dn.of(c)}`; } catch {}
      const keep = cs.value || currency;
      cs.replaceChildren(...CURRENCIES.map((c) => el("option", { value: c, textContent: name(c) })));
      cs.value = keep;
    };
    paint();
    ls.onchange = paint;
    d.addEventListener("cancel", (e) => e.preventDefault()); // Esc doesn't skip it
    $("#intro-ok").onclick = () => {
      store.set("localeOk", 1);
      const changed = ls.value !== lang || cs.value !== currency;
      lang = ls.value; currency = cs.value;
      store.set("lang", lang); store.set("currency", currency);
      t = translator(lang); locale = localeFor(lang);
      d.close();
      if (changed) onLocale();
      resolve();
    };
    openModal(d);
  });

  const grid = $("#grid");
  const status = (s) => ($("#status").textContent = s);
  const skeleton = () => grid.replaceChildren(...Array.from({ length: 10 }, () => el("div", { className: "skel" })));
  skeleton();
  status(t("loading"));

  let rates = { USD: 1 };
  const ratesReady = api("rates").then((r) => { rates = r.rates || rates; }).catch(() => {});

  let info;
  try {
    // The server checks the link's signature and answers with the agents and
    // codes the owner signed, so the address can't be edited to swap them.
    info = await api("sheet", { c: token });
  } catch (err) {
    status("");
    for (const s of [".bar", ".hero", ".foot"]) $(s).hidden = true;
    grid.replaceChildren(el("div", { className: "empty-state" }, el("b", { textContent: "Sheetshop" }), err.message));
    return;
  }

  // ---- agents & offer
  const agents = info.agents.map(([id, code]) => ({ id, code })).filter((a) => agentById(a.id));
  if (!agents.length) agents.push({ id: "original", code: "" });
  const shopKey = info.sheets.map((s) => s.id.slice(0, 10)).join("-");
  let agent = agents.find((a) => a.id === store.get("agent:" + shopKey)) || agents[0];
  // The $800 + 40% offer is the one that comes with signing up to Uidbuy
  // through the owner's link; other agents just show their code.
  const offerOn = () => agent.id === "uidbuy" && !!agent.code;
  const signupUrl = () => agentById(agent.id).signup?.(agent.code) || "";
  const agentName = () => agentById(agent.id).name;
  const linkFor = (p) => buildLink(agent.id, p.platform, p.id, agent.code);

  // ---- state
  const byKey = new Map(); // "platform:id" -> product
  let items = [];
  let cat = qs.get("cat") || "all";
  let brand = qs.get("brand") || "";
  let sort = qs.get("sort") || "featured";
  let query = qs.get("q") || "";
  let favs = new Set(store.get("favs:" + shopKey) || []);
  let list = [];
  let shownKeys = [];
  const STEP = 40;
  let loadingLeft = 0;

  // ---- prices
  const usd = (p) => (p.p ? p.p.a / (rates[p.p.c] || ({ CNY: 6.7, EUR: 0.89, GBP: 0.75 }[p.p.c] || 1)) : null);
  const money = (n, cur) => {
    const whole = ["JPY", "KRW", "HUF"].includes(cur);
    return new Intl.NumberFormat(locale, { style: "currency", currency: cur, maximumFractionDigits: whole ? 0 : 2, minimumFractionDigits: whole ? 0 : 2 }).format(n);
  };
  const priceText = (p) => {
    if (!p.p) return p.price || "";
    if (p.p.c === currency) return money(p.p.a, currency);
    const v = usd(p) * (rates[currency] || 1);
    return "≈ " + money(v, rates[currency] ? currency : "USD");
  };

  // ---- pictures: direct while Google's link is fresh, else through /api/img
  const relay = (p, k, w) => `/api/img?s=${p.sheet.id}&g=${encodeURIComponent(p.gid)}&k=${k}&w=${w}&h=${p.sheet.h}`;
  function picture(p, w = 500, k = p.ik) {
    const box = el("div", { className: "ph" });
    if (!k && !p.img) { box.classList.add("empty"); return box; }
    const img = el("img", { alt: "", loading: "lazy", decoding: "async", referrerPolicy: "no-referrer", className: "loading" });
    let triedRelay = !(k === p.ik && p.img);
    img.src = triedRelay ? relay(p, k, w) : p.img;
    img.onload = () => img.classList.remove("loading");
    img.onerror = () => {
      if (!triedRelay && k) { triedRelay = true; img.src = relay(p, k, w); return; }
      img.remove(); box.classList.add("empty");
    };
    box.append(img);
    return box;
  }

  // ---- reading the sheets
  function ingest(rows, task, page, into = byKey) {
    rows.forEach((raw, r) => {
      const key = `${raw.platform}:${raw.id}`;
      const order = task.order * 1e6 + page * 1e3 + r;
      const old = into.get(key);
      if (old && old.order <= order) {
        if (!old.ik && raw.ik) Object.assign(old, { img: raw.img, ik: raw.ik, gal: raw.gal, sheet: task.sheet, gid: task.gid });
        return;
      }
      const p = { ...raw, key, order, sheet: task.sheet, gid: task.gid, tab: task.name };
      p.cat = categorize(p, task.name);
      p.brand = brandOf(p.name);
      p.ix = indexText(p, catNames(p.cat));
      into.set(key, p);
    });
  }

  // One task per tab. "v" is the sheet's last-edit date: a new edit asks for
  // a new address, so no cache can hand back the old list.
  let sheetsNow = info.sheets;
  const tasksFor = (list) => list.flatMap((s, si) => s.tabs.map((tab, ti) =>
    ({ sh: si, gid: tab.gid, name: tab.name, v: s.modified || "", sheet: { id: s.id, h: s.h }, order: si * 1000 + ti })));
  const tasks = tasksFor(sheetsNow);
  loadingLeft = tasks.length;
  let failures = 0, lastError = null;
  async function loadInto(into, task, live) {
    let page = 0, pages = 1;
    while (page < pages) {
      const r = await api("tab", { c: token, sh: task.sh, gid: task.gid, page, v: task.v });
      ingest(r.items, task, page, into);
      pages = r.pages;
      page++;
      if (live) soon();
    }
  }
  async function loadTask(task) {
    try { await loadInto(byKey, task, true); } catch (e) { failures++; lastError = e; }
    loadingLeft--;
    soon();
  }
  const queue = [...tasks];
  const worker = async () => { while (queue.length) await loadTask(queue.shift()); };

  // ---- keeping up with edits: every 2 minutes (and when the page comes back
  // into view) ask whether a sheet changed; if so read everything again in the
  // background and swap it in without touching what's on screen.
  const lastEdit = () => sheetsNow.map((s) => s.modified).filter(Boolean).sort().pop() || null;
  let checking = false, checkedAt = Date.now();
  async function checkForEdits() {
    if (checking || loadingLeft > 0 || !sheetsNow.some((s) => s.modified)) return;
    checking = true;
    checkedAt = Date.now();
    try {
      const r = await api("sheet", { c: token });
      if (r.sheets.some((s, i) => s.modified && s.modified !== sheetsNow[i]?.modified)) {
        const fresh = new Map();
        const q = tasksFor(r.sheets);
        await Promise.all(Array.from({ length: Math.min(4, q.length) }, async () => {
          while (q.length) { const task = q.shift(); try { await loadInto(fresh, task, false); } catch {} }
        }));
        if (fresh.size) {
          sheetsNow = r.sheets;
          byKey.clear();
          for (const [k, v] of fresh) byKey.set(k, v);
          refresh();
          toast(t("refreshed"), 4000);
        }
      }
    } catch {}
    checking = false;
  }
  setInterval(() => { if (!document.hidden) checkForEdits(); }, 120000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && Date.now() - checkedAt > 60000) checkForEdits(); });

  // ---- filtering & sorting
  function base(ofCat = cat) {
    if (ofCat === "saved") return items.filter((p) => favs.has(p.key));
    if (ofCat === "all") return items;
    return items.filter((p) => p.cat === ofCat);
  }
  function current() {
    let out = base();
    if (brand) out = out.filter((p) => p.brand === brand);
    const score = query ? makeQuery(query) : null;
    if (score) {
      out = out.map((p) => [score(p.ix), p]).filter(([s]) => s > 0);
      if (sort === "featured") out.sort((a, b) => b[0] - a[0] || a[1].order - b[1].order);
      out = out.map(([, p]) => p);
    }
    const byPrice = (dir) => (a, b) => {
      const x = usd(a), y = usd(b);
      if (x == null && y == null) return a.order - b.order;
      if (x == null) return 1;
      if (y == null) return -1;
      return (x - y) * dir || a.order - b.order;
    };
    if (sort === "low") out = [...out].sort(byPrice(1));
    else if (sort === "high") out = [...out].sort(byPrice(-1));
    else if (sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name, locale) || a.order - b.order);
    return out;
  }

  // ---- drawing
  function card(p) {
    const a = el("a", { className: "card", href: linkFor(p), target: "_blank", rel: "noopener sponsored nofollow" });
    const ph = picture(p, 500);
    const fav = el("button", { type: "button", className: "mini fav", "aria-label": t(favs.has(p.key) ? "unsave" : "save"), "aria-pressed": String(favs.has(p.key)) });
    fav.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>';
    fav.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggleFav(p, fav); };
    if (p.brand) ph.append(el("span", { className: "tag", textContent: p.brand }));
    ph.append(el("div", { className: "act r" }, fav));
    if (p.gal?.length) ph.append(el("div", { className: "act b" }, el("span", { className: "mini", textContent: `📷 ${p.gal.length + 1}`, title: t("photos", { n: p.gal.length + 1 }) })));
    a.append(ph, el("div", { className: "body" },
      el("span", { className: "name", textContent: p.name }),
      priceText(p) ? el("span", { className: "price", textContent: priceText(p) }) : null,
    ));
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // new-tab clicks go straight through
      e.preventDefault();
      openProduct(p);
    });
    return a;
  }

  // ---- product window (like flayfind's outfit window): photos, price, buy
  // link and the sign-up offer
  const pm = $("#pm");
  let pmProduct = null, pmPhotos = [], pmAt = 0;
  function showPhoto(i) {
    if (!pmPhotos.length) { $("#pm-media").replaceChildren(picture(pmProduct, 1000, "")); return; }
    pmAt = (i + pmPhotos.length) % pmPhotos.length;
    $("#pm-media").replaceChildren(picture(pmProduct, 1000, pmPhotos[pmAt]));
    [...$("#pm-thumbs").children].forEach((b, j) => b.setAttribute("aria-current", String(j === pmAt)));
  }
  function openProduct(p) {
    pmProduct = p;
    pmPhotos = [p.ik, ...(p.gal || [])].filter(Boolean);
    $("#pm-tag").textContent = t.cat(p.cat);
    $("#pm-brand").textContent = p.brand || "";
    $("#pm-name").textContent = p.name;
    $("#pm-price-lbl").textContent = t("priceLbl");
    $("#pm-price").textContent = priceText(p);
    $("#pm-price").parentElement.hidden = !priceText(p);
    $("#pm-buy").href = linkFor(p);
    $("#pm-buy-text").textContent = t("pmBuy", { agent: agentName() });
    const many = pmPhotos.length > 1;
    $("#pm-prev").hidden = $("#pm-next").hidden = !many;
    $("#pm-prev").setAttribute("aria-label", t("prev"));
    $("#pm-next").setAttribute("aria-label", t("next"));
    $("#pm-thumbs").replaceChildren(...(many ? pmPhotos.map((k, j) => {
      const b = el("button", { type: "button", "aria-label": `${j + 1} / ${pmPhotos.length}` }, picture(p, 200, k));
      b.onclick = () => showPhoto(j);
      return b;
    }) : []));
    showPhoto(0);
    $(".pm-panel").scrollTop = 0;
    openModal(pm);
    $("#pm-buy").focus({ preventScroll: true });
  }
  $("#pm-prev").onclick = () => showPhoto(pmAt - 1);
  $("#pm-next").onclick = () => showPhoto(pmAt + 1);
  pm.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") showPhoto(pmAt - 1);
    if (e.key === "ArrowRight") showPhoto(pmAt + 1);
  });
  // Buy: the sign-up step comes first, the first time in each page load
  $("#pm-buy").addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !pmProduct) return;
    e.preventDefault();
    buy(pmProduct);
  });

  function toggleFav(p, btn) {
    if (favs.has(p.key)) favs.delete(p.key); else favs.add(p.key);
    store.set("favs:" + shopKey, [...favs]);
    btn.setAttribute("aria-pressed", String(favs.has(p.key)));
    btn.setAttribute("aria-label", t(favs.has(p.key) ? "unsave" : "save"));
    paintChips();
    if (cat === "saved") render(true);
  }

  function paintChips() {
    const counts = new Map();
    for (const p of items) counts.set(p.cat, (counts.get(p.cat) || 0) + 1);
    const chip = (id, label, n) => {
      const b = el("button", { type: "button", className: "chip", "aria-pressed": String(cat === id) }, label,
        n != null ? el("span", { className: "n", textContent: n.toLocaleString(locale) }) : null);
      b.onclick = () => setCat(id);
      return b;
    };
    const chips = [chip("all", t("all"), items.length)];
    for (const c of CATEGORY_ORDER) if (counts.get(c)) chips.push(chip(c, t.cat(c), counts.get(c)));
    if (favs.size) chips.push(chip("saved", "♥ " + t("saved"), favs.size));
    $("#cats").replaceChildren(...chips);

    // shop-by-category tiles on the home view
    const show = cat === "all" && !query && counts.size > 1;
    $("#tiles-wrap").hidden = !show;
    if (show) {
      const cats = CATEGORY_ORDER.filter((c) => counts.get(c));
      const covers = cats.map((c) => items.find((p) => p.cat === c && p.img) || items.find((p) => p.cat === c && p.ik) || items.find((p) => p.cat === c));
      const sig = lang + "|" + cats.map((c, i) => c + ":" + covers[i].key).join(",");
      if (sig !== paintChips.tiles) {
        // rebuilt only when a tile or its picture changes, so pictures don't flicker while loading
        paintChips.tiles = sig;
        $("#tiles").replaceChildren(...cats.map((c, i) => {
          const b = el("button", { type: "button", className: "tile", "data-cat": c }, picture(covers[i], 300),
            el("b", { textContent: t.cat(c) }), el("small"));
          b.onclick = () => { setCat(c); $("#bar").scrollIntoView({ behavior: "smooth" }); };
          return b;
        }));
      }
      for (const b of $("#tiles").children) b.querySelector("small").textContent = t("items", { n: counts.get(b.dataset.cat).toLocaleString(locale) });
    }

    // brands present in this category
    const brands = new Map();
    for (const p of base()) if (p.brand) brands.set(p.brand, (brands.get(p.brand) || 0) + 1);
    const sel = $("#brand");
    const opts = [...brands].sort((a, b) => b[1] - a[1]).slice(0, 80);
    if (brand && !brands.has(brand)) opts.unshift([brand, 0]);
    sel.replaceChildren(el("option", { value: "", textContent: t("allBrands") }),
      ...opts.map(([b, n]) => el("option", { value: b, textContent: n ? `${b} (${n})` : b })));
    sel.value = brand;
    sel.hidden = !opts.length;
  }

  function setCat(id) {
    cat = id;
    brand = "";
    syncUrl();
    paintChips();
    render(true);
    const on = $("#cats [aria-pressed='true']");
    on?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  function paintStatus() {
    const n = list.length;
    const more = loadingLeft > 0 ? ` · ${t("stillLoading")}…` : "";
    status(n ? t(n === 1 ? "product" : "products", { n: n.toLocaleString(locale) }) + more : loadingLeft ? t("loading") : "");
    const edited = lastEdit();
    $("#subtitle").textContent = edited
      ? t("updatedAt", { n: items.length.toLocaleString(locale), date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(edited)) })
      : t("fromSheets", { n: items.length.toLocaleString(locale) });
    $("#list-title").textContent = query ? `“${query}”` : cat === "all" ? t("allProducts") : cat === "saved" ? t("saved") : t.cat(cat);
  }

  function render(reset) {
    if (reset) { list = current(); shownKeys = []; grid.replaceChildren(); }
    if (!list.length) {
      if (loadingLeft > 0 && !items.length) skeleton();
      else if (loadingLeft === 0 || items.length) {
        grid.replaceChildren(query
          ? el("div", { className: "empty-state" }, el("b", { textContent: t("nothing", { q: query }) }), t("nothingTip"))
          : el("div", { className: "empty-state" }, el("b", { textContent: t("empty") })));
      }
      paintStatus();
      return;
    }
    if (grid.querySelector(".skel, .empty-state")) grid.replaceChildren();
    const next = list.slice(shownKeys.length, shownKeys.length + STEP);
    grid.append(...next.map(card));
    shownKeys.push(...next.map((p) => p.key));
    paintStatus();
  }

  // New products arrived: keep what is on screen when its order still holds.
  function refresh() {
    items = [...byKey.values()].sort((a, b) => a.order - b.order);
    paintChips();
    const fresh = current();
    const same = shownKeys.every((k, i) => fresh[i]?.key === k);
    list = fresh;
    if (!shownKeys.length || !same) {
      const keep = Math.max(STEP, shownKeys.length);
      shownKeys = [];
      grid.replaceChildren();
      while (shownKeys.length < Math.min(keep, list.length)) render(false);
      if (!list.length) render(false);
    } else if (shownKeys.length < STEP) render(false);
    else paintStatus();
    if (loadingLeft === 0 && !items.length) {
      grid.replaceChildren(el("div", { className: "empty-state" }, el("b", { textContent: t("empty") }),
        failures && lastError ? lastError.message : ""));
    }
  }
  let timer = null;
  const soon = () => { if (!timer) timer = setTimeout(() => { timer = null; refresh(); }, 250); };

  new IntersectionObserver((e) => {
    if (e[0].isIntersecting && shownKeys.length < list.length) render(false);
  }, { rootMargin: "1200px" }).observe($("#more"));

  function syncUrl() {
    const p = new URLSearchParams(location.search);
    for (const [k, v] of [["cat", cat === "all" ? "" : cat], ["brand", brand], ["sort", sort === "featured" ? "" : sort], ["q", query]]) {
      if (v) p.set(k, v); else p.delete(k);
    }
    history.replaceState(null, "", `${location.pathname}?${p}`);
  }

  // ---- buying: sign-up step first (once per visit), then the product
  const gate = $("#gate");
  let gateShown = false;
  let gateProduct = null;
  function buy(p) {
    // once per page load, on the first product tapped; a reload starts over
    if (offerOn() && !gateShown) { gateShown = true; return openGate(p); }
    window.open(linkFor(p), "_blank", "noopener");
  }
  function openGate(p) {
    gateProduct = p;
    $("#gate-step1").hidden = false;
    $("#gate-step2").hidden = true;
    $("#gate-product").replaceChildren(picture(p, 200),
      el("div", {}, el("span", { textContent: p.name }), priceText(p) ? el("small", { textContent: priceText(p) }) : null));
    openModal(gate);
    $("#gate-cta").focus();
  }
  // Only clicks on sign-up links are counted, each place under its own name.
  const signedUp = (where) => {
    store.set("joined", Date.now());
    track("signup_" + where, { shop: info.title, agent: agent.id });
  };
  $("#gate-cta").addEventListener("click", () => {
    signedUp("before_buy");
    $("#gate-step1").hidden = true;
    $("#gate-step2").hidden = false;
    $("#ready-cta").focus();
  });
  const goToProduct = () => {
    gate.close();
    if (gateProduct) window.open(linkFor(gateProduct), "_blank", "noopener");
  };
  $("#gate-skip").addEventListener("click", goToProduct);
  $("#ready-again").addEventListener("click", () => signedUp("before_buy_again"));
  $("#ready-cta").addEventListener("click", goToProduct);

  // ---- welcome gift: a few seconds in, at most every 3 days, never for people who signed up
  function maybeWelcome() {
    if (!offerOn() || store.get("joined") || document.querySelector("dialog[open]")) return;
    const last = store.get("welcomeAt") || 0;
    if (Date.now() - last < 3 * 86400e3) return;
    store.set("welcomeAt", Date.now());
    openModal($("#welcome"));
  }
  introDone.then(() => setTimeout(maybeWelcome, 9000));
  $("#wel-cta").addEventListener("click", () => { signedUp("welcome_popup"); $("#welcome").close(); });
  $("#offer").addEventListener("click", () => { if (offerOn()) signedUp("under_title"); });
  $("#topbar").addEventListener("click", () => signedUp("top_bar"));
  $("#pm-cta").addEventListener("click", () => signedUp("product_window"));
  $("#sticky-offer").addEventListener("click", (e) => {
    if (e.target.closest("#sticky-x")) { e.preventDefault(); session.set("stickyOff", "1"); $("#sticky-offer").hidden = true; return; }
    signedUp("floating_bar");
  });


  // ---- texts (again whenever the language changes)
  function paintTexts() {
    document.documentElement.lang = lang;
    $("#q").placeholder = t("search");
    $("#sort").replaceChildren(...[["featured", "sortFeatured"], ["low", "sortLow"], ["high", "sortHigh"], ["name", "sortName"]]
      .map(([v, k]) => el("option", { value: v, textContent: t(k) })));
    $("#sort").value = sort;
    $("#tiles-title").textContent = t("shopBy");
    $("#settings-label").textContent = `${lang} · ${currency}`;
    $("#settings-title").textContent = t("settings");
    $("#set-lang").textContent = t("language");
    $("#set-cur").textContent = t("currency");
    $("#set-look").textContent = t("appearance");
    for (const b of $("#theme-seg").children) b.textContent = t(b.dataset.theme);
    $("#btn-share").setAttribute("aria-label", t("share"));
    $("#btn-search").setAttribute("aria-label", t("search"));
    $("#btn-settings").setAttribute("aria-label", t("settings"));
    $("#foot-text").textContent = t("footer", { agent: agentName() }) + (info.umami ? " " + t("privacy") : "");

    const offer = $("#offer");
    const sticky = $("#sticky-offer");
    const trust = $("#trust");
    if (offerOn()) {
      offer.href = sticky.href = $("#topbar").href = $("#pm-cta").href = signupUrl();
      t.into($("#offer-text"), "offerBar", { agent: agentName() });
      t.into($("#topbar-text"), "offerBar", { agent: agentName() });
      $("#topbar").hidden = false;
      $("#pm-reg").hidden = false;
      $("#pm-reg-line").textContent = t("pmRegLine");
      $("#pm-reg-text").textContent = t("pmRegText", { agent: agentName() });
      $("#pm-cta-text").textContent = t("pmCta");
      $("#pm-fine").textContent = t("pmFine");
      $("#pm-trust").replaceChildren(...["trust1", "trust2", "trust3"].map((k) => el("li", { textContent: t(k) })));
      $("#pm-trust").hidden = false;
      $("#sticky-text").textContent = t("offerShort") + " →";
      offer.hidden = false;
      trust.replaceChildren(...["trust1", "trust2", "trust3", "trust4"].map((k) => el("li", { textContent: t(k) })));
      trust.hidden = false;
      // gate & welcome
      $("#gate-kicker").textContent = t("gateKicker");
      t.into($("#gate-title"), "gateTitle");
      for (const k of ["S1t", "S1d", "S2t", "S2d", "S3t", "S3d"]) $("#gate-" + k.toLowerCase()).textContent = t("gate" + k, { agent: agentName() });
      $("#gate-cta").href = $("#ready-again").href = signupUrl();
      $("#gate-cta").textContent = t("gateCta");
      t.into($("#gate-skip"), "gateSkip");
      $("#ready-title").textContent = t("readyTitle");
      $("#ready-text").textContent = t("readyText", { agent: agentName() });
      $("#ready-cta").textContent = t("readyCta");
      $("#ready-again").textContent = t("readyAgain", { agent: agentName() });
      $("#wel-kicker").textContent = t("welKicker");
      $("#wel-amount").textContent = t("welAmount");
      t.into($("#wel-line"), "welLine");
      $("#wel-text").textContent = t("welText", { agent: agentName() });
      $("#wel-perks").replaceChildren(...["trust1", "trust2", "trust3"].map((k) => el("li", { textContent: t(k) })));
      $("#wel-cta").href = signupUrl();
      $("#wel-cta").textContent = t("welCta");
      $("#wel-later").textContent = t("welLater");
    } else {
      offer.hidden = !agent.code;
      sticky.hidden = true;
      trust.hidden = true;
      $("#topbar").hidden = true;
      $("#pm-reg").hidden = true;
      $("#pm-trust").hidden = true;
      if (agent.code) { offer.removeAttribute("href"); t.into($("#offer-text"), "codeBar", { agent: agentName(), code: agent.code }); }
    }
  }

  startTracking(info.umami);

  // ---- header: logo, title, tools
  const title = info.title;
  document.title = title;
  $("#title").textContent = title;
  $("#nav-title").textContent = title;
  for (const img of [$("#hero-logo"), $("#nav-logo")]) {
    img.src = info.logo || "/icon.svg";
    img.onerror = () => { img.onerror = null; img.src = "/icon.svg"; };
  }
  const nav = $(".nav");
  new IntersectionObserver((e) => nav.classList.toggle("scrolled", !e[0].isIntersecting)).observe($("#title"));
  // the floating offer shows once the one in the header is out of sight
  new IntersectionObserver((e) => {
    $("#sticky-offer").classList.toggle("off", e[0].isIntersecting);
    $("#sticky-offer").hidden = !offerOn() || session.get("stickyOff") === "1";
  }).observe($("#offer"));

  if (agents.length > 1) {
    const sel = $("#agent-select");
    sel.replaceChildren(...agents.map((a) => el("option", { value: a.id, textContent: agentById(a.id).name })));
    sel.value = agent.id;
    sel.hidden = false;
    sel.onchange = () => {
      agent = agents.find((a) => a.id === sel.value);
      store.set("agent:" + shopKey, agent.id);
      paintTexts();
      render(true);
    };
  }

  $("#btn-theme").onclick = () => applyTheme(isDark() ? "light" : "dark");
  $("#btn-search").onclick = () => { $("#bar").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $("#q").focus({ preventScroll: true }), 350); };
  $("#btn-share").onclick = async () => {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); toast(t("copied")); }
    } catch {}
  };
  function toast(s, ms = 1800) {
    const n = $("#toast");
    n.textContent = s;
    n.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (n.hidden = true), ms);
  }

  // settings: language, currency, appearance
  const langSel = $("#lang-select");
  langSel.replaceChildren(...Object.entries(LANGS).map(([v, n]) => el("option", { value: v, textContent: n })));
  const curSel = $("#cur-select");
  let curName = (c) => c;
  try { const dn = new Intl.DisplayNames([locale], { type: "currency" }); curName = (c) => `${c} · ${dn.of(c)}`; } catch {}
  curSel.replaceChildren(...CURRENCIES.map((c) => el("option", { value: c, textContent: curName(c) })));
  const paintSeg = () => {
    const mode = store.get("theme") || "auto";
    for (const b of $("#theme-seg").children) b.setAttribute("aria-checked", String(b.dataset.theme === mode));
  };
  $("#btn-settings").onclick = () => { langSel.value = lang; curSel.value = currency; paintSeg(); openModal($("#settings")); };
  onLocale = () => { paintTexts(); paintChips(); render(true); };
  langSel.onchange = () => {
    lang = langSel.value; store.set("lang", lang); store.set("localeOk", 1);
    t = translator(lang); locale = localeFor(lang);
    onLocale();
  };
  curSel.onchange = () => { currency = curSel.value; store.set("currency", currency); paintTexts(); render(true); };
  $("#theme-seg").onclick = (e) => { const b = e.target.closest("button"); if (b) { applyTheme(b.dataset.theme); paintSeg(); } };

  $("#q").value = query;
  let typing;
  $("#q").addEventListener("input", (e) => {
    clearTimeout(typing);
    typing = setTimeout(() => { query = e.target.value.trim(); syncUrl(); paintChips(); render(true); }, 160);
  });
  $("#sort").onchange = (e) => { sort = e.target.value; syncUrl(); render(true); };
  $("#brand").onchange = (e) => { brand = e.target.value; syncUrl(); render(true); };

  paintTexts();
  // prices change once the exchange rates arrive; redraw only if nothing has been scrolled yet
  ratesReady.then(() => { if (items.length && shownKeys.length <= STEP) render(true); });
  await Promise.all(Array.from({ length: Math.min(4, tasks.length) }, worker));
  if (!byKey.size && failures) {
    grid.replaceChildren(el("div", { className: "empty-state" }, el("b", { textContent: t("empty") }), lastError?.message || ""));
  }
}
