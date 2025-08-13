"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import TypeReveal from "@/components/motion/TypeReveal";
import "@/styles/brand-surface.css";
import "@/styles/card-motion.css";

type Mode = "chat" | "form";

export default function IntakeLanding() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("chat");
  const groupId = useId();

  function onStart() {
    router.push(mode === "chat" ? "/intake/chat" : "/intake/form");
  }

  return (
    <div className="min-h-[100dvh] bg-colrvia-surface text-[#F7F6F3]">
      {/* Header */}
      <header className="mx-auto max-w-5xl px-6 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <DesignerChip name="Moss AI" avatarAlt="Moss AI avatar" />
        </div>
        <button
          type="button"
          aria-label="Account"
          className="relative h-10 w-10 rounded-full border border-white/20 grid place-items-center"
        >
          <span aria-hidden>👤</span>
          <span className="absolute inset-[-8px]" aria-hidden />
        </button>
      </header>

      {/* Content container */}
      <div className="mx-auto max-w-5xl px-6 grid gap-8 lg:gap-10 md:grid-cols-[1.2fr,1fr] items-start">
        {/* Left: Hero copy */}
        <section>
          <TypeReveal
            as="h1"
            text="hi."
            speed={90}
            delay={80}
            className="font-serif text-[56px] sm:text-[64px] leading-[0.95] tracking-tight mb-2"
          />
          <TypeReveal
            text="I’ll ask a few questions and create options for your space."
            speed={18}
            delay={620}
            className="text-[15px] sm:text-[16px] opacity-90"
          />
          {/* Helpful list + trust on larger screens can live here too; we keep them below for flow */}
        </section>

        {/* Right: Mode cards (stack on mobile, 2-up on tablet/desktop) */}
        <section
          className="grid gap-3 md:gap-4 md:grid-cols-2"
          role="radiogroup"
          aria-labelledby="intake-choose-heading"
        >
          <h2 id="intake-choose-heading" className="sr-only">Choose how to get started</h2>

          <ModeCard
            active={mode === "chat"}
            onClick={() => setMode("chat")}
            title="Start voice chat"
            badge="Recommended"
            bullets={["Speak or type", "Upload photos", "Done in ~3–5 min"]}
            icon="🎤"
          />

          <ModeCard
            active={mode === "form"}
            onClick={() => setMode("form")}
            title="Fill out a form instead"
            bullets={["No mic needed", "Finish in ~4–6 min"]}
            icon="📝"
            subtle
          />
        </section>
      </div>

      {/* What you’ll need + trust (full-width but centered) */}
      <section className="mx-auto max-w-5xl px-6 mt-4 md:mt-8">
        <h3 className="text-sm font-medium mb-2 opacity-95">What you’ll need</h3>
        <ul className="text-sm opacity-90 list-disc pl-5 space-y-1 max-w-prose">
          <li>1–3 photos of the room (optional)</li>
          <li>Your style goals and must-keep items</li>
        </ul>
        <p className="mt-3 text-[13px] opacity-80">Private to you · Switch methods anytime</p>
      </section>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto max-w-5xl px-6 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full md:w-auto md:min-w-[260px] rounded-full px-6 py-3 text-base font-medium
                       bg-[#E9B096] text-[#1E1511]
                       shadow-[inset_0_-2px_0_rgba(0,0,0,0.25),0_6px_16px_rgba(0,0,0,.25)]
                       hover:opacity-95 active:opacity-90
                       focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-offset-transparent ring-[#F7F6F3]/70"
          >
            {mode === "chat" ? "Start voice chat" : "Start form"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========= bits ========= */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20
                 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 ring-offset-2"
    >
      <span aria-hidden className="text-lg leading-none">←</span>
      <span className="absolute inset-[-8px]" aria-hidden />
    </button>
  );
}

function DesignerChip({
  name,
  avatarAlt,
  avatarSrc,
}: {
  name: string;
  avatarAlt: string;
  avatarSrc?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarSrc} alt={avatarAlt} className="h-8 w-8 rounded-full object-cover border border-white/20" />
      ) : (
        <span className="h-8 w-8 rounded-full border border-white/20 bg-white/15" aria-label={avatarAlt} />
      )}
      <div className="leading-tight">
        <p className="text-[11px]/4 opacity-80">Working with</p>
        <p className="text-sm font-semibold">{name}</p>
      </div>
    </div>
  );
}

/* ======= ModeCard with micro-motion (tilt+glow) ======= */

function ModeCard({
  active,
  onClick,
  title,
  bullets,
  icon,
  badge,
  subtle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  bullets: string[];
  icon: string;
  badge?: string;
  subtle?: boolean;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Pointer-based tilt (4deg max); no-op when reduced motion is true
  function onPointerMove(e: React.PointerEvent) {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1;  // -1..1
    const py = (y / rect.height) * 2 - 1; // -1..1
    const rx = (-py * 4).toFixed(2);
    const ry = (px * 4).toFixed(2);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.transform = `perspective(800px) rotateX(var(--rx)) rotateY(var(--ry)) translateY(-2px)`;
    // glow follows cursor (as %)
    el.style.setProperty("--gx", `${(x / rect.width) * 100}%`);
    el.style.setProperty("--gy", `${(y / rect.height) * 100}%`);
  }
  function resetTilt() {
    if (!ref.current) return;
    ref.current.style.transform = "";
    ref.current.style.removeProperty("--gx");
    ref.current.style.removeProperty("--gy");
  }

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => { setHovered(false); resetTilt(); }}
      onPointerMove={onPointerMove}
      onFocus={() => { setFocused(true); }}
      onBlur={() => { setFocused(false); resetTilt(); }}
      className={[
        "card-3d rounded-2xl border px-4 py-4 text-left",
        "focus-visible:outline-none focus-visible:ring-2 ring-offset-2",
        active
          ? "bg-white/10 border-white/30"
          : subtle
          ? "bg-white/5 border-white/15"
          : "bg-white/8 border-white/20",
        hovered ? "is-hovered" : "",
        focused ? "is-focused" : "",
      ].join(" ")}
      style={
        reduced
          ? undefined
          : { transform: "perspective(800px) translateZ(0)" }
      }
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none pt-0.5" aria-hidden>
          {icon}
        </span>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">{title}</span>
            {badge && active && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/30"> {badge} </span>
            )}
          </div>
          <ul className="mt-1 text-sm opacity-90 flex flex-wrap gap-x-3">
            {bullets.map((b, i) => (
              <li key={i} className="before:content-['•'] before:mr-2">
                {b}
              </li>
            ))}
          </ul>
        </div>

        <span className="self-center text-lg" aria-hidden>
          {active ? "●" : "○"}
        </span>
      </div>
    </button>
  );
}

/* tiny hook */
function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return prefers;
}

