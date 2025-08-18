'use client'
import { useRef, useState } from 'react'

type FileItem = { file: File; id: string; progress: number; status: 'queued' | 'uploading' | 'done' | 'error' }

export function Uploader({ onComplete }:{ onComplete: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<FileItem[]>([])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const next = files.map((f, i) => ({ file: f, id: `${Date.now()}-${i}`, progress: 0, status: 'queued' as const }))
    setItems(v => [...v, ...next])
    // TODO: start uploading to your API
    onComplete(files)
  }

  return (
    <div className="border border-[var(--border)] rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <button className="px-3 py-2 border rounded" onClick={() => inputRef.current?.click()}>Pick photos</button>
        <span className="text-sm text-[var(--ink-subtle)]">JPG, PNG, WEBP</span>
      </div>
      <input ref={inputRef} className="hidden" type="file" accept="image/*" multiple onChange={onPick} />
      {!!items.length && (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {items.map(it => (
            <li key={it.id} className="rounded-lg overflow-hidden border border-[var(--border)]">
              <div className="aspect-square grid place-items-center text-xs">{it.file.name.slice(0, 10)}</div>
              <div className="h-1 bg-[var(--surface-elev)]">
                <div className="h-1 bg-[var(--accent)]" style={{ width: `${it.progress}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
