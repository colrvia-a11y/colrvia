'use client';
import * as React from 'react';

type P = React.SVGProps<SVGSVGElement> & { size?: number };
const base = (props: P) => ({ width: props.size ?? 20, height: props.size ?? 20, strokeWidth: 1.8, ...props });

export const MicIcon = (props: P) => (
  <svg {...base(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 19v3" />
  </svg>
);

export const MicOffIcon = (props: P) => (
  <svg {...base(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 12.5 2" />
    <path d="M2 2l20 20" />
  </svg>
);

export const PaperclipIcon = (props: P) => (
  <svg {...base(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <path d="M21 12.5l-7.5 7.5a6 6 0 1 1-8.5-8.5l9.5-9.5a4 4 0 0 1 5.7 5.6L9 19a2.5 2.5 0 1 1-3.5-3.5L16 5" />
  </svg>
);

export const SendIcon = (props: P) => (
  <svg {...base(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4L22 2z" />
  </svg>
);

export const ImageIcon = (props: P) => (
  <svg {...base(props)} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="10.5" r="1.8" />
    <path d="M21 16l-5.5-5.5L9 17l-2-2-4 4" />
  </svg>
);

