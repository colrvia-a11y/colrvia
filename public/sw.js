const VERSION='v1';
const CORE_URLS=['/','/offline'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE_URLS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

function isStatic(req){return req.url.includes('/_next/static/')|| req.url.includes('/icons/')} 
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{try{const net=await fetch(req); const cache=await caches.open(VERSION); cache.put(req,net.clone()); return net;}catch(e){const cache=await caches.open(VERSION); const offline=await cache.match('/offline'); return offline || Response.error();}})());
    return;
  }
  if(isStatic(req)){
    event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone(); caches.open(VERSION).then(c=>c.put(req,copy)); return res;})));
  }
});
