'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Options = {
  onFinal?: (text: string) => void;
};

type SpeechState = {
  supported: boolean;
  isRecording: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  listening: boolean; // alias for backward compat
  interim: string; // alias for backward compat
};

function useSpeech(opts?: Options): SpeechState {
  const SpeechRecognition = useMemo(() => {
    const w = typeof window !== 'undefined' ? (window as any) : undefined;
    return w?.SpeechRecognition || w?.webkitSpeechRecognition;
  }, []);
  const supported = Boolean(SpeechRecognition);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!supported) return;
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0]?.transcript)
        .join(' ')
        .trim();
      setTranscript(text);
      opts?.onFinal?.(text);
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);

    recRef.current = rec;
  }, [SpeechRecognition, supported]);

  const start = useCallback(() => {
    if (!supported || !recRef.current) return;
    setTranscript('');
    setIsRecording(true);
    try { recRef.current.start(); } catch {}
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported || !recRef.current) return;
    try { recRef.current.stop(); } catch {}
  }, [supported]);

  const reset = useCallback(() => setTranscript(''), []);

  return { supported, isRecording, transcript, start, stop, reset, listening: isRecording, interim: transcript };
}

export default useSpeech;
export { useSpeech };

