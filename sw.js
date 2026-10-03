/* =========================================================
   SERVICE WORKER - FK Sloboda aplikacija

   Potreban je da bi telefon dozvolio instalaciju sajta kao
   aplikacije. Namjerno NE čuva (kešira) podatke o utakmicama,
   tabeli i vijestima - oni se uvijek povlače svježi sa GitHub-a,
   da bi rezultati i meč uživo bili tačni. Čuva se samo početna
   stranica, da bi se aplikacija otvorila i bez interneta (tada
   sa porukom da nema konekcije umjesto praznog ekrana).

   Kad promijeniš ovaj fajl, povećaj broj u CACHE_NAME.
========================================================= */

const CACHE_NAME = 'fk-sloboda-v1';

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

    // Samo otvaranje stranice: prvo internet (uvijek najnovija verzija),
    // a ako nema interneta - sačuvana kopija.
    if(req.mode === 'navigate'){
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

    // Sve ostalo (slike, GitHub podaci, admin...) ide normalno preko interneta.
});
