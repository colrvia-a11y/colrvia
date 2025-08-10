import { Upload } from '@/components/upload'

export default function TestUploadPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold mb-4">Test Upload</h1>
      <p className="text-neutral-600 mb-6">
        Choose an image. It uploads to your Supabase “uploads” bucket and shows a public link.
      </p>
      <Upload />
    </main>
  )
}
