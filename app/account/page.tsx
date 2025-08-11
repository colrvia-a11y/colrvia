export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import PWABadge from './pwa-badge'
import { Suspense } from 'react'
import ReducedMotionToggle from './reduced-motion-toggle'
import ProfileCard from '@/components/ProfileCard'
import { getUserTier } from '@/lib/profile'

export default async function AccountPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div className="p-8"><p>Please sign in to view your account.</p></div>
  }
  const { tier } = await getUserTier()

  async function createPortal() {
    'use server'
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/portal`, { method:'POST', headers:{ cookie: '' } })
    const json = await res.json()
    return json.url
  }

  return (
  <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="font-display text-4xl leading-[1.05]">Account</h1>
  <ProfileCard />
  <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-4">
        <header className="flex items-center justify-between"><h2 className="font-medium">Plan & Billing</h2><span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-linen/70">{tier}</span></header>
        <p className="text-sm text-[var(--ink-subtle)]">Manage your subscription and access palette exports.</p>
        {tier === 'free' ? (
          <Button as={Link} href="/designers" variant="primary">Create a Story to Upgrade</Button>
        ) : (
          <form action={async () => { 'use server'; }}>
            <Button type="submit" variant="outline">Manage Billing</Button>
          </form>
        )}
      </section>
      <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-4">
        <h2 className="font-medium">PWA</h2>
        <p className="text-sm text-[var(--ink-subtle)]">Install Colrvia for a faster, app-like experience.</p>
        <PWABadge />
      </section>
      <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-4">
        <h2 className="font-medium">Accessibility & Motion</h2>
        <p className="text-sm text-[var(--ink-subtle)]">Control motion intensity for reduced animation.</p>
        <Suspense fallback={null}><ReducedMotionToggle /></Suspense>
      </section>
    </div>
  )
}
