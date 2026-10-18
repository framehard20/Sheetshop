import { AGENTS, agentById, buildLink } from "./agents.js";

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(tag), props);
  for (const k of kids) if (k != null) n.append(k);
  return n;
};
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
async function api(path, params) {
  const res = await fetch(`/api/${path}?${new URLSearchParams(params)}`);
  const body = await res.json().catch(() => ({ error: "The server sent a broken answer." }));
  if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
  return body;
}

const qs = new URLSearchParams(location.search);
if (qs.get("s")) shop(); else builder();

// ---------------------------------------------------------------- builder

function builder() {
  $("#builder").hidden = false;
  const saved = store.get("sheetshop:builder") || {};
  const box = $("#b-agents");

  const addRow = (a = {}) => {
    const select = el("select", { "aria-label": "Agent" });
    for (const ag of AGENTS) select.append(el("option", { value: ag.id, textContent: ag.name }));
    select.value = a.id || "uidbuy";
    const code = el("input", { placeholder: "Invite code", value: a.code || "", autocomplete: "off", "aria-label": "Invite code" });
    const del = el("button", { type: "button", textContent: "✕", title: "Remove" });
    const row = el("div", { className: "agent-row" }, select, code, del);
    del.onclick = () => { if (box.children.length > 1) row.remove(); };
    select.onchange = () => { code.disabled = select.value === "original"; };
    select.onchange();
    box.append(row);
  };
  (saved.agents?.length ? saved.agents : [{}]).forEach(addRow);
  $("#b-add").onclick = () => addRow({ id: "kakobuy" });
  $("#b-sheet").value = saved.sheet || "";
  $("#b-title").value = saved.title || "";

  $("#b-form").onsubmit = async (e) => {
    e.preventDefault();
    const msg = $("#b-msg");
    const sheet = $("#b-sheet").value.trim();
    const agents = [...box.children].map((r) => ({ id: r.querySelector("select").value, code: r.querySelector("input").value.trim() }));
    const title = $("#b-title").value.trim();
    store.set("sheetshop:builder", { sheet, agents, title });
    msg.className = "msg"; msg.textContent = "Reading the sheet…";
    $("#b-go").disabled = true;
    $("#b-result").hidden = true;
    try {
      const info = await api("sheet", { sheet });
      const m = sheet.match(/\/d\/(?:e\/)?([A-Za-z0-9_-]{20,})/);
      const p = new URLSearchParams({ s: m ? m[1] : sheet });
      for (const a of agents) p.append("a", a.code ? `${a.id}:${a.code}` : a.id);
      if (title) p.set("t", title);
      const url = `${location.origin}/?${p}`;
      msg.textContent = `Found “${info.title}” with ${info.tabs.length} tab${info.tabs.length === 1 ? "" : "s"}.`;
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

// ---------------------------------------------------------------- shop

function shop() {
  $("#shop").hidden = false;
  const sheet = qs.get("s");
  const agents = qs.getAll("a")
    .map((v) => { const i = v.indexOf(":"); return i < 0 ? { id: v, code: "" } : { id: v.slice(0, i), code: v.slice(i + 1) }; })
    .filter((a) => agentById(a.id));
  if (!agents.length) agents.push({ id: "original", code: "" });

  const pickKey = `sheetshop:agent:${sheet}`;
  let agent = agents.find((a) => a.id === store.get(pickKey)) || agents[0];

  // tab state: gid -> { name, items, total, loaded (pages), pages, done, chip }
  const tabs = new Map();
  let active = null;      // gid
  let section = "";       // "" = whole tab
  let query = "";
  let list = [];          // what the grid is showing
  let shown = 0;
  const STEP = 60;

  // ---- agent picker & sign-up banner
  const sel = $("#agent-select");
  if (agents.length > 1) {
    for (const a of agents) sel.append(el("option", { value: a.id, textContent: agentById(a.id).name }));
    sel.value = agent.id;
    $("#agent-pick").hidden = false;
    sel.onchange = () => { agent = agents.find((a) => a.id === sel.value); store.set(pickKey, agent.id); paintAgent(); render(true); };
  }
  function paintAgent() {
    const a = agentById(agent.id);
    $("#foot-agent").textContent = a.name;
    const banner = $("#signup");
    if (a.signup && agent.code) {
      banner.href = a.signup(agent.code);
      banner.textContent = `New to ${a.name}? Sign up with code ${agent.code} →`;
      banner.hidden = false;
    } else banner.hidden = true;
  }
  paintAgent();

  // ---- loading
  const status = (t) => ($("#status").textContent = t);
  const skeleton = () => {
    $("#grid").replaceChildren(...Array.from({ length: 10 }, () => el("div", { className: "skel" })));
  };

  // Pages of one tab load one after another, never twice.
  function loadPage(gid) {
    const t = tabs.get(gid);
    t.chain = t.chain.catch(() => {}).then(async () => {
      if (t.done) return t;
      try {
        const r = await api("tab", { sheet, gid, page: t.loaded });
        t.items.push(...r.items);
        t.total = r.total;
        t.pages = r.pages;
        t.loaded++;
        t.done = t.loaded >= t.pages;
      } catch (e) {
        if (!t.loaded) { t.done = true; t.failed = e; }
        throw e;
      } finally {
        t.chip.querySelector(".n").textContent = t.total.toLocaleString();
        t.chip.hidden = t.done && t.total === 0;
      }
      return t;
    });
    return t.chain;
  }
  async function loadAll(gid) {
    const t = tabs.get(gid);
    while (!t.done) await loadPage(gid);
    return t;
  }

  function selectTab(gid) {
    active = gid;
    section = "";
    for (const [g, t] of tabs) t.chip.setAttribute("aria-pressed", String(g === gid));
    tabs.get(gid).chip.scrollIntoView({ block: "nearest", inline: "nearest" });
    const t = tabs.get(gid);
    if (t.items.length) render(true); else skeleton();
    loadPage(gid)
      .then(() => { if (active === gid) refresh(); return loadAll(gid); })
      .then(() => active === gid && refresh(), (e) => active === gid && showError(t.failed || e));
  }

  // New items arrived: keep what is on screen, add to the list behind it.
  // (A search starts over, since new matches can land anywhere in the list.)
  function refresh() {
    if (query || !$("#grid").querySelector(".card")) return render(true);
    list = current();
    paintSections();
    if (shown < STEP) render(false); else paintStatus();
  }

  function showError(err) {
    status("");
    $("#grid").replaceChildren(el("div", { className: "empty-state", textContent: err.message }));
  }

  // ---- filtering & drawing
  function current() {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    let items;
    if (words.length) {
      // a search looks through every tab loaded so far
      const seen = new Set();
      items = [];
      for (const t of tabs.values()) for (const p of t.items) {
        const k = `${p.platform}:${p.id}`;
        if (seen.has(k)) continue;
        const hay = `${p.name} ${p.section} ${t.name}`.toLowerCase();
        if (words.every((w) => hay.includes(w))) { seen.add(k); items.push(p); }
      }
    } else {
      items = tabs.get(active)?.items || [];
      if (section) items = items.filter((p) => p.section === section);
    }
    return items;
  }

  function paintSections() {
    const nav = $("#sections");
    const t = tabs.get(active);
    const counts = new Map();
    for (const p of t?.items || []) if (p.section) counts.set(p.section, (counts.get(p.section) || 0) + 1);
    if (query || counts.size < 2) { nav.hidden = true; return; }
    const mk = (name, label, n) => {
      const b = el("button", { className: "chip", type: "button" }, label, n != null ? el("span", { className: "n", textContent: n }) : null);
      b.setAttribute("aria-pressed", String(section === name));
      b.onclick = () => { section = name; paintSections(); render(true); };
      return b;
    };
    nav.replaceChildren(mk("", "All"), ...[...counts].map(([s, n]) => mk(s, s, n)));
    nav.hidden = false;
  }

  function card(p) {
    const href = buildLink(agent.id, p.platform, p.id, agent.code);
    const ph = p.img
      ? el("div", { className: "ph" }, el("img", { src: p.img, alt: "", loading: "lazy", decoding: "async", referrerPolicy: "no-referrer" }))
      : el("div", { className: "ph empty", textContent: "No photo" });
    const a = el("a", { className: "card", href, target: "_blank", rel: "noopener sponsored nofollow" },
      ph,
      el("div", { className: "body" },
        el("div", { className: "name", textContent: p.name }),
        p.price ? el("div", { className: "price", textContent: p.price }) : null,
        el("div", { className: "meta", textContent: p.section && !query ? p.section : p.platform }),
      ),
    );
    if (p.gallery.length) {
      const b = el("button", { className: "qc", type: "button", textContent: `📷 ${p.gallery.length + 1}`, title: "See photos" });
      b.onclick = (e) => { e.preventDefault(); openGallery([p.img, ...p.gallery]); };
      a.append(b);
    }
    return a;
  }

  function paintStatus() {
    const t = tabs.get(active);
    const loading = query ? [...tabs.values()].some((x) => !x.done) : t && !t.done;
    status(`${list.length.toLocaleString()} product${list.length === 1 ? "" : "s"}${loading ? " · still loading…" : ""}${query ? " across all tabs" : ""}`);
  }

  function render(reset) {
    const grid = $("#grid");
    if (reset) { list = current(); shown = 0; grid.replaceChildren(); paintSections(); }
    const t = tabs.get(active);
    const loading = query ? [...tabs.values()].some((x) => !x.done) : t && !t.done;
    if (!list.length) {
      if (!loading) grid.replaceChildren(el("div", { className: "empty-state", textContent: query ? "Nothing matches that search." : "No products in this tab." }));
      status(loading ? "Loading…" : "");
      return;
    }
    const next = list.slice(shown, shown + STEP);
    grid.append(...next.map(card));
    shown += next.length;
    paintStatus();
  }

  new IntersectionObserver((e) => {
    if (e[0].isIntersecting && shown < list.length) render(false);
  }, { rootMargin: "800px" }).observe($("#more"));

  let timer;
  $("#q").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      query = e.target.value.trim();
      if (query) for (const g of tabs.keys()) loadAll(g).then(() => query && refresh()).catch(() => {});
      render(true);
    }, 180);
  });

  function openGallery(imgs) {
    $("#gallery-imgs").replaceChildren(...imgs.map((src) => el("img", { src, alt: "", loading: "lazy", referrerPolicy: "no-referrer" })));
    $("#gallery").showModal();
  }
  $("#gallery").addEventListener("click", (e) => { if (e.target.id === "gallery") e.target.close(); });

  // ---- start
  skeleton();
  status("Reading the sheet…");
  api("sheet", { sheet }).then(async (info) => {
    const title = qs.get("t") || info.title;
    document.title = title;
    $("#title").textContent = title;
    $("#title").href = location.pathname + location.search;

    const nav = $("#tabs");
    for (const tab of info.tabs) {
      const chip = el("button", { className: "chip", type: "button" }, tab.name || "Tab", el("span", { className: "n", textContent: "…" }));
      chip.onclick = () => selectTab(tab.gid);
      nav.append(chip);
      tabs.set(tab.gid, { name: tab.name, items: [], total: 0, loaded: 0, pages: 1, done: false, chip, chain: Promise.resolve() });
    }

    // First pages of every tab load two at a time, in order, to fill in the
    // counts; the first tab (in sheet order) with products opens.
    const gids = [...tabs.keys()];
    const openFirst = () => {
      for (const g of gids) {
        const t = tabs.get(g);
        if (!t.loaded && !t.done) return; // not known yet
        if (t.total > 0) return selectTab(g);
      }
    };
    let next = 0;
    const worker = async () => {
      while (next < gids.length) {
        const g = gids[next++];
        await loadPage(g).catch(() => {});
        if (active == null) openFirst();
        else if (query) refresh();
      }
    };
    await Promise.all([worker(), worker()]);
    if (active == null) {
      const failed = [...tabs.values()].find((t) => t.failed);
      showError(failed ? failed.failed : new Error("No product links found in this sheet."));
    }
  }).catch(showError);
}
