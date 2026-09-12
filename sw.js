const CACHE="flappy-retro-v10";
const FILES=["./","./index.html","./game.js","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(v=>v!==CACHE).map(v=>caches.delete(v)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(fetch(e.request).then(r=>{const q=r.clone();caches.open(CACHE).then(c=>c.put(e.request,q)).catch(()=>{});return r}).catch(()=>caches.match(e.request))));
