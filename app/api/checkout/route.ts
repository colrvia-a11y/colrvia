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
    // Find or create customer
    let customerId: string | undefined
    if (user.email) {
      const existing = await stripe.customers.list({ email: user.email, limit:1 })
      if (existing.data[0]) customerId = existing.data[0].id
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { user_id: user.id }
      })
      customerId = customer.id
    }
    const session = await stripe.checkout.sessions.create({
      mode:'subscription',
      line_items:[{ price, quantity:1 }],
      success_url: `${site}/account?purchase=success`,
      cancel_url: `${site}/account?purchase=cancel`,
      client_reference_id: user.id,
      customer: customerId,
      metadata: { user_id: user.id, email: user.email || '' }
    })
    return NextResponse.json({ url: session.url })
  } catch (e:any) {
    console.error('CHECKOUT_ERROR', e)
    return NextResponse.json({ error:'CHECKOUT_FAILED' }, { status:500 })
  }
}
