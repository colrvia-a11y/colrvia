import { notFound } from 'next/navigation';
import { getDesigner } from '@/lib/ai/designers';
import OnboardingChat from './chat';

export default function OnboardingPage({ params }: { params: { designerId: string } }) {
  const designer = getDesigner(params.designerId);
  if (!designer) notFound();
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2"><span>{designer.avatar}</span> {designer.name}</h1>
      <p className="text-sm text-[var(--ink-subtle)] mb-6">{designer.tagline}</p>
      <OnboardingChat designer={designer} />
    </main>
  );
}
