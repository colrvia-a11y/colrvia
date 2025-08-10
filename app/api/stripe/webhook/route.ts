import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs' // ensure Node runtime

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') ?? ''
  const buf = await req.text()

  // No apiVersion here; SDK uses your Stripe account's default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // TODO: handle event types (checkout.session.completed etc.)
  return NextResponse.json({ received: true })
}
