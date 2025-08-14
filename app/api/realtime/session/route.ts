export const runtime = 'nodejs'

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17'
  if (!apiKey) {
    console.error('[realtime][session] missing OPENAI_API_KEY')
    return new Response('OPENAI_API_KEY missing', { status: 500 })
  }

  try {
    // Create an EPHEMERAL client secret for WebRTC:
    // POST https://api.openai.com/v1/realtime/sessions
    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'OpenAI-Beta': 'realtime=v1',
      },
      body: JSON.stringify({
        model,
        // optional but recommended — choose a voice the model can speak with
        voice: 'verse',
        // you can include instructions/system here too, if desired
        // instructions: 'You are the Colrvia intake assistant…'
      }),
    })

    const txt = await r.text()
    if (!r.ok) {
      console.error('[realtime][session] upstream', r.status, txt.slice(0, 300))
      return new Response(txt || 'Session init failed', { status: r.status })
    }

    const json = JSON.parse(txt)
    const clientSecret = json?.client_secret?.value
    if (!clientSecret) {
      console.error('[realtime][session] no client_secret in upstream response')
      return new Response('Upstream response missing client_secret', { status: 502 })
    }
    return Response.json({ client_secret: { value: clientSecret } })
  } catch (e: any) {
    console.error('[realtime][session] error', e?.message || e)
    return new Response('Session init error', { status: 502 })
  }
}

