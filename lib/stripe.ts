import Stripe from 'stripe'
// lib/stripe.ts
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing")
  return new Stripe(key, {
    // Cast to any to tolerate pinned version differing from types package snapshot
    apiVersion: '2024-06-20' as any,
    httpClient: Stripe.createFetchHttpClient(),
  })
}
