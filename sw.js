/* 剧情编辑器 PWA Service Worker
   策略：网络优先 + 失联网兜底缓存（始终尽量拿最新版，断网时可用）。
   /api/db（局域网同步端点）绝不缓存。
   注意：Service Worker 只在安全上下文（https 或 localhost）注册；
   iPad 通过局域网 http 地址访问时本文件不会生效——加到主屏仍可全屏（apple meta），
   但没有离线缓存。要拿到完整 PWA 能力需 https（如 Tailscale Serve / 反向代理）。 */
const CACHE = 'plotoc-web-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
                './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.endsWith('/api/db')) return; // 同步端点直连
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
      return r;
    }).catch(() =>
      caches.match(e.request).then(m => m || caches.match('./index.html'))
    )
  );
});
