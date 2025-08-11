"use client";
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export function HowItWorksOpenTrack({ where = 'page' }: { where?: string }) {
  useEffect(() => {
    try { track('howitworks_open', { where }); } catch {}
  }, [where]);
  return null;
}
