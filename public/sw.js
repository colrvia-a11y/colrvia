const VERSION='v2';
const CORE_URLS=['/','/offline'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE_URLS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

function isStatic(req){return req.url.includes('/_next/static/')||req.url.includes('/icons/')}
function isReveal(req){return req.url.includes('/reveal/')}
function isStory(req){return req.url.includes('/api/stories/')}
function isPaletteImg(req){return req.url.includes('/api/share/')&&req.destination==='image'}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(VERSION);
      try{
        const net=await fetch(req);
        if(isReveal(req)) cache.put(req,net.clone());
        return net;
      }catch(e){
        if(isReveal(req)){
          const cached=await cache.match(req);
          if(cached) return cached;
        }
        const offline=await cache.match('/offline');
        return offline||Response.error();
      }
    })());
    return;
  }
  if(isStatic(req)){
    event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{caches.open(VERSION).then(c=>c.put(req,res.clone()));return res;})));
    return;
  }
  if(isStory(req)||isPaletteImg(req)){
    event.respondWith((async()=>{
      const cache=await caches.open(VERSION);
      const cached=await cache.match(req);
      const fetchPromise=fetch(req).then(res=>{cache.put(req,res.clone());return res;}).catch(()=>cached);
      if(cached){event.waitUntil(fetchPromise);return cached;}
      return fetchPromise;
    })());
  }
});

function broadcastStatus(status){
  self.clients.matchAll().then(clients=>clients.forEach(c=>c.postMessage(status)))
}
self.addEventListener('online',()=>broadcastStatus('online'));
self.addEventListener('offline',()=>broadcastStatus('offline'));
