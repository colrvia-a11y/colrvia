import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Sync client auth state (email/password sign-in, sign out, refresh) to server cookies.
// Client sends access & refresh tokens; server sets/clears cookie session so server components see user.
export async function POST(req: NextRequest) {
  try {
    const { event, access_token, refresh_token } = await req.json()
    const supabase = supabaseServer()
    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
      return NextResponse.json({ ok: true, cleared: true })
    }
    if (access_token && refresh_token) {
      // Basic shape guard (JWTs contain at least two dots)
      if (!(access_token.includes('.') && refresh_token.includes('.'))) {
        return NextResponse.json({ ok:false, error:'INVALID_TOKEN_FORMAT' }, { status:400 })
      }
      const { error } = await (supabase.auth as any).setSession({ access_token, refresh_token })
      if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok:false, error:'MISSING_TOKENS' }, { status: 400 })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e.message || 'SERVER_ERROR' }, { status: 500 })
  }
}
