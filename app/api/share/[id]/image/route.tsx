import { ImageResponse } from 'next/og'
import { supabaseServer } from '../../../../../lib/supabase/server'
export const runtime = 'edge'

export async function GET(req: Request, { params }: { params:{ id:string } }) {
  const { searchParams } = new URL(req.url)
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return new Response('Unauthorized', { status:401 })
  const { data } = await supabase.from('stories').select('*').eq('id', params.id).single()
  if(!data) return new Response('Not found', { status:404 })
  const palette = (data.palette||[]).slice(0,5)
  const title = data.title
  return new ImageResponse(
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', width:'100%', height:'100%', display:'flex', flexDirection:'column', background:'#F7F5EF', padding:64, justifyContent:'space-between' }}>
      <div style={{ fontSize:48, fontWeight:'bold', lineHeight:1.05, maxWidth:900 }}>{title}</div>
      <div style={{ display:'flex', gap:24 }}>
        {palette.map((p:any,i:number)=> (
          <div key={i} style={{ width:160, height:240, borderRadius:28, background:p.hex, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:20, fontSize:20, color:'#111', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight:600 }}>{p.name}</div>
            <div style={{ fontSize:14, opacity:.7 }}>{p.code}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:20 }}>
        <div style={{ display:'flex', gap:8, width:300, height:14 }}>
          <div style={{ flex:3, background:'#2F5D50', borderRadius:8 }} />
          <div style={{ flex:1.5, background:'#4A7F71', borderRadius:8 }} />
          <div style={{ flex:0.5, background:'#83B5A5', borderRadius:8 }} />
        </div>
        <div style={{ fontSize:24, fontWeight:600, letterSpacing:2 }}>COLRVIA</div>
      </div>
    </div>,
    { width:1200, height:630 }
  )
}
