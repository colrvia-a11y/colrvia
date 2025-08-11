'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import type { Designer } from '@/lib/ai/designers';
import { initialTurn, nextState, states, isTerminal, type OnboardingAnswers, type Turn } from '@/lib/ai/onboardingGraph';
import { seedPaletteFor } from '@/lib/ai/palette';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props { designer: Designer }

export default function OnboardingChat({ designer }: Props) {
  const [answers,setAnswers] = useState<OnboardingAnswers>({});
  const [turns,setTurns] = useState<Turn[]>([initialTurn()]);
  const [current,setCurrent] = useState(turns[0].state);
  const [done,setDone] = useState(false);
  const listRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); },[turns]);

  function handleUser(answer: string) {
    setTurns(t => [...t, { state: current, prompt: states[current].prompt, answer }]);
    const result = nextState(current, answer, answers);
    if (result.update) setAnswers(a => ({ ...a, ...result.update }));
    const next = result.next;
    if (isTerminal(next)) {
      setTurns(t => [...t, { state: next, prompt: states[next].prompt }]);
      setCurrent(next); setDone(true);
      // generate palette deterministically now
      try {
        const vibe = answers.goal as any || 'Cozy Neutral';
        const brand = (answers.brand as any) || 'SW';
        const palette = seedPaletteFor({ brand, vibe });
        console.log('Seed palette', palette);
      } catch(e){ console.warn(e); }
      return;
    }
    setCurrent(next);
    setTimeout(()=>{
      setTurns(t => [...t, { state: next, prompt: states[next].prompt }]);
    }, 400);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const val = (fd.get('answer')||'').toString().trim();
    if (!val) return;
    form.reset();
    handleUser(val);
  }

  return (
    <div className="flex flex-col gap-4">
      <div ref={listRef} className="rounded-xl border border-linen p-4 h-80 overflow-y-auto bg-paper/60 backdrop-blur-sm">
        {turns.map((t,i)=> (
          <div key={i} className="mb-3">
            <div className="text-sm font-medium text-brand">{designer.short}</div>
            <div className="text-sm leading-relaxed whitespace-pre-line">{t.prompt}</div>
            {t.answer && <div className="mt-1 text-sm rounded-md bg-surface px-2 py-1 border border-linen">{t.answer}</div>}
          </div>
        ))}
      </div>
      {!done && (
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input name="answer" placeholder="Type your answer" autoComplete="off" className="flex-1" />
          <Button type="submit" variant="primary">Send</Button>
        </form>
      )}
      {done && <div className="text-sm text-[var(--ink-subtle)]">Palette ready (placeholder). Continue to dashboard soon.</div>}
    </div>
  );
}
