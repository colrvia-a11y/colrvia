'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './via.css';
import AmbientEdge from '@/components/ui/ambient-edge';
import PrefilledButtons from '@/components/via/PrefilledButtons';
import ChatContainer, { ChatMessage } from '@/components/via/ChatContainer';
import InputBar from '@/components/via/InputBar';
import useSpeech from '@/hooks/useSpeech';
import useFileUpload from '@/hooks/useFileUpload';
import useVoiceOut from '@/hooks/useVoiceOut';
import { cn } from '@/lib/utils';

export default function ViaPage() {
  // Conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Intro type-in
  const [bootTyped, setBootTyped] = useState('');
  useEffect(() => {
    const intro = 'hi. i’m Via,';
    let i = 0;
    const id = setInterval(() => {
      setBootTyped(intro.slice(0, ++i));
      if (i === intro.length) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, []);

  // Speech in/out
  const stt = useSpeech();
  const { speakEnabled, toggleSpeak, speak } = useVoiceOut({ voiceHint: 'female' });

  // Input and files
  const [pendingInput, setPendingInput] = useState('');
  const { files, addFiles, removeFile, clear: clearFiles } = useFileUpload({
    accept: ['image/*', '.png', '.jpg', '.jpeg', '.webp', '.heic', '.pdf'],
    maxFiles: 6,
    maxSizeMB: 12,
    makeDataUrl: true, // enables /api/vision/analyze via data URL
  });

  // When mic finishes, push transcript into input
  useEffect(() => {
    if (!stt.isRecording && stt.transcript) {
      setPendingInput((t) => (t ? `${t} ${stt.transcript}` : stt.transcript));
    }
  }, [stt.isRecording, stt.transcript]);

  // Helpers
  const push = (m: ChatMessage) => setMessages((prev) => [...prev, m]);
  const replace = (id: string, updater: (m: ChatMessage) => ChatMessage) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));

  // ---- Smart image analysis → callouts (client-side before main answer)
  async function analyzeImages() {
    const imageUploads = files.filter((f) => f.file.type.startsWith('image/'));
    if (imageUploads.length === 0) return null;

    // Show a placeholder "Analyzing…" callout
    const calloutId = crypto.randomUUID();
    push({
      id: calloutId,
      role: 'assistant',
      kind: 'callouts',
      content: 'Analyzing your images…',
      callouts: [{ label: 'Analyzing…', tone: 'info' }],
    });

    try {
      const results = await Promise.all(
        imageUploads.map(async (f) => {
          const r = await fetch('/api/vision/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: f.dataUrl }), // data URL supported by OpenAI
          });
          const j = await r.json();
          return { name: f.file.name, notes: j?.notes || '' };
        })
      );

      // Convert notes → concise chips (first sentences)
      const chips = results.flatMap((r) => {
        const first = (r.notes || '').split(/(?<=\.)\s+/)[0]?.trim();
        return first ? [{ label: first, tone: 'neutral' as const }] : [];
      });

      replace(calloutId, (m) => ({
        ...m,
        content: 'Image insights',
        callouts: chips.length ? chips : [{ label: 'No strong undertones detected.', tone: 'neutral' }],
      }));

      return results;
    } catch (e) {
      replace(calloutId, (m) => ({
        ...m,
        content: 'Image analysis failed',
        callouts: [{ label: 'Could not analyze images right now.', tone: 'warn' }],
      }));
      return null;
    }
  }

  // ---- Send message → wire /api/via/answer
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;

    setShowSuggestions(false);

    // Push user message
    const userMsgId = crypto.randomUUID();
    push({
      id: userMsgId,
      role: 'user',
      content: trimmed,
      attachments: files.map((f) => ({
        id: f.id, name: f.name, url: f.url, type: f.type, size: f.size
      })),
    });

    // Run image analysis (shows callouts as it goes)
    const vision = await analyzeImages();

    // Prepare context for Via
    const context = {
      imageSummaries: vision,
      filenames: files.map((f) => f.file.name),
    };

    // Clear composer
    setPendingInput('');
    clearFiles();

    // Thinking placeholder
    const thinkingId = crypto.randomUUID();
    push({ id: thinkingId, role: 'assistant', content: '•••', thinking: true });

    try {
      const r = await fetch('/api/via/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, context }),
      });
      const j = await r.json();
      const answer = (j?.answer || '').trim();

      replace(thinkingId, () => ({
        id: thinkingId,
        role: 'assistant',
        content: answer || "I couldn't find an answer just now, but I'm here to help with color direction and prep tips.",
      }));

      // Optional: speak the reply
      if (speakEnabled && answer) speak(answer);
    } catch {
      replace(thinkingId, () => ({
        id: thinkingId,
        role: 'assistant',
        content: 'Hmm, something went wrong reaching my paint brain. Try again in a moment.',
      }));
    }
  };

  return (
    <div className={cn('theme-via relative min-h-[100dvh]')}>
      {/* ambient glow */}
      <AmbientEdge className="pointer-events-none" />

      <main className="container-xy py-6 md:py-10">
        {/* Paint-chip card */}
        <section
          className={cn(
            'via-card mx-auto shadow-card border border-[color-mix(in_oklab,var(--via-olive)15%,white)]',
            'bg-[--via-panel] backdrop-blur-[1px]'
          )}
          aria-label="Via chat panel"
        >
          {/* Header */}
          <header className="p-6 md:p-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-[--via-ink] via-type-in" aria-live="polite">
                {bootTyped || '‎'}
              </h1>
              <p className="mt-3 text-[15px] md:text-base text-[--via-ink-subtle]">how can i help?</p>
              {showSuggestions && (
                <div className="mt-5">
                  <PrefilledButtons
                    items={['design a palette', 'talk about paint', 'something else']}
                    onPick={(s) => { setPendingInput(s); sendMessage(s); }}
                  />
                </div>
              )}
            </div>

            {/* speaker toggle */}
            <button
              type="button"
              className="via-chip px-3 py-2 mt-1"
              onClick={toggleSpeak}
              aria-pressed={speakEnabled}
              title={speakEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {speakEnabled ? '🔊 voice on' : '🔈 voice off'}
            </button>
          </header>

          {/* Messages */}
          <ChatContainer className="px-3 sm:px-4 md:px-6" messages={messages} />

          {/* Composer */}
          <InputBar
            className="p-3 sm:p-4 md:p-6 border-t border-[color-mix(in_oklab,var(--via-olive)12%,white)]"
            value={pendingInput}
            onChange={setPendingInput}
            onSubmit={sendMessage}
            onAttach={(list) => addFiles(list)}
            attachments={files}
            onRemoveAttachment={(id) => removeFile(id)}
            micAvailable={stt.supported}
            isRecording={stt.isRecording}
            onToggleMic={() => (stt.isRecording ? stt.stop() : stt.start())}
          />
        </section>
      </main>
    </div>
  );
}

