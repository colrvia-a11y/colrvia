import PreferencesChat from '@/components/ai/OnboardingChat'
import { getDesigner, DEFAULT_DESIGNER_ID, isDesignerLocked } from '@/lib/ai/designers'
import { getUserTier } from '@/lib/profile'
import Link from 'next/link'
import { UpgradeButton } from '@/components/paywall/UpgradeButton'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PreferencesPage({ params }: { params:{ designerId:string } }){
  const id = (params.designerId || '').toLowerCase()
  if (id === 'therapist') redirect('/intake')
  const designer = getDesigner(id)
  if(!designer) return <div className="p-10">Designer not found.</div>
  const { tier, user } = await getUserTier()
  const locked = isDesignerLocked(tier, designer.id)
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl leading-tight">Preferences</h1>
  <p className="text-sm text-muted-foreground">Guided by <span className="font-medium">{designer.name}</span>{designer.pro ? ' · Pro' : ''}</p>
      </header>
      {locked ? (
        <div className="rounded-2xl border bg-[var(--bg-surface)] p-6 space-y-4">
          <p className="text-sm">This designer is a <strong>Pro</strong> feature.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/preferences/${DEFAULT_DESIGNER_ID}`} className="btn btn-secondary flex-1">Continue with default</Link>
            <UpgradeButton className="btn btn-primary flex-1" />
          </div>
          {!user && <p className="text-[11px] text-muted-foreground">You’ll need to sign in during checkout.</p>}
        </div>
      ) : (
        <PreferencesChat designerId={designer.id} />
      )}
    </main>
  )
}

