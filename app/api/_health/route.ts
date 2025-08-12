import { withSentry } from '@/lib/monitoring/sentry'

async function handler() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
}

export const GET = withSentry(handler)
