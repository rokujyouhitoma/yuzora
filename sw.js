/**
 * Service Worker for Yuzora PWA Offline Support
 */
"use strict";

const CACHE_NAME = 'yuzora-cache-vec8d75e';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './compiled.html',
    './manifest.json',
    './main-min.js',
    './src/css/style.css',
    './src/css/modules/reset.css',
    './src/css/modules/base.css',
    './src/css/modules/welcome.css',
    './src/css/modules/reader.css',
    './src/css/modules/drawers.css',
    './src/css/modules/debug.css',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/maskable-icon.png',
    './src/books/42939_yoko.txt',
    './src/books/52395_yoko.txt',
    './src/books/52396_yoko.txt',
    './src/books/52397_yoko.txt',
    './src/books/52398_yoko.txt',
    './src/books/52399_yoko.txt',
    './src/books/52400_yoko.txt',
    './src/books/52401_yoko.txt',
    './src/books/52402_yoko.txt',
    './src/books/773_yoko.txt'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })))
                    .catch(err => {
                        console.warn('Precache partial failure:', err);
                        return Promise.allSettled(
                            PRECACHE_ASSETS.map(url => cache.add(new Request(url, { cache: 'reload' })))
                        );
                    });
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name.startsWith('yuzora-cache-') && name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) {
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                fetch(request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache));
                    }
                }).catch(() => {});

                return cachedResponse;
            }

            return fetch(request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html') || caches.match('./compiled.html');
                }
            });
        })
    );
});
