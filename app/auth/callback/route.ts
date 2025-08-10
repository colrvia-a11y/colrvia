import 'server-only'
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { supabaseServer } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  const supabase = supabaseServer();

  if (code) {
    // Exchange the code for a session and set cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/auth/error?m=${encodeURIComponent(error.message)}`, url.origin));
    }
  }

  // If you still receive hash tokens (magic link), handle them in a client page, but prefer code flow.
  redirect(next);
}
