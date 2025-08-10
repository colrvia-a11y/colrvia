"use client"

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * File upload component for uploading images to the Supabase storage bucket
 * named `uploads`. When a file is selected it is uploaded and a public URL
 * for the file is displayed as a link.
 */
export function Upload() {
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    const supabase = supabaseBrowser()
    const path = `${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage
      .from('uploads')
      .upload(path, file, { upsert: false })
    if (error) {
      alert(error.message)
      setBusy(false)
      return
    }
    const { data } = supabase.storage.from('uploads').getPublicUrl(path)
    setUrl(data.publicUrl)
    setBusy(false)
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        disabled={busy}
      />
      {url && (
        <a className="underline" href={url} target="_blank">
          View uploaded image
        </a>
      )}
    </div>
  )
}