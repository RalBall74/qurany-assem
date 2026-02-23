const CACHE_NAME = 'quran-app-v3'; // Bump this number whenever you want to force the browser to update its local files
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
    './images/icon-512x512.jpg'
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Pre-cache core files so the app works offline from the first install
            return cache.addAll(CORE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    // 1. Audio Files: Use the cached copy if we have it, otherwise download it.
    if (url.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.open(AUDIO_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request);
                });
            })
        );
        return;
    }

    // 2. API requests to Alquran.cloud: Network first, cache fallback
    if (url.hostname === 'api.alquran.cloud') {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 3. Core App Files & Anything else: Cache first, network fallback (with Stale-While-Revalidate)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                // Update cache in the background but return cached immediately
                fetch(event.request).then(networkResponse => {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                }).catch(() => { });
                return cachedResponse;
            }
            // If not in cache, fetch and put in cache
            return fetch(event.request).then(networkResponse => {
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clonedResponse);
                });
                return networkResponse;
            }).catch(error => {
                console.error('Fetch failed or offline:', error);
            });
        })
    );
});
