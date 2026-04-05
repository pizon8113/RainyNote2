/**
 * Rainy Note — Service Worker
 * - 오프라인 지원 (Cache-First 전략)
 * - 핵심 에셋 사전 캐싱
 * - CDN 리소스 네트워크 우선 캐싱
 */

const CACHE_NAME = 'rainy-note-v4';
const CDN_CACHE  = 'rainy-note-cdn-v4';

// 앱 셸: 반드시 캐싱할 파일
const APP_SHELL = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/icons/icon.svg',
  // PNG 아이콘은 generate-icons.html 로 생성 후 주석 해제하세요:
  // '/icons/icon-192.png',
  // '/icons/icon-512.png',
];

// CDN 도메인 (네트워크 우선)
const CDN_ORIGINS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// ── Install: 앱 셸 사전 캐싱 ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL.filter(u => u !== '/icons/icon-192.png' && u !== '/icons/icon-512.png')))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: 구버전 캐시 삭제 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CDN_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: 요청 가로채기 ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // GET 요청만 캐싱
  if (request.method !== 'GET') return;

  // CDN 요청 → Network-First (실패 시 캐시)
  if (CDN_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(networkFirst(request, CDN_CACHE));
    return;
  }

  // 앱 파일 → Cache-First (캐시 없으면 네트워크)
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// Cache-First 전략
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // 오프라인 + 캐시 없음: index.html 반환
    const fallback = await caches.match('/index.html');
    return fallback || new Response('오프라인 상태입니다.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// Network-First 전략
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}
