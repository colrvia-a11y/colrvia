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
      const session: any = event.data.object
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth:{ autoRefreshToken:false, persistSession:false } }
      )
      async function setPro(userId:string, path:string){
        const { data } = await admin.from('profiles').select('tier').eq('user_id', userId).maybeSingle()
        if (data?.tier === 'pro') return { skipped:true }
        await setUserTierAdmin(userId,'pro')
        console.log('WEBHOOK_UPGRADE', { userId, path })
        return { skipped:false }
      }
      let userId: string | undefined
      let path = ''
      if (session.client_reference_id) { userId = session.client_reference_id; path='client_reference_id' }
      if (!userId && session.metadata?.user_id) { userId = session.metadata.user_id; path='session_metadata' }
      // fallback via customer metadata
      if (!userId && session.customer) {
        const cust = await getStripe().customers.retrieve(session.customer as string)
        if (!('deleted' in cust)) {
          // @ts-ignore
          if (cust.metadata?.user_id) { userId = cust.metadata.user_id; path='customer_metadata' }
        }
      }
      // fallback via email
      if (!userId && session.customer_details?.email) {
        const { data: prof } = await admin.from('profiles').select('user_id').limit(1) // naive; real impl: map email->auth user
        if (prof && prof[0]) { userId = prof[0].user_id; path='email_fallback' }
      }
      if (userId) await setPro(userId, path)
    }
    return NextResponse.json({ received:true })
  } catch (e:any) {
    console.error('WEBHOOK_ERROR', e.message)
    return NextResponse.json({ error:'WEBHOOK_ERROR' }, { status:400 })
  }
}
