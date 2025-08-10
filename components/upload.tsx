"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * File upload component for uploading images to the Supabase storage bucket
 * named `uploads`. When a file is selected it is uploaded and a public URL
 * for the file is displayed as a link.
 */
interface UploadProps { projectId?: string; onUploaded?: (url:string)=>void }

export function Upload({ projectId, onUploaded }: UploadProps) {
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement|null>(null)
  const router = useRouter()

  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE) {
      setError('File must be under 10MB')
      // reset input so same file can be chosen again after user edits
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    setBusy(true)
    const supabase = supabaseBrowser()
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      alert('Please sign in to upload files.')
      setBusy(false)
      router.push('/sign-in')
      return
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_')
    const path = `${user.id}/${projectId ?? 'no-project'}/${crypto.randomUUID()}-${cleanName}`
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, file, { upsert: false })
    if (uploadError) {
      setError(uploadError.message)
      setBusy(false)
      return
    }

    // Insert DB record (project_images table) - project_id may be null
    const { error: insertError } = await supabase
      .from('project_images')
      .insert({ project_id: projectId ?? null, user_id: user.id, storage_path: path })
    if (insertError) {
      // Not fatal for showing link, but inform user
      console.warn('Insert error:', insertError.message)
    }

    const { data } = supabase.storage.from('uploads').getPublicUrl(path)
    setUrl(data.publicUrl)
    onUploaded?.(data.publicUrl)
    setBusy(false)
  }

  return (
  <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          disabled={busy}
          aria-describedby={error ? 'upload-error' : undefined}
        />
        {busy && <span className="text-xs text-neutral-500">Uploading…</span>}
      </div>
      {error && <div id="upload-error" className="text-xs text-red-600">{error}</div>}
      {url && (
        <div className="flex items-center gap-3">
          <a className="underline text-sm" href={url} target="_blank" rel="noopener noreferrer">Open image</a>
          <img src={url} alt="Uploaded preview" className="h-14 w-14 object-cover rounded-md border" />
        </div>
      )}
      <p className="text-[11px] text-neutral-500">Max 10MB. JPG/PNG/WebP recommended.</p>
    </div>
  )
}