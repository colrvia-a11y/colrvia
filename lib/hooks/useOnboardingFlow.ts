'use client';
import { useEffect, useState } from 'react';
import { type InterviewState, getCurrentNode } from '@/lib/ai/onboardingGraph';

interface FlowReturn {
  state: InterviewState | null;
  currentQ: ReturnType<typeof getCurrentNode> | null;
  sendAnswer: (val: string) => Promise<void>;
  done: boolean;
}

export default function useOnboardingFlow(): FlowReturn {
  const [state, setState] = useState<InterviewState | null>(null);
  const [currentQ, setCurrentQ] = useState<ReturnType<typeof getCurrentNode> | null>(null);
  const [done, setDone] = useState(false);
  const designerId = 'therapist';

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/ai/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designerId, step: 'start' })
        });
        const j = await r.json().catch(() => null);
        if (!active) return;
        setState(j?.state ?? null);
        setCurrentQ(j?.state ? getCurrentNode(j.state) : null);
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  async function sendAnswer(val: string) {
    if (!state || done) return;
    try {
      const r = await fetch('/api/ai/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designerId, step: 'answer', content: val, state })
      });
      const j = await r.json().catch(() => null);
      setState(j?.state ?? null);
      setCurrentQ(j?.state ? getCurrentNode(j.state) : null);
      if (j?.state?.done) setDone(true);
    } catch {}
  }

  return { state, currentQ, sendAnswer, done };
}
