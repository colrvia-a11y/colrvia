import makeServiceWorkerEnv from 'service-worker-mock';
import { handleNavigation } from '@/sw/strategies';
import { VERSION } from '@/sw/version';

describe('service worker navigation', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
  });

  it('caches reveal pages for offline use', async () => {
    const req = new Request('/reveal/test', { mode: 'navigate' });
    // first call: network success and caching
    global.fetch = vi.fn().mockResolvedValueOnce(new Response('online'));
    await handleNavigation(req);
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req);
    expect(cached).toBeTruthy();
    // second call: network fails, should serve cached
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('fail'));
    const res = await handleNavigation(req);
    expect(await res.text()).toBe('online');
  });

  it('falls back to /offline when reveal not cached', async () => {
    const req = new Request('/reveal/unknown', { mode: 'navigate' });
    const cache = await caches.open(VERSION);
    await cache.put('/offline', new Response('offline'));
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('fail'));
    const res = await handleNavigation(req);
    expect(await res.text()).toBe('offline');
  });
});
