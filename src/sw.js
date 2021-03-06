var cacheName = 'memcoder';
var filesToCache = [
  '/',
  '/css/normalize.css?1',
  '/css/main.css?1',
  '/index.html',
  '/words.csv',
  '/js/main.js?1',
  '/js/jquery-3.2.1.min.js',
  '/js/alasql.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});
