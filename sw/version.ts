/// <reference lib="webworker" />
export const VERSION = 'v2';
export const CORE_URLS = ['/', '/offline'];

export async function precacheCore() {
  const cache = await caches.open(VERSION);
  await cache.addAll(CORE_URLS);
}
