// Single source of truth for Via chat types

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
};

export type Callout = {
  label: string;
  tone?: 'neutral' | 'warn' | 'info';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  thinking?: boolean;
  kind?: 'text' | 'callouts';
  callouts?: Callout[];
};
