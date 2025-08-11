'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import type { Designer } from '@/lib/ai/designers';
import OnboardingChatClient from '@/components/ai/OnboardingChat';

interface Props { designer: Designer }

export default function OnboardingChat({ designer }: Props){
  return <OnboardingChatClient designerId={designer.id} />
}
