const CACHE_NAME = 'fk-sloboda-v2';

self.addEventListener('install', event=>{
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(['./', './index.html']))
            .catch(()=>{})
    );
    self.skipWaiting();
});

self.addEventListener('activate', event=>{
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event=>{
    const req = event.request;
    // Samo stranica za navijače se čuva za rad bez interneta (ne admin)
    if(req.mode === 'navigate' && !req.url.includes('tajni_admin')){
        event.respondWith(
            fetch(req)
                .then(res=>{
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put('./index.html', copy)).catch(()=>{});
                    return res;
                })
                .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
        );
    }
});