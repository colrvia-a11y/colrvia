'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function useVoiceOut(opts?: { voiceHint?: 'female' | 'male' }) {
  const synth = useMemo(() => (typeof window !== 'undefined' ? window.speechSynthesis : null), []);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[] | null>(null);

  useEffect(() => {
    if (!synth) return;
    const load = () => { voicesRef.current = synth.getVoices(); };
    load();
    synth.onvoiceschanged = load;
  }, [synth]);

  const pickVoice = useCallback(() => {
    const list = voicesRef.current || [];
    const pref = (opts?.voiceHint === 'male') ? /male|baritone/i : /female|alto|soprano/i;
    return list.find(v => pref.test(v.name)) || list[0] || null;
  }, [opts?.voiceHint]);

  const speak = useCallback((text: string) => {
    if (!synth || !speakEnabled || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.0; u.pitch = 1.0; u.lang = 'en-US';
    synth.speak(u);
  }, [synth, speakEnabled, pickVoice]);

  const toggleSpeak = useCallback(() => setSpeakEnabled((s) => !s), []);

  return { speakEnabled, toggleSpeak, speak };
}

