"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * File upload component for uploading images to the Supabase storage bucket
 * named `uploads`. When a file is selected it is uploaded and a public URL
 * for the file is displayed as a link.
 */
interface UploadProps {
  projectId?: string
}

export function Upload({ projectId }: UploadProps) {
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const router = useRouter()

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
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

    const path = `${user.id}/${projectId ?? 'no-project'}/${crypto.randomUUID()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, file, { upsert: false })
    if (uploadError) {
      alert(uploadError.message)
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