'use client'
import { useRouter } from 'next/navigation'
export default function Onboarding(){
  const router = useRouter()
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Let’s set you up</h1>
      <ol className="space-y-3 text-sm">
        <li>1) Pick a goal</li>
        <li>2) Upload a room photo</li>
        <li>3) Choose your style</li>
      </ol>
      <button type="button" className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white" onClick={()=>router.push('/start')}>Get started</button>
    </div>
  )
}
