import { useEffect, useRef, useState, useCallback } from 'react';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: Array<{
    0: { transcript: string };
    isFinal: boolean;
  }>;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

type UseSpeechOptions = {
  lang?: string;
  onFinal?: (text: string) => void;
};

export function useSpeech({ lang = 'en-US', onFinal }: UseSpeechOptions) {
  const recRef = useRef<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang;
      rec.onresult = (e: SpeechRecognitionEvent) => {
        let finalText = '';
        let interimText = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t;
          else interimText += t;
        }
        setInterim(interimText);
        if (finalText && onFinal) onFinal(finalText.trim());
      };
      rec.onend = () => setListening(false);
      recRef.current = rec as SpeechRecognition;
      setSupported(true);
    }
  }, [lang, onFinal]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setInterim('');
    setListening(true);
    recRef.current.start();
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  return { supported, listening, interim, start, stop };
}

