import 'server-only';
export const runtime = 'nodejs';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
// Use the library default apiVersion for compatibility with installed stripe types.
const stripe = stripeKey ? new Stripe(stripeKey, {} as any) : null;

export async function POST() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (k) => cookieStore.get(k)?.value, set: () => {}, remove: () => {} } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.warn('AUTH_SYNC_NO_USER_ERROR', { code: (error as any).code, message: error.message });
  }
  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  // Ensure profile (id / email)
  const { error: upsertErr } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, tier: 'free' }, { onConflict: 'user_id', ignoreDuplicates: false });
  if (upsertErr) {
    console.error('AUTH_SYNC_PROFILE_UPSERT_FAIL', { code: (upsertErr as any).code, message: upsertErr.message });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Ensure stripe customer
  let customerId: string | null = null;
  if (stripe) {
    try {
      const search = await stripe.customers.search({ query: `metadata['supabase_uid']:'${user.id}'` });
      const existing = search.data[0];
      if (existing) customerId = existing.id; else {
        const created = await stripe.customers.create({ email: user.email ?? undefined, metadata: { supabase_uid: user.id } });
        customerId = created.id;
      }
    } catch (e) {
      console.error('AUTH_SYNC_STRIPE_FAIL', { message: (e as any)?.message });
    }
  }
  return NextResponse.json({ ok: true, customerId }, { status: 200 });
}
