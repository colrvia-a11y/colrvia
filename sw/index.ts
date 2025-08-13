/// <reference lib="webworker" />
import { VERSION, precacheCore } from './version';
import { isStatic, isStory, isPaletteImg, broadcastStatus } from './utils';
import { handleNavigation, handleStatic, handleStoryOrPalette } from './strategies';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  event.waitUntil(precacheCore().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(handleNavigation(req));
    return;
  }
  if (isStatic(req)) {
    event.respondWith(handleStatic(req));
    return;
  }
  if (isStory(req) || isPaletteImg(req)) {
    event.respondWith(handleStoryOrPalette(req, event));
  }
});

self.addEventListener('online', () => broadcastStatus('online'));
self.addEventListener('offline', () => broadcastStatus('offline'));
