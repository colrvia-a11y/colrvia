'use client';

import React, { FormEvent, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function InputBar({
  className,
  value,
  onChange,
  onSubmit,
  onAttach,
  attachments,
  onRemoveAttachment,
  micAvailable,
  isRecording,
  onToggleMic
}: {
  className?: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  onAttach: (files: FileList) => void;
  attachments: { id: string; name: string; url: string; type?: string; size?: number }[];
  onRemoveAttachment: (id: string) => void;
  micAvailable: boolean;
  isRecording: boolean;
  onToggleMic: () => void;
}) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const onPick = () => fileInput.current?.click();

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); onSubmit(value); };

  // autoresize
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = taRef.current; if (!el) return;
    el.style.height = '0px'; el.style.height = el.scrollHeight + 'px';
  }, [value]);

  return (
    <footer className={cn('bg-transparent', className)}>
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="via-attachments">
            {attachments.map((a) => (
              <figure key={a.id}>
                {a.type?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt={a.name} className="block w-full h-20 object-cover" />
                ) : (
                  <div className="h-20 grid place-items-center text-sm text-[--via-ink-subtle]">{a.name}</div>
                )}
                <button type="button" className="remove text-xs" onClick={() => onRemoveAttachment(a.id)} aria-label={`Remove ${a.name}`}>✕</button>
              </figure>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="via-input grid grid-cols-[auto,1fr,auto] gap-2 items-end p-2">
        {/* Attach */}
        <div className="pl-2 flex items-center">
          <button type="button" className="p-2 rounded-md hover:bg-white/70" onClick={onPick} aria-label="Attach files" title="Attach files">📎</button>
          <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => e.target.files && onAttach(e.target.files)} accept="image/*,.pdf" />
        </div>

        {/* Textarea */}
        <div className="px-1">
          <label htmlFor="via-input" className="sr-only">Message Via</label>
          <textarea
            id="via-input" ref={taRef}
            className="w-full bg-transparent outline-none text-[0.98rem] leading-[1.35] placeholder:text-[--via-ink-subtle]"
            placeholder="type something to get started…"
            value={value} onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(value); } }}
          />
        </div>

        {/* Mic + Send */}
        <div className="pr-1 flex items-center gap-1">
          <button
            type="button"
            disabled={!micAvailable}
            onClick={onToggleMic}
            className={cn('p-2 rounded-md', micAvailable ? 'hover:bg-white/70' : 'opacity-50 cursor-not-allowed')}
            aria-pressed={isRecording}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            title={micAvailable ? (isRecording ? 'Stop recording' : 'Start recording') : 'Microphone not available'}
          >
            {isRecording ? '🛑🎙️' : '🎙️'}
          </button>

          <button type="submit" className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-[--via-olive] text-[--via-olive-ink] font-semibold hover:brightness-105 active:brightness-95" aria-label="Send">
            ➤ <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </footer>
  );
}

