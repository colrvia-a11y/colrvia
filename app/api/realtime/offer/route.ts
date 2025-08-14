export const runtime = 'nodejs'
import { REALTIME_MODEL } from '@/lib/ai/config'

export async function POST(req: Request) {
  // Use the EPHEMERAL client secret from the browser, not the long-lived server key.
  const clientAuth = req.headers.get('authorization') || ''
  if (!clientAuth) {
    console.error('[realtime][offer] missing client Authorization header')
    return new Response('Missing client Authorization', { status: 400 })
  }

  const sdp = await req.text().catch(() => '')
  if (!sdp) return new Response('Empty SDP', { status: 400 })

  const url = `https://api.openai.com/v1/realtime?model=${encodeURIComponent(REALTIME_MODEL)}`
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/sdp',
        // Forward the ephemeral client_secret from /api/realtime/session:
        authorization: clientAuth,
        // Required by the Realtime API:
        'OpenAI-Beta': 'realtime=v1',
      },
      body: sdp,
    })
    const txt = await upstream.text()
    if (!upstream.ok) {
      console.error('[realtime][offer] upstream', upstream.status, txt.slice(0, 200))
      return new Response(txt || 'Offer failed', { status: upstream.status })
    }
    // Return the answer SDP back to the browser
    return new Response(txt, { status: 200, headers: { 'content-type': 'application/sdp' } })
  } catch (e: any) {
    console.error('[realtime][offer] network error', e?.message || e)
    return new Response('Upstream network error', { status: 502 })
  }
}
