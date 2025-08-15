'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import MessageBubble, { Attachment } from './MessageBubble';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  thinking?: boolean;
  kind?: 'text' | 'callouts';
  callouts?: { label: string; tone?: 'neutral' | 'warn' | 'info' }[];
};

export default function ChatContainer({
  messages,
  className
}: {
  messages: ChatMessage[];
  className?: string;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length]);

  return (
    <section
      className={cn('relative min-h-[30dvh] max-h-[58dvh] md:max-h-[62dvh] px-1 md:px-2 overflow-y-auto', className)}
      aria-live="polite" aria-label="Conversation" role="log"
    >
      <div className="space-y-3 pb-4">
        {messages.map(m => (
          <MessageBubble
            key={m.id}
            role={m.role}
            callouts={m.kind === 'callouts' ? m.callouts : undefined}
            attachments={m.attachments}
          >
            {m.thinking ? 'Via is thinking…' : m.content}
          </MessageBubble>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  );
}

