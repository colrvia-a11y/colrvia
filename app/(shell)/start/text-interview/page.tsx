import RealTalkQuestionnaire from '@/components/realtalk/RealTalkQuestionnaire';

export const metadata = {
  title: 'RealTalk — Text Interview',
  description: 'Answer by clicking, typing, or speaking. One question at a time.',
};

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <RealTalkQuestionnaire autoStart />
    </main>
  );
}

