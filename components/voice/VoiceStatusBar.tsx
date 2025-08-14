// components/voice/VoiceStatusBar.tsx
'use client'
import { cn } from '@/lib/utils'

type Props = {
  status: 'booting' | 'ready' | 'fallback' | 'error'
  reason?: string | null
  showLink?: boolean
}
export default function VoiceStatusBar({ status, reason, showLink }: Props) {
  const msg =
    status === 'booting' ? 'Starting voice…' :
    status === 'ready' ? 'Voice connected' :
    status === 'fallback' ? 'Using text prompts for now.' :
    'Voice failed — using text.'
  return (
    <div className={cn(
      'text-xs rounded-xl border px-2 py-1',
      status === 'error' ? 'border-red-500/40' : 'border-neutral-300/50'
    )}>
      <span>{msg}</span>
      {reason ? <span className="ml-2 opacity-70">({reason})</span> : null}
      {showLink ? (
        <a className="ml-2 underline" href="/debug/voice" target="_blank" rel="noreferrer">Debug</a>
      ) : null}
    </div>
  )
}
