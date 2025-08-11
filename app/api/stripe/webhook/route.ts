// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getStripe } from "@/lib/stripe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type StripeEvent = {
  id: string
  type: string
  data: { object: any }
  created: number
}

async function alreadyProcessed(id: string) {
  const admin = supabaseAdmin()
  const { data } = await admin.from("stripe_events").select("id").eq("id", id).single()
  return !!data
}

async function recordProcessed(evt: StripeEvent) {
  const admin = supabaseAdmin()
  await admin.from("stripe_events").insert({
    id: evt.id,
    type: evt.type,
    created_at: new Date(evt.created * 1000).toISOString(),
    raw: evt as any,
    processed_at: new Date().toISOString(),
  })
}

async function handleEvent(evt: StripeEvent) {
  switch (evt.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // TODO: Implement subscription sync. Safe no-op for now.
      break
    default:
      break
  }
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 500 })
  }
  const rawBody = await req.text()
  const sig = req.headers.get("stripe-signature") || ""

  let evt: StripeEvent
  try {
    // @ts-ignore runtime alignment
    evt = stripe.webhooks.constructEvent(rawBody, sig, secret) as StripeEvent
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Invalid signature: ${err?.message || "unknown"}` }, { status: 400 })
  }

  if (await alreadyProcessed(evt.id)) {
    return NextResponse.json({ ok: true, idempotent: true })
  }

  try {
    await handleEvent(evt)
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "Handler failed" }, { status: 500 })
  }

  try {
    await recordProcessed(evt)
  } catch {
    return NextResponse.json({ ok: true, recorded: false }, { status: 202 })
  }

  return NextResponse.json({ ok: true })
}
