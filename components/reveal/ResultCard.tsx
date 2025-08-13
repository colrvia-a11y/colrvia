"use client";

import Image from 'next/image'
import { shimmer, toBase64 } from '@/lib/image-placeholder'
import { downloadFile, copyToClipboard } from "@/lib/client/download";
import { useToast } from "@/components/ui/Toast";

type Props = { url: string; index: number; storyId: string; width?: number; height?: number }
export function ResultCard({ url, index, storyId, width = 1600, height = 900 }: Props) {
  const { show, ToastEl } = useToast();
  const ext = (url.split('?')[0].split('.').pop() || 'jpg').toLowerCase()
  const filename = `colrvia-${storyId}-${String(index + 1).padStart(2,'0')}.${ext}`

  async function onDownload(){ await downloadFile(url, filename); show('Downloading…') }
  async function onCopyLink(){ show((await copyToClipboard(url)) ? 'Image link copied!' : 'Couldn’t copy') }

  return (
    <figure className="group relative rounded-xl border overflow-hidden">
      <Image
        src={url}
        alt={`Variation ${index + 1}`}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, 50vw"
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width,height))}`}
        priority={index < 2}
        fetchPriority={index === 0 ? 'high' : undefined}
        decoding="async"
        className="block w-full h-auto"
      />
      <figcaption className="p-2 text-sm text-neutral-600">Variation {index + 1}</figcaption>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div role="group" aria-label={`Actions for variation ${index + 1}`} className="flex gap-1">
          <button type="button" onClick={onDownload} aria-label="Download image" className="rounded-md bg-white/90 dark:bg-neutral-900/90 backdrop-blur border px-2 py-1 text-xs">⬇️</button>
          <button type="button" onClick={onCopyLink} aria-label="Copy image link" className="rounded-md bg-white/90 dark:bg-neutral-900/90 backdrop-blur border px-2 py-1 text-xs">🔗</button>
        </div>
      </div>
      {ToastEl}
    </figure>
  )
}
