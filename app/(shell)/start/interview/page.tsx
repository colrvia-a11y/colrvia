import Link from 'next/link'
import VoiceInterview from '@/components/voice/VoiceInterview'

function ModeSwitcher() {
  return (
    <div style={{ margin: '12px 0 24px', fontSize: 14, opacity: 0.9 }}>
      Prefer typing or tapping?{' '}
      <Link href="/start/text-interview" style={{ textDecoration: 'underline' }}>
        Try the text interview →
      </Link>
    </div>
  )
}

export default function InterviewPage() {
  return (
    <>
      <ModeSwitcher />
      <VoiceInterview />
    </>
  )
}

