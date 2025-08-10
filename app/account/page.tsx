import { getUserTier } from '@/lib/profile'
import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Button from '@/components/ui/Button'
import PwaBadge from './pwa-badge'

export default async function AccountPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
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
  <div className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="border rounded p-4 space-y-2">
        <div className="flex justify-between"><span>Plan</span><span className="font-medium uppercase">{tier}</span></div>
        {tier === 'free' ? (
          <Button as={Link} href="/start" variant="primary">Upgrade (create a story first)</Button>
        ) : (
          <form action={async () => { 'use server'; /* call portal endpoint soon */ }}>
            <Button type="submit" variant="secondary">Manage Billing</Button>
          </form>
        )}
  </div>
  <PwaBadge />
    </div>
  )
}
