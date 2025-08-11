import Stripe from 'stripe'
/**
 * Server-only Stripe client. API version can be configured via STRIPE_API_VERSION
 * (falls back to Stripe library default).
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  const apiVersion = process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined
  return apiVersion ? new Stripe(key, { apiVersion }) : new Stripe(key)
}
