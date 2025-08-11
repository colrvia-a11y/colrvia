const HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com'
const KEY = process.env.POSTHOG_KEY // server key (may reuse public key)

type Props = Record<string, any>

export async function capture(event: string, props?: Props, distinctId: string = 'server') {
  if (!KEY) return
  // Defensive clone to strip functions / symbols
  let safe: any
  try { safe = JSON.parse(JSON.stringify(props ?? {})) } catch { safe = {} }
  const body = {
    api_key: KEY,
    event,
    properties: { ...safe, $lib: 'colrvia-server' },
    distinct_id: distinctId,
  }
  try {
    await fetch(`${HOST.replace(/\/+$/,'')}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // keepalive helps on edge; ignored elsewhere
      keepalive: true as any,
    })
  } catch {
    // swallow – never fail production flow due to telemetry
  }
}

export function enabled() { return Boolean(KEY) }
