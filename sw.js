/* Service worker: lưu sẵn app để mở được khi không có mạng. App không gửi dữ liệu người bệnh đi đâu. */
const CACHE = 'stg-202610101516';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  if (isPage) {  /* trang chính: lấy bản mới khi có mạng; mất mạng hoặc máy chủ báo lỗi thì dùng bản đã lưu (không ghi đè bản đã lưu bằng trang lỗi) */
    e.respondWith(fetch(e.request).then(r => { if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); return r; } return caches.match('index.html').then(h => h || r); }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })));
});
