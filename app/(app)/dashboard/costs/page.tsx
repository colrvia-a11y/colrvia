export const runtime = 'nodejs'
import { createAdminClient } from '@/lib/supabase/admin'

async function fetchSummary(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY){
    return [] // build-time (static export) safety when env not present
  }
  const supa = createAdminClient()
  const since = new Date(Date.now() - 30*24*60*60*1000).toISOString()
  const { data } = await supa.from('ai_usage').select('*').gte('created_at', since).order('created_at',{ ascending:false }).limit(500)
  return data||[]
}

export default async function CostsPage(){
  const rows = await fetchSummary()
  const totals = rows.reduce((acc:any,r:any)=>{ acc.cost += Number(r.cost_usd||0); acc.tokens += (r.total_tokens||0); return acc }, { cost:0, tokens:0 })
  return <div className="p-6 space-y-6">
    <h1 className="text-2xl font-semibold">AI Usage (30d)</h1>
    <div className="text-sm text-gray-600">Approximate cost & token accounting. Internal only.</div>
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="font-medium">Totals (last 30d)</div>
      <div className="mt-1 text-sm">Tokens: {totals.tokens.toLocaleString()} | Cost: ${totals.cost.toFixed(4)}</div>
    </div>
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b"><th className="py-2 pr-2">When</th><th className="pr-2">Event</th><th className="pr-2">Model</th><th className="pr-2">In</th><th className="pr-2">Out</th><th className="pr-2">Total</th><th className="pr-2">Cost</th></tr>
      </thead>
      <tbody>
        {rows.map(r=> <tr key={r.id} className="border-b last:border-0">
          <td className="py-1 pr-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
          <td className="pr-2">{r.event}</td>
          <td className="pr-2">{r.model}</td>
          <td className="pr-2 text-right tabular-nums">{r.input_tokens}</td>
            <td className="pr-2 text-right tabular-nums">{r.output_tokens}</td>
          <td className="pr-2 text-right tabular-nums">{r.total_tokens}</td>
          <td className="pr-2 text-right tabular-nums">${Number(r.cost_usd).toFixed(4)}</td>
        </tr>)}
        {rows.length===0 && <tr><td className="py-4 text-gray-500" colSpan={7}>No usage yet.</td></tr>}
      </tbody>
    </table>
  </div>
}
