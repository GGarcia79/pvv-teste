// Guarda a casca do app para abrir rápido e funcionar com internet fraca.
// Sempre busca a versão mais nova na rede (sem cache do navegador); usa a cópia guardada só se estiver sem internet.
const CACHE = "app-v2";
const CASCA = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon-192.png", "./logo.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCA.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const casca = e.request.mode === "navigate" || /\/(index\.html|config\.js|sw\.js)?$/.test(u.pathname);
  const req = casca ? new Request(e.request, {cache: "no-store"}) : e.request;
  e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
