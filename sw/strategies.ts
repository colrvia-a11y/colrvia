/// <reference lib="webworker" />
import { VERSION } from './version';
import { isReveal } from './utils';

export async function handleNavigation(req: Request): Promise<Response> {
  const cache = await caches.open(VERSION);
  try {
    const net = await fetch(req);
    if (isReveal(req)) cache.put(req, net.clone());
    return net;
  } catch (e) {
    if (isReveal(req)) {
      const cached = await cache.match(req);
      if (cached) return cached;
    }
    const offline = await cache.match('/offline');
    return offline || Response.error();
  }
}

export function handleStatic(req: Request): Promise<Response> {
  return caches.match(req).then(
    (cached) =>
      cached ||
      fetch(req).then((res) => {
        caches.open(VERSION).then((c) => c.put(req, res.clone()));
        return res;
      })
  );
}

export async function handleStoryOrPalette(
  req: Request,
  event: FetchEvent
): Promise<Response> {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(fetchPromise);
    return cached;
  }
  return fetchPromise;
}
