"use client";
import React from "react";
import { useRouter } from "next/navigation";
import QuestionRenderer from "@/components/intake/QuestionRenderer";
import { buildQuestionQueue } from "@/lib/intake/engine";
import { QUESTIONS } from "@/lib/intake/questions";
import type { Answers, QuestionId } from "@/lib/intake/types";
import { uid } from '@/lib/uid'
import { track } from '@/lib/analytics/client'

export default function IntakePage() {
  const [answers, setAnswers] = React.useState<Answers & Record<string, any>>({});
  const router = useRouter();

  const queue = React.useMemo(() => buildQuestionQueue(answers), [answers]);
  const currentId = queue.find((id) => {
    const q = QUESTIONS[id];
    const key = q.field ?? id;
    const val: any = (answers as any)[key];
    return val === undefined || (Array.isArray(val) && val.length === 0) || val === "";
  });
  const currentQuestion = currentId ? QUESTIONS[currentId] : null;

  const handleAnswer = (id: QuestionId, value: any) => {
    const q = QUESTIONS[id];
    const key = q.field ?? id;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = (url: string) => {
    setAnswers((prev) => ({ ...prev, uploads: [...(prev.uploads || []), url] }));
  };

  const answeredCount = queue.reduce((cnt, id) => {
    const q = QUESTIONS[id];
    const key = q.field ?? id;
    const val: any = (answers as any)[key];
    return val === undefined || (Array.isArray(val) && val.length === 0) || val === ""
      ? cnt
      : cnt + 1;
  }, 0);
  const progress = queue.length ? Math.round((answeredCount / queue.length) * 100) : 0;

  function applyTemplate(v: Record<string, any>) {
    Object.entries(v).forEach(([k,val]) => setAnswers(prev => ({ ...prev, [k]: val })) )
    track('intake_start', { template: v.style || undefined })
  }

  async function handleReveal() {
    const t0 = performance.now()
    const optimisticId = uid('job_')
    track('intake_submit', { fields: Object.keys(answers).length })
    router.push(`/reveal/${optimisticId}?optimistic=1`)
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ brand: 'sherwin_williams', source: 'intake', answers })
      })
      const data = await res.json().catch(()=>null)
      if(res.ok && data?.jobId){
        track('render_started', { job_id: data.jobId })
        router.replace(`/reveal/${data.jobId}`)
        // Completion tracked by JobWatcherClient once story present (TODO: add hook there)
      }
    } catch {/* ignore */}
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Colrvia Intake</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-sm text-neutral-600">{progress}% complete</div>
        </div>
      </div>
      {currentQuestion ? (
        <QuestionRenderer
          question={currentQuestion}
          onAnswer={(val) => handleAnswer(currentId as QuestionId, val)}
          onUpload={handleUpload}
        />
      ) : (
        <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70 text-center">
          <div className="text-lg font-medium">
            Got everything I need! I’ll build a palette that fits your mood, style, light, and the items you’re keeping.
          </div>
          <button type="button"
            className="mt-4 px-4 py-2 rounded-md border bg-brand text-white"
            onClick={handleReveal}
          >
            Reveal My Palette
          </button>
        </div>
      )}
    </main>
  );
}

