export const runtime = 'nodejs'

export async function POST(req: Request) {
  // IMPORTANT: Use the EPHEMERAL client secret from the browser, not the server key.
  const clientAuth = req.headers.get('authorization') || ''
  if (!clientAuth) {
    console.error('[realtime][offer] missing client Authorization header')
    return new Response('Missing client Authorization', { status: 400 })
  }
  // sanity-check format
  if (!/^Bearer\s+[\w\-\._~+/]+=*$/i.test(clientAuth)) {
    console.error('[realtime][offer] malformed Authorization header (expected "Bearer <token>")')
    return new Response('Malformed Authorization header', { status: 400 })
  }

  const sdp = await req.text().catch(() => '')
  if (!sdp) return new Response('Empty SDP', { status: 400 })
  console.log('[realtime][offer] incoming SDP length=', sdp.length)

  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17'
  // add voice in query too (belt & suspenders)
  const url = `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}&voice=verse`

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/sdp',
        'accept': 'application/sdp',
        authorization: clientAuth,            // Bearer <ephemeral>
        'OpenAI-Beta': 'realtime=v1',        // required
      },
      body: sdp,
    })

    const txt = await upstream.text()
    if (!upstream.ok) {
      // Try to parse upstream JSON; otherwise return raw text
      let parsed: any = null
      try { parsed = JSON.parse(txt) } catch {}
      const brief = parsed ? JSON.stringify(parsed).slice(0,500) : (txt || '').slice(0,500)
      console.error('[realtime][offer] upstream', upstream.status, brief)
      // Enrich the response so the UI shows meaningful info
      const details = {
        status: upstream.status,
        url,
        headers: {
          authorization: `Bearer ***${(clientAuth.split(' ')[1]||'').slice(-6)}`,
          beta: 'realtime=v1'
        },
        sdpLen: sdp.length,
        upstream: parsed || txt
      }
      return new Response(JSON.stringify({ error: details }), {
        status: upstream.status,
        headers: { 'content-type': 'application/json' }
      })
    }

    return new Response(txt, { status: 200, headers: { 'content-type': 'application/sdp' } })
  } catch (e: any) {
    console.error('[realtime][offer] network error', e?.message || e)
    return new Response('Upstream network error', { status: 502 })
  }
}

