'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { postTurn } from '@/lib/realtalk/api';
import type { Answers, PromptSpec, TurnResponse } from '@/lib/realtalk/types';
import { useSpeech } from '@/hooks/useSpeech';

type Props = {
  initialAnswers?: Answers;
  autoStart?: boolean;
};

export default function RealTalkQuestionnaire({ initialAnswers = {}, autoStart = true }: Props) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [current, setCurrent] = useState<PromptSpec | null>(null);
  const [greeting, setGreeting] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; value: string | string[] }[]>([]);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const { supported: speechOK, listening, interim, start, stop } = useSpeech({
    onFinal: (text) => {
      // If user says "explain", route to explainer; else treat as answer.
      const normalized = text.trim().toLowerCase();
      if (normalized.startsWith('explain')) {
        onExplain();
      } else {
        if (current?.input_type === 'text') handleTextSubmit(text);
        else {
          // Try to smart-match against choices (nluParse on server will also normalize)
          submitAnswer(text);
        }
      }
    }
  });

  useEffect(() => {
    if (autoStart) void nextTurn(); // first pull to get greeting + first prompt
  }, [autoStart]);

  async function nextTurn(ack?: { id: string; value: string | string[] }) {
    setLoading(true);
    try {
      const res: TurnResponse = await postTurn({ answers, ack, mode: 'next' });
      if (res.greeting) setGreeting(res.greeting);
      if (res.prompt) {
        setCurrent(res.prompt);
        setExplanation(null);
        // focus input for text questions
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        setCurrent(null); // done!
      }
      if (res.answers) setAnswers(res.answers);
      if (ack) setHistory((h) => [...h, ack]);
    } finally {
      setLoading(false);
    }
  }

  const progressLabel = useMemo(() => {
    // If backend provides, use it; else approximate from history length.
    return `Step ${history.length + (current ? 1 : 0)} of ${Math.max(history.length + 1, 10)}`;
  }, [history.length, current]);

  function updateAnswers(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function submitAnswer(value: string | string[]) {
    if (!current) return;
    // Client-side validation where easy (e.g., mood_words max 3 words)
    if (current.id === 'mood_words' && typeof value === 'string') {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > (current.validation?.max ?? 3)) {
        alert(`Please keep this to ${current.validation?.max ?? 3} words.`);
        return;
      }
    }
    updateAnswers(current.id, value);
    void nextTurn({ id: current.id, value });
  }

  function handleTextSubmit(text: string) {
    const v = text.trim();
    if (!v && current?.validation?.required) return;
    submitAnswer(v);
    if (inputRef.current) (inputRef.current as HTMLInputElement).value = '';
  }

  function toggleChip(choiceId: string) {
    if (!current) return;
    if (current.input_type === 'singleSelect') {
      submitAnswer(choiceId);
    } else if (current.input_type === 'multiSelect') {
      const prev = (answers[current.id] as string[] | undefined) ?? [];
      const exists = prev.includes(choiceId);
      const next = exists ? prev.filter((x) => x !== choiceId) : [...prev, choiceId];
      updateAnswers(current.id, next);
    }
  }

  async function onExplain() {
    if (!current) return;
    setLoading(true);
    try {
      const r = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ questionText: current.text, answers })
      });
      const data = await r.json();
      setExplanation(data.explanation);
    } finally {
      setLoading(false);
    }
  }

  function onBack() {
    // Pop last ack and ask server to recompute (authoritative)
    const prev = [...history];
    prev.pop();
    const newAnswers: Answers = { ...answers };
    // Remove last id from local answers (server remains source of truth)
    if (current?.id && newAnswers[current.id]) delete newAnswers[current.id];
    setHistory(prev);
    setAnswers(newAnswers);
    void nextTurn(); // rely on server to send previous question
  }

  if (!current) {
    return (
      <div className="rt-shell">
        <Header greeting={greeting} />
        <div className="rt-card">
          <h2>All set 🎉</h2>
          <p>Thanks! We’ve gathered what we need. You can review or restart any time.</p>
          <div className="rt-actions">
            <button type="button" onClick={() => { setAnswers({}); setHistory([]); setCurrent(null); void nextTurn(); }}>
              Restart
            </button>
          </div>
        </div>
        <Style />
      </div>
    );
  }

  const isText = current.input_type === 'text';
  const isMulti = current.input_type === 'multiSelect';

  return (
    <div className="rt-shell">
      <Header greeting={greeting} />
      <Progress label={progressLabel} />
      <div className="rt-card">
        <div className="rt-qhead">
          <h2>{current.text}</h2>
          <div className="rt-qactions">
            <button type="button" className="rt-ghost" aria-label="Explain this question" onClick={onExplain}>Explain</button>
          </div>
        </div>

        {current.choices?.length ? (
          <div className="rt-chips" role="group" aria-label="Suggested answers">
            {current.choices.map((c) => {
              const active =
                (isMulti && Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(c.id)) ||
                (!isMulti && answers[current.id] === c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  className={`rt-chip ${active ? 'is-active' : ''}`}
                  onClick={() => toggleChip(c.id)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="rt-free">
          {isText ? (
            <input
              ref={inputRef as any}
              type="text"
              placeholder="Type your answer…"
              aria-label="Type your answer"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit((e.target as HTMLInputElement).value);
              }}
            />
          ) : (
            <input
              ref={inputRef as any}
              type="text"
              placeholder="Prefer to type something else? (Press Enter to submit)"
              aria-label="Type your answer"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTextSubmit((e.target as HTMLInputElement).value);
              }}
            />
          )}

          <div className="rt-voice">
            <button
              type="button"
              className={`rt-mic ${listening ? 'is-live' : ''}`}
              onClick={() => (listening ? stop() : start())}
              disabled={!speechOK}
              aria-pressed={listening}
              aria-label={listening ? 'Stop voice input' : 'Start voice input'}
              title={speechOK ? 'Answer by voice' : 'Voice not supported on this browser'}
            >
              {listening ? 'Listening…' : '🎙️ Voice'}
            </button>
            {interim && <span className="rt-interim" aria-live="polite">{interim}</span>}
          </div>
        </div>

        <div className="rt-actions">
          <button type="button" className="rt-secondary" onClick={onBack} disabled={!history.length}>Back</button>
          <button
            type="button"
            className="rt-primary"
            onClick={() => {
              const v = (inputRef.current as HTMLInputElement | HTMLTextAreaElement)?.value ?? '';
              if (v.trim()) handleTextSubmit(v);
            }}
            disabled={loading}
          >
            Continue
          </button>
        </div>

        {explanation && (
          <div className="rt-explain" role="region" aria-live="polite">
            <strong>Why we ask:</strong>
            <p>{explanation}</p>
          </div>
        )}
      </div>
      <Style />
    </div>
  );
}

function Header({ greeting }: { greeting?: string }) {
  return (
    <header className="rt-header">
      <div className="rt-avatar" aria-hidden>🧑‍🎨</div>
      <div className="rt-headcopy">
        <h1>RealTalk Interview</h1>
        <p>{greeting ?? 'Let’s make your space sing.'}</p>
      </div>
    </header>
  );
}

function Progress({ label }: { label: string }) {
  return (
    <div className="rt-progress" aria-label="Interview progress">
      <div className="rt-bar"><div className="rt-fill" style={{ width: '40%' }} /></div>
      <span>{label}</span>
    </div>
  );
}

/** Scoped CSS for quick drop-in (feel free to migrate to your design system) */
function Style() {
  return (
    <style jsx>{`
      .rt-shell { max-width: 720px; margin: 0 auto; padding: 24px; }
      .rt-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
      .rt-avatar { width: 40px; height: 40px; border-radius: 50%; display:flex; align-items:center; justify-content:center; background: #f2f2f7; }
      .rt-card { background: #fff; border: 1px solid #eee; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
      .rt-qhead { display:flex; align-items:start; justify-content:space-between; gap: 12px; }
      .rt-qactions { display:flex; gap:8px; }
      .rt-ghost { background: transparent; border: none; padding: 6px 8px; cursor: pointer; opacity: 0.8; }
      .rt-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 6px; }
      .rt-chip { border: 1px solid #e2e2e2; background: #fafafa; padding: 8px 12px; border-radius: 999px; cursor: pointer; }
      .rt-chip.is-active { border-color: #111; background: #111; color: #fff; }
      .rt-free { display: grid; gap: 8px; margin: 12px 0; }
      .rt-free input { width: 100%; font: inherit; padding: 12px 14px; border-radius: 12px; border: 1px solid #dedede; }
      .rt-voice { display:flex; align-items:center; gap: 8px; }
      .rt-mic { border: 1px solid #e2e2e2; border-radius: 10px; padding: 8px 12px; background: #fff; cursor: pointer; }
      .rt-mic.is-live { border-color: #ff7a59; box-shadow: 0 0 0 3px rgba(255,122,89,0.15); }
      .rt-interim { font-size: 0.9rem; opacity: 0.8; }
      .rt-actions { display:flex; justify-content: space-between; gap: 8px; margin-top: 12px; }
      .rt-primary { background: #111; color: #fff; border: none; padding: 10px 14px; border-radius: 10px; }
      .rt-secondary { background: #f5f5f5; border: none; padding: 10px 14px; border-radius: 10px; }
      .rt-explain { margin-top: 16px; padding: 12px; border-radius: 12px; background: #f9fafb; border: 1px dashed #e6e6e6; }
      .rt-progress { display:flex; align-items:center; gap: 8px; margin: 12px 0; }
      .rt-bar { flex:1; height: 6px; background:#f1f1f4; border-radius: 999px; overflow:hidden; }
      .rt-fill { height: 100%; background: #111; }
    `}</style>
  );
}

