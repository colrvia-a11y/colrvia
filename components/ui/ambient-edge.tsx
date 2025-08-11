'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AmbientEdgeProps = {
  /** Up to 4 CSS color strings; defaults use brand tokens via CSS vars */
  colors?: [string?, string?, string?, string?];
  /** Ring thickness in px */
  thickness?: number;
  /** Blur radius in px */
  blur?: number;
  /** Spin speed in seconds */
  speedSeconds?: number;
  /** 0..1 opacity */
  opacity?: number;
  /** Toggle visibility */
  active?: boolean;
  className?: string;
};

export default function AmbientEdge({
  colors,
  thickness,
  blur,
  speedSeconds,
  opacity,
  active = true,
  className,
}: AmbientEdgeProps) {
  if (!active) return null;

  const style: React.CSSProperties = {
    // Pass CSS vars when props provided; otherwise use defaults set in CSS
    ...(thickness != null && { ['--ambient-thickness' as any]: `${thickness}px` }),
    ...(blur != null && { ['--ambient-blur' as any]: `${blur}px` }),
    ...(speedSeconds != null && { ['--ambient-speed' as any]: `${speedSeconds}s` }),
    ...(opacity != null && { ['--ambient-opacity' as any]: String(opacity) }),
  };

  // Optional: allow color overrides (we keep defaults to shadcn vars if not provided)
  if (colors?.length) {
    const [c1, c2, c3, c4] = colors;
    if (c1) (style as any)['--ambient-c1'] = c1;
    if (c2) (style as any)['--ambient-c2'] = c2;
    if (c3) (style as any)['--ambient-c3'] = c3;
    if (c4) (style as any)['--ambient-c4'] = c4;
  }

  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-ambient-edge=""
      className={cn('pointer-events-none fixed inset-0 z-[60]', className)}
      style={style}
    />
  );
}
