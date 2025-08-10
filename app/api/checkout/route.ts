import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * POST handler for creating a Stripe Checkout session. Expects a body
 * containing a `priceId`. On success returns JSON with the checkout
 * session URL. On failure returns a 500.
 */
export async function POST(req: NextRequest) {
  const { priceId } = (await req.json()) as { priceId: string }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
  })
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // or 'payment' for one-off
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?purchase=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?purchase=cancel`
    })
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error(err)
    return new NextResponse('Failed to create session', { status: 500 })
  }
}