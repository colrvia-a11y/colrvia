import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { ColorStoryPDF } from '@/lib/pdf/document'
import { renderToStream } from '@react-pdf/renderer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'UNAUTH' }, { status:401 })
  const { storyId } = await req.json()
  if (!storyId) return NextResponse.json({ error:'MISSING_STORY_ID' }, { status:400 })
  const { data, error } = await supabase.from('stories').select('*').eq('id', storyId).single()
  if (error || !data) return NextResponse.json({ error:'NOT_FOUND' }, { status:404 })
  // Using createElement form to avoid TS parsing issues in this route file
  // @ts-ignore
  const pdf = await renderToStream(ColorStoryPDF({ story: data }))
  return new NextResponse(pdf as any, {
    headers:{
      'Content-Type':'application/pdf',
      'Content-Disposition':'attachment; filename="colrvia-color-story.pdf"'
    }
  })
}
