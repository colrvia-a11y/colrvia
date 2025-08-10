// Simple in-memory sliding window rate limiter.
// NOTE: Works per runtime instance; in serverless multi-instance it is best-effort only.
// Lightweight protection for abuse of generation endpoints.

type Key = string
interface Entry { ts: number }

class SlidingWindowLimiter {
  private store = new Map<Key, Entry[]>()
  constructor(private max: number, private windowMs: number) {}
  take(key: Key): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const cutoff = now - this.windowMs
    const arr = (this.store.get(key) || []).filter(e => e.ts >= cutoff)
    if (arr.length >= this.max) {
      this.store.set(key, arr) // prune
      return { allowed: false, remaining: 0 }
    }
    arr.push({ ts: now })
    this.store.set(key, arr)
    return { allowed: true, remaining: Math.max(0, this.max - arr.length) }
  }
}

// Singleton instances (tuned values)
// Per-user variant generation: 6 per minute (~1 every 10s) and 40 per hour.
const perMinute = new SlidingWindowLimiter(6, 60_000)
const perHour = new SlidingWindowLimiter(40, 60 * 60_000)

export function limitVariant(userId: string) {
  const a = perMinute.take('m:' + userId)
  const b = perHour.take('h:' + userId)
  if (!a.allowed) return { ok: false, scope: 'minute' as const, retryAfter: 15 }
  if (!b.allowed) return { ok: false, scope: 'hour' as const, retryAfter: 300 }
  return { ok: true as const }
}

// (placeholder for test reset if needed)
export function __test__clear() {}
