const CACHE_NAME = 'quran-app-v4';
const AUDIO_CACHE_NAME = 'quran-audio-v1';

const CORE_ASSETS = [
    './',
    './index.html',
    './others/style.css',
    './js/app.js',
    './js/reciters.js',
    './js/duas.js',
    './js/ai-service.js',
    './others/manifest.json',
    './images/icon-192x192.png',
    './images/icon-512x512.jpg',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching core assets');
            return cache.addAll(CORE_ASSETS).catch(err => {
                console.warn('[SW] Pre-cache warning (some files might be missing):', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // 1. Audio Files: Cache-First
    if (url.pathname.endsWith('.mp3') || url.hostname.includes('server.mp3quran.net')) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200 || networkResponse.status === 206) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(AUDIO_CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 2. API requests to Alquran.cloud: Network First with Cache Fallback
    if (url.hostname === 'api.alquran.cloud') {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse.ok) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 3. Static Assets & Others: Cache-First with Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse.ok) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                }
                return networkResponse;
            }).catch(() => {
                // If network fails, we rely on cache
            });

            return cachedResponse || fetchPromise;
        })
    );
});
