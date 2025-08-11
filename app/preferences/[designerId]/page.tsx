import PreferencesChat from '@/components/ai/OnboardingChat'
import { DESIGNERS } from '@/data/designers'
import type { DesignerProfile } from '@/types/colorStory'

export const dynamic = 'force-dynamic'

export default function PreferencesPage({ params }: { params:{ designerId:string } }){
  const designer: DesignerProfile | undefined = DESIGNERS.find(d=> d.id===params.designerId)
  if(!designer) return <div className="p-10">Designer not found.</div>
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-3xl leading-tight">Preferences</h1>
      <PreferencesChat designerId={designer.id} />
    </main>
  )
}
