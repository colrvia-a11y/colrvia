export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = params.id
  if (!id) return NextResponse.json({ narrative: '' })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ narrative: '' })
  }
  try {
    const supa = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data, error } = await supa.from('stories').select('narrative').eq('id', id).maybeSingle()
    if (error) return NextResponse.json({ narrative: '' })
    return NextResponse.json({ narrative: (data as any)?.narrative || '' })
  } catch {
    return NextResponse.json({ narrative: '' })
  }
}
