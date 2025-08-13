// Supabase Edge Function: render-worker
// Simulates processing a render job and updates the jobs table.
// Replace the simulated delay + mock result with real provider integration.
// deno-lint-ignore-file no-explicit-any
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

interface Payload { storyId: string; userId: string }

serve(async (req: Request) => {
  const url = Deno.env.get('SUPABASE_URL')!
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const headers = { 'apikey': service, 'Authorization': `Bearer ${service}`, 'Content-Type': 'application/json' }
  try {
    const { storyId, userId } = (await req.json()) as Payload
    if(!storyId || !userId) throw new Error('Missing storyId/userId')
    // Verify story exists & belongs to user
    const storyRes = await fetch(`${url}/rest/v1/stories?id=eq.${storyId}&user_id=eq.${userId}&select=id,status`, { headers })
    if(!storyRes.ok){
      throw new Error('story_not_found_or_forbidden')
    }
    // Mark processing (optimistic transition only if still queued/draft)
    await fetch(`${url}/rest/v1/stories?id=eq.${storyId}&user_id=eq.${userId}&status=in.(queued,draft)`, { method: 'PATCH', headers, body: JSON.stringify({ status:'processing' }) })
    // Simulated render latency
    await new Promise(r => setTimeout(r, 2000))
    const result = {
      images: [
        { url: 'https://picsum.photos/seed/a/1600/900' },
        { url: 'https://picsum.photos/seed/b/1600/900' },
        { url: 'https://picsum.photos/seed/c/1600/900' },
        { url: 'https://picsum.photos/seed/d/1600/900' }
      ],
      meta: { variations:4 }
    }
  await fetch(`${url}/rest/v1/stories?id=eq.${storyId}&user_id=eq.${userId}`, { method:'PATCH', headers, body: JSON.stringify({ status:'ready', result }) })
    return new Response(JSON.stringify({ ok:true, storyId }), { headers:{ 'Content-Type':'application/json' } })
  } catch (e) {
    try {
      const body = await req.json().catch(()=> ({}))
      if(body.storyId && body.userId){
        await fetch(`${url}/rest/v1/stories?id=eq.${body.storyId}&user_id=eq.${body.userId}`, { method:'PATCH', headers, body: JSON.stringify({ status:'failed', error:String(e) }) })
      }
    } catch {}
    console.error('worker error', e)
    return new Response(JSON.stringify({ ok:false, error:String(e) }), { status:500, headers:{ 'Content-Type':'application/json' } })
  }
})
