export const runtime = 'nodejs'

export async function POST(req: Request) {
  // IMPORTANT: Use the EPHEMERAL client secret from the browser, not the server key.
  const clientAuth = req.headers.get('authorization') || ''
  if (!clientAuth) {
    console.error('[realtime][offer] missing client Authorization header')
    return new Response('Missing client Authorization', { status: 400 })
  }

  const sdp = await req.text().catch(() => '')
  if (!sdp) return new Response('Empty SDP', { status: 400 })

  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17'
  const url = `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/sdp',
        authorization: clientAuth,           // Bearer <ephemeral token>
        'OpenAI-Beta': 'realtime=v1',        // required
      },
      body: sdp,
    })

    const txt = await upstream.text()
    if (!upstream.ok) {
      let message = txt
      try { message = JSON.stringify(JSON.parse(txt), null, 2) } catch {}
      console.error('[realtime][offer] upstream', upstream.status, (message || '').slice(0, 500))
      return new Response(txt || 'Offer failed', { status: upstream.status })
    }

    return new Response(txt, { status: 200, headers: { 'content-type': 'application/sdp' } })
  } catch (e: any) {
    console.error('[realtime][offer] network error', e?.message || e)
    return new Response('Upstream network error', { status: 502 })
  }
}

