"use client"

import { useRouter } from 'next/navigation'
import { copyToClipboard } from '@/lib/client/download'
import { useToast } from '@/components/ui/Toast'
import { track } from '@/lib/analytics/client'

export function ActionsBar({ storyId }: { storyId: string }) {
  const router = useRouter()
  const { push } = useToast()

  async function shareProject() {
    const url = `${location.origin}/reveal/${storyId}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Colrvia designs', url })
        track('reveal_action', { story_id: storyId, action: 'share' })
        return
      } catch {}
    }
    const ok = await copyToClipboard(url)
    push({ text: ok ? 'Link copied!' : 'Couldn’t copy link' })
    track('reveal_action', { story_id: storyId, action: 'share' })
  }

  async function downloadAll() {
    const res = await fetch(`/api/stories/${storyId}/download-zip`)
    if (!res.ok) return push({ text: 'Couldn’t prepare ZIP' })
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `colrvia-${storyId}.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
    push({ text: 'Downloading ZIP…' })
    track('reveal_action', { story_id: storyId, action: 'download_all' })
  }

  async function retryJob() {
    const res = await fetch(`/api/stories/${storyId}/retry`, { method: 'POST' })
    const data = await res.json()
    if (data?.storyId) {
      push({ text: 'Starting a new variation…' })
      track('reveal_action', { story_id: storyId, action: 'retry' })
      router.push(`/reveal/${data.storyId}?optimistic=1`)
    } else {
      push({ text: 'Retry failed' })
    }
  }

  return (
    <div role="toolbar" aria-label="Project actions" className="sticky top-0 z-20 -mx-4 md:mx-0 mb-4 border-b bg-white/85 dark:bg-neutral-950/85 backdrop-blur px-4 py-2">
      <div className="flex gap-2">
        <button type="button" onClick={downloadAll} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 focus-visible:ring-2">⬇️ Download all</button>
        <button type="button" onClick={shareProject} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 focus-visible:ring-2">🔗 Share</button>
        <button type="button" onClick={retryJob} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 focus-visible:ring-2">🔁 Try another set</button>
      </div>
    </div>
  )
}
