import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: job } = await supabase
    .from('jobs')
    .select('id,user_id,result')
    .eq('id', params.id)
    .single()

  const images: string[] = job?.result?.images?.map((i: any) => i.url) ?? []
  if (!images.length) return NextResponse.json({ error: 'no_images' }, { status: 400 })

  const zip = new JSZip()
  let idx = 1
  for (const url of images) {
    const res = await fetch(url)
    if (!res.ok) continue
    const buf = Buffer.from(await res.arrayBuffer())
    const ext = url.split('?')[0].split('.').pop() || 'jpg'
    zip.file(`colrvia-${params.id}-${String(idx).padStart(2, '0')}.${ext}`, buf)
    idx++
  }
  const out = await zip.generateAsync({ type: 'nodebuffer' })
  return new NextResponse(out, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="colrvia-${params.id}.zip"`,
      'cache-control': 'no-store'
    }
  })
}
