// app/via/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Zap } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ViaChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Via. Ask me about paint colors, undertones, or finishes. Paste a photo URL to analyze undertones.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fast, setFast] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const nextMsgs = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/via/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs, fast }),
      });
      const data = await res.json();
      const reply = data?.reply || "Hmm, I couldn’t form a reply.";
      setMessages([...nextMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([
        ...nextMsgs,
        { role: "assistant", content: "Network hiccup. Try again in a moment?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="mx-auto max-w-screen-sm p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Via Chat</h1>
          <p className="text-sm text-muted-foreground">Gentle guidance. Quick, actionable answers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <Label htmlFor="fast"><span className="text-xs">Fast</span></Label>
          <Switch id="fast" checked={fast} onCheckedChange={setFast} aria-label="Fast mode" />
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div
            ref={listRef}
            className="h-[60vh] overflow-y-auto rounded-xl bg-muted/30 p-3 sm:p-4"
            role="log"
            aria-live="polite"
          >
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const isUser = m.role === "user";
                  return (
                    <motion.div
                      key={i}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 280, damping: 28 }}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        isUser
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-background border shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </motion.div>
                  );
                })}
                {loading && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    className="max-w-[70%] rounded-2xl bg-background border shadow-sm px-3 py-2 text-sm"
                    aria-label="Via is typing"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 opacity-60" />
                      <span>Thinking…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Ask about SW 7008 Alabaster, kitchen finishes, or paste a photo URL for undertones…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Your message"
            />
            <Button onClick={send} disabled={loading} className="rounded-2xl">
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        Tip: Include your room type and lighting (e.g., “north light living room + kid-friendly”).
      </p>
    </div>
  );
}

