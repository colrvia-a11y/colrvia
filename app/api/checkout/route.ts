import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
export const runtime = 'nodejs'
export async function POST(_req: NextRequest) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'UNAUTH' }, { status:401 })
  const price = process.env.STRIPE_PRICE_ID
  const site = process.env.NEXT_PUBLIC_SITE_URL
  if (!price || !site) return NextResponse.json({ error:'MISSING_ENV', missing: ['STRIPE_PRICE_ID','NEXT_PUBLIC_SITE_URL'].filter(v=>!process.env[v]) }, { status:500 })
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode:'subscription',
      line_items:[{ price, quantity:1 }],
      success_url: `${site}/account?purchase=success`,
      cancel_url: `${site}/account?purchase=cancel`,
      customer_email: user.email || undefined
    })
    return NextResponse.json({ url: session.url })
  } catch (e:any) {
    console.error('CHECKOUT_ERROR', e)
    return NextResponse.json({ error:'CHECKOUT_FAILED' }, { status:500 })
  }
}
