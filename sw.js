const CACHE_NAME = 'quran-app-v3'; // Bump this number whenever you want to force the browser to update its local files
const AUDIO_CACHE_NAME = 'quran-audio-v1';

self.addEventListener("install", event => {
    self.skipWaiting();
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

    // 1. Audio Files: Use the cached copy if we have it, otherwise download it. Good for offline listening.
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

    // 2. The Main Page: Always check the internet first so we get the latest updates immediately.
    // If there's no internet, then we fall back to the cached version.
    if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/') {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    return networkResponse;
                })
                .catch(() => caches.match(event.request)) // If the internet is down, show what we have in the cache
        );
        return;
    }

    // 3. Everything Else: Show the cached version immediately, but also check for updates in the background.
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});


