const CACHE_NAME = 'quran-app-v3'; // زود الرقم ده عشان تحدث الملفات عند اليوزر
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

    // 1. ملفات الصوت: لو موجودة في الكاش شغلها، لو لأ حملها عشان تشتغل أوفلاين
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

    // 2. الصفحة الرئيسية: جرب النت الأول عشان التحديثات، لو مفيش هات من الكاش
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
                .catch(() => caches.match(event.request)) // لو النت ميت، وريه اللي متسيف عندنا
        );
        return;
    }

    // 3. أي حاجة تانية: هاتها من الكاش بسرعة وبص على تحديث ورا في الدرا
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



