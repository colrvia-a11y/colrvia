import RealTalkQuestionnaire from '@/components/realtalk/RealTalkQuestionnaire'

export const metadata = {
  title: 'RealTalk — Text Interview',
  description: 'Answer by clicking, typing, or speaking. One question at a time.',
}

export default function Page() {
  return (
    <main className="grid items-start justify-center min-h-[calc(100dvh-16px)] p-[var(--space-10)] theme-moss">
      <RealTalkQuestionnaire autoStart />
    </main>
  )
}

