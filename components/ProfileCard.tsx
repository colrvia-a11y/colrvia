import { supabaseServer } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/profile'

export default async function ProfileCard(){
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return null
  const { tier } = await getUserTier()
  // Stripe customer id not persisted yet; placeholder mask. Future: fetch from profile.
  const stripeId = '••••••'
  const lastSync = new Date().toLocaleTimeString()
  return (
    <div className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-3">
      <header className="flex items-center justify-between"><h2 className="font-medium">Profile</h2><span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-linen/70">Synced</span></header>
      <dl className="text-sm space-y-1">
  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd className="font-medium truncate">{user.email}</dd></div>
  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tier</dt><dd className="font-medium">{tier}</dd></div>
  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Stripe</dt><dd className="font-mono text-xs">{stripeId}</dd></div>
  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last Sync</dt><dd className="text-xs">{lastSync}</dd></div>
      </dl>
    </div>
  )
}
