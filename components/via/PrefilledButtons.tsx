'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export default function PrefilledButtons({
  items, onPick, className
}: { items: string[]; onPick: (v: string) => void; className?: string; }) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {items.map((label) => (
        <button key={label} type="button" className="via-chip px-4 py-2" onClick={() => onPick(label)} aria-label={label}>
          {label}
        </button>
      ))}
    </div>
  );
}

