"use client";
import Image from "next/image";
import { shimmer, toBase64 } from "@/lib/image-placeholder";
import { track } from "@/lib/analytics/client";

export function ResultCard({ url, index, storyId, width = 1600, height = 900, onMoreLike, onCompare }:{
  url: string; index: number; storyId: string; width?: number; height?: number;
  onMoreLike?: (idx:number)=>void; onCompare?: (idx:number)=>void;
}) {
  return (
    <figure className="group relative rounded-xl border overflow-hidden">
      <Image
        src={url} alt={`Variation ${index + 1}`} width={width} height={height}
        sizes="(max-width: 768px) 100vw, 50vw"
        placeholder="blur" blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`}
        priority={index < 2} decoding="async" className="block w-full h-auto"
      />
      <figcaption className="p-2 text-sm text-neutral-600 flex items-center justify-between">
        <span>Variation {index + 1}</span>
        <span className="flex gap-2">
          <button type="button" aria-label="More like this" onClick={() => { track('reveal_action', { story_id: storyId, action: 'more_like' }); onMoreLike?.(index); }} className="rounded-md border px-2 py-1 text-xs">✨</button>
          <button type="button" aria-label="Compare" onClick={() => { track('reveal_action', { story_id: storyId, action: 'compare_open' }); onCompare?.(index); }} className="rounded-md border px-2 py-1 text-xs">🌓</button>
        </span>
      </figcaption>
    </figure>
  );
}
