"use client"

import { downloadFile, copyToClipboard } from '@/lib/client/download'
import { useToast } from '@/components/ui/Toast'

export function ResultCard({ url, index, jobId }: { url: string; index: number; jobId: string }) {
  const { show, ToastEl } = useToast()
  const filename = `colrvia-${jobId}-${String(index + 1).padStart(2, '0')}.${(url.split('?')[0].split('.').pop() || 'jpg')}`

  async function onDownload() {
    await downloadFile(url, filename)
    show('Downloading…')
  }
  async function onCopyLink() {
    const ok = await copyToClipboard(url)
    show(ok ? 'Image link copied!' : 'Couldn’t copy link')
  }

  return (
    <figure className="group relative rounded-xl border overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`Variation ${index + 1}`} className="w-full h-auto block" loading={index > 1 ? 'lazy' : 'eager'} />
      <figcaption id={`cap-${index}`} className="p-2 text-sm text-neutral-600">Variation {index + 1}</figcaption>

      {/* Overlay actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div role="group" aria-label={`Actions for variation ${index + 1}`} className="flex gap-1">
          <button
            type="button"
            onClick={onDownload}
            aria-label="Download image"
            className="rounded-md bg-white/90 dark:bg-neutral-900/90 backdrop-blur border px-2 py-1 text-xs hover:bg-white"
          >
            ⬇️
          </button>
          <button
            type="button"
            onClick={onCopyLink}
            aria-label="Copy image link"
            className="rounded-md bg-white/90 dark:bg-neutral-900/90 backdrop-blur border px-2 py-1 text-xs hover:bg-white"
          >
            🔗
          </button>
        </div>
      </div>
      {ToastEl}
    </figure>
  )
}
