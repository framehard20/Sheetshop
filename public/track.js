// Click counting with Umami (no cookies, nothing that identifies a visitor).
// Off until SHEETSHOP_UMAMI_ID is set on the server, and never on localhost.
// Events sent before Umami's script has loaded wait in a short queue.

const queue = [];
let ready = false;

export function startTracking(websiteId) {
  if (!/^[0-9a-f-]{36}$/i.test(websiteId || "")) return;
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname) || location.hostname.endsWith(".localhost")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://cloud.umami.is/script.js";
  s.dataset.websiteId = websiteId;
  // shop links are long signed codes; keep them out of the page list
  s.dataset.excludeSearch = "true";
  s.dataset.excludeHash = "true";
  s.onload = () => {
    ready = true;
    for (const [event, data] of queue.splice(0)) send(event, data);
  };
  document.head.append(s);
}

function send(event, data) {
  try { window.umami?.track(event, data); } catch {}
}

export function track(event, data) {
  if (ready && window.umami) send(event, data);
  else if (queue.length < 50) queue.push([event, data]);
}
