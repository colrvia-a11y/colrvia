import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('projects')
      .select('is_public, public_slug')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const enable = !!body.enable

    // Fetch current row
    const { data: current, error: selError } = await supabase
      .from('projects')
      .select('id, is_public, public_slug')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    if (selError) return NextResponse.json({ error: selError.message }, { status: 400 })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let slug = current.public_slug
    if (enable && !slug) {
      slug = (crypto.randomUUID().split('-')[0] + Math.random().toString(36).slice(2,7)).toLowerCase()
    }

    const { data: updated, error: updError } = await supabase
      .from('projects')
      .update({ is_public: enable, public_slug: slug })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('is_public, public_slug')
      .single()

    if (updError) return NextResponse.json({ error: updError.message }, { status: 400 })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
