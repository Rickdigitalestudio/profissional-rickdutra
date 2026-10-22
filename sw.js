/* Estúdio Rick Digital — Service Worker (funciona em qualquer domínio) */
const CACHE = 'rick-digital-v13-cases';
const CORE = [
  './',
  './index.html',
  './sobre.html',
  './projetos.html',
  './cases.html',
  './case-barbearia-gui-leiros.html',
  './case-ad-santos-a-pioneira.html',
  './case-konstruct-store.html',
  './tecnologias.html',
  './termos.html',
  './privacidade.html',
  './midia.html',
  './orcamento.html',
  './servicos-adicionais.html',
  './criacao-de-sites-profissionais.html',
  './fanpage-que-vende.html',
  './landing-page-que-converte.html',
  './loja-virtual-completa.html',
  './site-para-pequenas-empresas.html',
  './criacao-de-logo-profissional.html',
  './otimizacao-de-perfil-linkedin.html',
  './trabalho-academico-abnt.html',
  './tecnologia-html.html',
  './tecnologia-css.html',
  './tecnologia-javascript.html',
  './tecnologia-react.html',
  './tecnologia-git.html',
  './tecnologia-github.html',
  './tecnologia-vscode.html',
  './tecnologia-vercel.html',
  './404.html',
  './css/style.css',
  './css/cases.css',
  './css/viewer.css',
  './js/main.js',
  './js/analytics.js',
  './js/site-viewer.js',
  './techverse/index.html',
  './konstruct/index.html',
  './manifest.webmanifest',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/maskable-512.png',
  './img/logo-rd.svg',
  './img/foto-henrique.jpg'
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
  // Assets: stale-while-revalidate — entrega do cache na hora e atualiza em
  // segundo plano. (cache-first puro servia JS/CSS velhos para sempre)
  e.respondWith(
    caches.match(request).then((hit) => {
      const rede = fetch(request).then((res) => {
        if (res.ok && new URL(request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || rede;
    })
  );
});
