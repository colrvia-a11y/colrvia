import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('projects')
      .select('name, story, created_at')
      .eq('public_slug', params.slug)
      .eq('is_public', true)
      .limit(1)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ name: data.name, story: data.story, created_at: data.created_at })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
