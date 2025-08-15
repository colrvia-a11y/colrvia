'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
};

export default function MessageBubble({
  role,
  children,
  attachments
}: {
  role: 'user' | 'assistant';
  children: React.ReactNode;
  attachments?: Attachment[];
}) {
  const isUser = role === 'user';
  return (
    <div className={cn(
      'via-bubble',
      isUser ? 'via-bubble--user ml-auto' : 'via-bubble--assistant mr-auto'
    )}>
      <div className="whitespace-pre-wrap text-[0.97rem]">{children}</div>
      {!!attachments?.length && (
        <div className="via-attachments">
          {attachments.map(file => {
            const isImage = file.type?.startsWith('image/');
            return (
              <figure key={file.id}>
                {isImage ? (
                  /* eslint-disable @next/next/no-img-element */
                  <img src={file.url} alt={file.name} className="block w-full h-20 object-cover" />
                ) : (
                  <div className="h-20 grid place-items-center text-sm text-[--via-ink-subtle]">
                    {file.name}
                  </div>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}

