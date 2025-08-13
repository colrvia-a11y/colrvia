"use client"
import { useRouter } from 'next/navigation'

export default function InterviewIntroPage() {
  const router = useRouter()
  return (
    <main className="p-4 text-center">
      <h1 className="text-2xl mb-8">Designer interview · ~10 minutes</h1>
      <button
        type="button"
        onClick={() => router.push('/start/interview')}
        className="btn btn-primary"
      >
        Start interview
      </button>
    </main>
  )
}
