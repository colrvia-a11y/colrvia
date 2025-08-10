import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { setUserTierAdmin } from '@/lib/profile'
import { createClient } from '@supabase/supabase-js'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error:'MISSING_WEBHOOK_SECRET' }, { status:500 })
  try {
    const stripe = getStripe()
    const event = stripe.webhooks.constructEvent(body, sig!, secret)
    if (event.type === 'checkout.session.completed') {
      // Simplified: set first profile row pro (placeholder; real impl would map email)
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, { auth:{ autoRefreshToken:false, persistSession:false } })
      const { data: profiles } = await admin.from('profiles').select('user_id').limit(1)
      if (profiles && profiles[0]) await setUserTierAdmin(profiles[0].user_id, 'pro')
    }
    return NextResponse.json({ received:true })
  } catch (e:any) {
    console.error('WEBHOOK_ERROR', e.message)
    return NextResponse.json({ error:'WEBHOOK_ERROR' }, { status:400 })
  }
}
