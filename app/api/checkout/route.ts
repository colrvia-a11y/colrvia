import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs' // make sure this uses Node runtime

export async function POST(req: NextRequest) {
  try {
    const { priceId } = (await req.json()) as { priceId: string }

    // Create the Stripe client without hard-coding apiVersion
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // or 'payment'
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?purchase=cancel`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
