import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Returns aggregate cost + token usage for the authenticated user (last 30 days by default)
export async function GET(req: NextRequest){
  try {
    const url = new URL(req.url)
    const days = Math.min(90, parseInt(url.searchParams.get('days')||'30',10))
    const userId = url.searchParams.get('user') // optional override (admin tools later)

    const supa = createAdminClient()
    const since = new Date(Date.now() - days*24*60*60*1000).toISOString()

    const q = supa.from('ai_usage')
      .select('model, event, input_tokens, output_tokens, total_tokens, cost_usd, created_at, user_id')
      .gte('created_at', since)
    if (userId) q.eq('user_id', userId)

    const { data, error } = await q
    if (error) return new Response(JSON.stringify({ ok:false, error: error.message }), { status: 500 })

    const summary: Record<string, any> = {}
    let grand = { input:0, output:0, total:0, cost:0 }
    for(const row of data||[]){
      const key = row.model
      if(!summary[key]) summary[key] = { model: key, input:0, output:0, total:0, cost:0 }
      summary[key].input += row.input_tokens||0
      summary[key].output += row.output_tokens||0
      summary[key].total += row.total_tokens||0
      summary[key].cost += Number(row.cost_usd||0)
      grand.input += row.input_tokens||0
      grand.output += row.output_tokens||0
      grand.total += row.total_tokens||0
      grand.cost += Number(row.cost_usd||0)
    }

    return new Response(JSON.stringify({ ok:true, models: Object.values(summary), grand }), { headers: { 'Content-Type':'application/json' }})
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error: e?.message||'summary_error' }), { status: 500 })
  }
}
