import PreferencesChat from '@/components/ai/OnboardingChat';
import { DEFAULT_DESIGNER_ID } from '@/lib/ai/designers';

export const dynamic = 'force-dynamic';

export default function IntakeFormPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <PreferencesChat designerId={DEFAULT_DESIGNER_ID} />
    </main>
  );
}
