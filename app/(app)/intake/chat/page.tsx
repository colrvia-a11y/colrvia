'use client';
import VoiceMic from '@/components/assistant/VoiceMic';

export default function IntakeVoicePage() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center p-6">
      <VoiceMic autoStart />
    </main>
  );
}
