'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import type { Designer } from '@/lib/ai/designers';
import PreferencesChat from '@/components/ai/PreferencesChat';

interface Props { designer: Designer }

export default function PreferencesChatWrapper({ designer }: Props) {
  return <PreferencesChat designerId={designer.id} />
}
