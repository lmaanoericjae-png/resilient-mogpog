const CACHE = 'resilientmogpog-v3';
const ASSETS = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'js/dom.js', 'js/store.js',
  'js/logic.js', 'js/directory.js', 'js/advisory.js', 'js/hub.js', 'js/plan.js', 'js/i18n.js', 'data/fil.json',
  'assets/logo.png', 'assets/favicon-32.png', 'data/config.json', 'data/evacuation-centers.json', 'data/advisory-rules.json',
  'data/hotlines.json', 'data/checklist.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request)));
});
