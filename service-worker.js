const CACHE = 'tjbank-pwa-v1.0.26';
const CORE = [
  './',
  './index.html',
  './mine.html',
  './fail.html',
  './style.css',
  './mine.css',
  './script.js',
  './manifest.json',
  './favicon.ico',
  './ico.png',
  './assets/banners/back_login.png',
  './assets/banners/goot.png',
  './assets/banners/mid.svg',
  './assets/banners/wealth_bg.png',
  './assets/bg/top_promo_bg.svg',
  './assets/bg/gold_logo.svg',
  './assets/bg/mine_reco.svg',
  './assets/bg/mine_debt.svg',
  './assets/icons/search.svg',
  './assets/icons/search_dark.svg',
  './assets/icons/car.svg',
  './assets/icons/car_dark.svg',
  './assets/icons/mic.svg',
  './assets/icons/plus.svg',
  './assets/icons/plus_dark.svg',
  './assets/icons/eye_open.svg',
  './assets/icons/eye_closed.svg',
  './assets/icons/entry_hot.svg',
  './assets/icons/entry_points.svg',
  './assets/icons/entry_finance.svg',
  './assets/icons/entry_deposit.svg',
  './assets/icons/entry_favorite.svg',
  './assets/icons/reco_phone.svg',
  './assets/icons/nav_home.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((hit) => {
      const fetcher = fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const cloned = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, cloned));
          return res;
        })
        .catch(() => hit || caches.match('./fail.html'));
      return hit || fetcher;
    })
  );
});


