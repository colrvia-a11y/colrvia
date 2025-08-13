// Supabase Edge Function: render-worker
// Simulates processing a render job and updates the jobs table.
// Replace the simulated delay + mock result with real provider integration.
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

interface Payload { jobId: string; userId: string }

serve(async (req: Request) => {
  try {
    const { jobId, userId } = (await req.json()) as Payload
    const url = Deno.env.get('SUPABASE_URL')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const headers = { 'apikey': service, 'Authorization': `Bearer ${service}`, 'Content-Type': 'application/json' }

    // Mark processing
    await fetch(`${url}/rest/v1/jobs?id=eq.${jobId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'processing' }) })

    // Simulate primary AI render latency
    await new Promise(r => setTimeout(r, 1200))

    // Create story (mock palette + narrative)
    const mockPalette = [
      { brand: 'sherwin_williams', name: 'Calm White', hex: '#F5F5F2', role: 'walls' },
      { brand: 'sherwin_williams', name: 'Soft Clay', hex: '#D8C0AE', role: 'trim' },
      { brand: 'sherwin_williams', name: 'Muted Moss', hex: '#9A9F83', role: 'accent' },
      { brand: 'sherwin_williams', name: 'Deep Oak', hex: '#4B3A2F', role: 'accent2' },
      { brand: 'sherwin_williams', name: 'Night Ink', hex: '#1B1F29', role: 'accent3' }
    ]
    const narrative = 'A grounded, softly textured palette balancing airy neutrals with rooted organic depth.'

    // Insert story
    const storyRes = await fetch(`${url}/rest/v1/stories`, { method: 'POST', headers, body: JSON.stringify({ user_id: userId, brand: 'sherwin_williams', vibe: 'Cozy Neutral', palette: mockPalette, narrative, source: 'job' }) })
    const storyData = await storyRes.json()
    const storyId = storyData[0]?.id

    if (!storyRes.ok || !storyId) {
      throw new Error('Story creation failed')
    }

    const result = { storyId, palette: mockPalette, narrative }

    await fetch(`${url}/rest/v1/jobs?id=eq.${jobId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'ready', result, story_id: storyId }) })

    return new Response(JSON.stringify({ ok: true, storyId }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    try {
      const url = Deno.env.get('SUPABASE_URL')
      const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (url && service) {
        const headers = { 'apikey': service, 'Authorization': `Bearer ${service}`, 'Content-Type': 'application/json' }
        const jobId = (() => { try { return ( (await req.json()) as any ).jobId } catch { return undefined } })()
        if (jobId) {
          await fetch(`${url}/rest/v1/jobs?id=eq.${jobId}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'failed', error: String(e) }) })
        }
      }
    } catch {}
    console.error('worker error', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
