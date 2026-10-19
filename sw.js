/* Estúdio Rick Digital — Service Worker (funciona em qualquer domínio) */
const CACHE = 'rick-digital-v10-backbtn';
const CORE = [
  './',
  './index.html',
  './sobre.html',
  './projetos.html',
  './tecnologias.html',
  './termos.html',
  './midia.html',
  './orcamento.html',
  './tecnologia-html.html',
  './tecnologia-css.html',
  './tecnologia-javascript.html',
  './tecnologia-react.html',
  './tecnologia-git.html',
  './tecnologia-github.html',
  './tecnologia-vscode.html',
  './tecnologia-vercel.html',
  './css/style.css',
  './css/viewer.css',
  './js/main.js',
  './js/site-viewer.js',
  './techverse/index.html',
  './konstruct/index.html',
  './manifest.webmanifest',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/maskable-512.png',
  './img/logo-rd.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  // Navegação: network-first com fallback offline
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }).catch(() => caches.match(request).then((m) => m || caches.match('./index.html')))
    );
    return;
  }
  // Assets: cache-first
  e.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request).then((res) => {
        if (res.ok && new URL(request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      });
    })
  );
});
