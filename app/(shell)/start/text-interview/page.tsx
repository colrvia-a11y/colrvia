import RealTalkQuestionnaire from '@/components/realtalk/RealTalkQuestionnaire'

export const metadata = {
  title: 'RealTalk — Text Interview',
  description: 'Answer by clicking, typing, or speaking. One question at a time.',
}

export default function Page() {
  return (
    <main className="rt-container theme-moss">
      <RealTalkQuestionnaire autoStart />
      <style jsx>{`
        .rt-container {
          display: grid;
          place-items: start center;
          min-height: calc(100dvh - 16px);
          padding: var(--space-10);
        }
      `}</style>
    </main>
  )
}

