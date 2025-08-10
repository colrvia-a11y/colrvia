import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Ensure the route runs on the Node.js runtime for streaming body parsing
export const runtime = 'nodejs'

/**
 * Stripe webhook handler. Validates the incoming event using the
 * webhook secret and passes through all events for further processing.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const buf = await req.text()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20'
  })
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }
  // TODO: handle event types (checkout.session.completed etc.)
  return NextResponse.json({ received: true })
}