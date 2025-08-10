import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return NextResponse.json({ error: 'MISSING_SITE_URL' }, { status: 500 })

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  // Placeholder: In real flow we'd store stripe_customer_id in profile and call stripe.billingPortal.sessions.create
  return NextResponse.json({ url: `${siteUrl}/account` })
}
