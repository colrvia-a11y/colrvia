'use client';

import React, { useEffect, useState } from 'react';
import './via.css';
import AmbientEdge from '@/components/ui/ambient-edge';
import PrefilledButtons from '@/components/via/PrefilledButtons';
import ChatContainer, { ChatMessage } from '@/components/via/ChatContainer';
import InputBar from '@/components/via/InputBar';
import useSpeech from '@/hooks/useSpeech';
import useFileUpload from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

export default function ViaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bootTyped, setBootTyped] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Type-in intro "hi. i'm Via," once on mount
  useEffect(() => {
    const intro = "hi. i’m Via,";
    let i = 0;
    const id = setInterval(() => {
      setBootTyped(intro.slice(0, ++i));
      if (i === intro.length) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, []);

  const { isRecording, start, stop, transcript, supported: speechSupported } = useSpeech();

  // When transcript updates (recording ended), push into input
  const [pendingInput, setPendingInput] = useState('');
  useEffect(() => {
    if (!isRecording && transcript) {
      setPendingInput((t) => (t ? `${t} ${transcript}` : transcript));
    }
  }, [isRecording, transcript]);

  const { files, addFiles, removeFile, clear: clearFiles } = useFileUpload({
    accept: ['image/*', '.png', '.jpg', '.jpeg', '.webp', '.heic', '.pdf'],
    maxFiles: 6,
    maxSizeMB: 12
  });

  const sendMessage = async (text: string) => {
    if (!text && files.length === 0) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      attachments: files.map(f => ({ id: f.id, name: f.file.name, url: f.preview, type: f.file.type, size: f.file.size }))
    };

    setMessages(prev => [...prev, userMsg]);
    setShowSuggestions(false);
    setPendingInput('');
    clearFiles();

    // TODO: integrate your backend here. For now, fake a graceful thinking state + reply.
    const thinkingId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: thinkingId, role: 'assistant', content: '•••', thinking: true }]);

    // Simulated delay + example reply
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === thinkingId ? {
          id: thinkingId,
          role: 'assistant',
          content: "Lovely! Tell me about the room’s light and any fixed elements (floors, counters). You can upload a photo and I’ll analyze undertones. 🎨"
        } : m)
      );
    }, 900);
  };

  const onChooseSuggestion = (s: string) => {
    setPendingInput(s);
    sendMessage(s);
  };

  const onMicToggle = () => (isRecording ? stop() : start());

  return (
    <div className="relative min-h-[100dvh] bg-[--via-peach-bg]">
      {/* dreamy ambient top edge (already in repo) */}
      <AmbientEdge className="pointer-events-none" />

      <main className="container-xy py-6 md:py-10">
        {/* Paint-chip card */}
        <section
          className={cn(
            "via-card mx-auto shadow-card border border-[color-mix(in_oklab,var(--via-olive)15%,white)]",
            "bg-[--via-panel] backdrop-blur-[1px]"
          )}
          aria-label="Via chat panel"
        >
          {/* Header / Greeting */}
          <header className="p-6 md:p-8">
            <h1
              aria-live="polite"
              className="font-display text-4xl md:text-5xl leading-tight text-[--via-ink] via-type-in"
            >
              {bootTyped || '‎'}
            </h1>

            <p className="mt-3 text-[15px] md:text-base text-[--via-ink-subtle]">
              how can i help?
            </p>

            {showSuggestions && (
              <div className="mt-5">
                <PrefilledButtons
                  items={[
                    "design a palette",
                    "talk about paint",
                    "something else"
                  ]}
                  onPick={onChooseSuggestion}
                />
              </div>
            )}
          </header>

          {/* Messages */}
          <ChatContainer
            className="px-3 sm:px-4 md:px-6"
            messages={messages}
          />

          {/* Input Bar */}
          <InputBar
            className="p-3 sm:p-4 md:p-6 border-t border-[color-mix(in_oklab,var(--via-olive)12%,white)]"
            value={pendingInput}
            onChange={setPendingInput}
            onSubmit={sendMessage}
            onAttach={(fileList) => addFiles(fileList)}
            attachments={files}
            onRemoveAttachment={(id) => removeFile(id)}
            micAvailable={speechSupported}
            isRecording={isRecording}
            onToggleMic={onMicToggle}
          />
        </section>
      </main>
    </div>
  );
}

