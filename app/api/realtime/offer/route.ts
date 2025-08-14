export const runtime = 'nodejs'

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response('OPENAI_API_KEY missing', { status: 500 })
  }
  const sdp = await req.text().catch(() => '')
  if (!sdp) return new Response('Empty SDP', { status: 400 })
  const r = await fetch('https://api.openai.com/v1/realtime/offer', {
    method: 'POST',
    headers: { 'content-type': 'application/sdp', authorization: `Bearer ${apiKey}` },
    body: sdp,
  })
  const txt = await r.text()
  if (!r.ok) return new Response(txt || 'Offer failed', { status: r.status })
  return new Response(txt, { status: 200, headers: { 'content-type': 'application/sdp' } })
}
