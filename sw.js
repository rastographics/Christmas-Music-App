// Service Worker for Christmas Radio PWA
const CACHE_NAME = 'christmas-radio-v1';

self.addEventListener('install', event => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/styles.css',
                    '/script.js',
                    '/manifest.json',
                    '/images/logo.png',
                    '/images/icon-192.png',
                    '/images/icon-512.png',
                    '/images/background.png'
                ]);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activate event');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
            .catch(() => {
                // Offline fallback - could return a custom offline page
                // For now, just fail silently
            })
    );
});
