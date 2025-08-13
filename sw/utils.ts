/// <reference lib="webworker" />
export const isStatic = (req: Request) =>
  req.url.includes('/_next/static/') || req.url.includes('/icons/');

export const isReveal = (req: Request) => req.url.includes('/reveal/');

export const isStory = (req: Request) => req.url.includes('/api/stories/');

export const isPaletteImg = (req: Request) =>
  req.url.includes('/api/share/') && req.destination === 'image';

export function broadcastStatus(status: string) {
  (self as any).clients
    .matchAll()
    .then((clients: any[]) => clients.forEach((c: any) => c.postMessage(status)));
}
