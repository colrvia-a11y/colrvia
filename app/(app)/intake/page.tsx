"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

/**
 * DESIGN-ONLY INTAKE LANDING
 * - Keeps your existing question sets & logic intact.
 * - Just decides between Voice Chat or Form and routes out.
 * - You can rename /intake/chat and /intake/form below if your routes differ.
 */

type Mode = "chat" | "form";

export default function IntakeLanding() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("chat"); // Voice Chat is the preferred default
  const groupId = useId();

  // Optional: record the default view (hook up to your analytics if desired)
  useEffect(() => {
    // window.posthog?.capture("intake_mode_view", { default: mode });
  }, []);

  function onStart() {
    if (mode === "chat") {
      router.push("/intake/chat"); // do NOT alter your chat logic; this simply navigates
    } else {
      router.push("/intake/form"); // do NOT alter your form logic; this simply navigates
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#0D2C22] to-[#143629] text-[#F7F6F3]">
      {/* Header */}
      <header className="mx-auto max-w-md px-5 pt-6 pb-2 flex items-center gap-3">
        <BackButton onClick={() => router.back()} />
        <DesignerChip name="Moss AI" avatarAlt="Moss AI avatar" />
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-md px-5">
        {/* H1 visible for brand feel; keep it short */}
        <h1 className="font-serif text-[56px] leading-[0.95] tracking-tight mb-2">hi.</h1>
        {/* Visually secondary intro */}
        <p className="text-sm opacity-90">
          I’ll ask a few questions and create options for your space.
        </p>

        {/* (Optional) Hidden semantic heading for SR users */}
        <h2 className="sr-only" id="intake-choose-heading">
          Choose how to get started
        </h2>
      </section>

      {/* Mode cards */}
      <section
        className="mx-auto max-w-md px-5 mt-6 space-y-3"
        role="radiogroup"
        aria-labelledby="intake-choose-heading"
        aria-describedby={`${groupId}-help`}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            setMode((m) => (m === "chat" ? "form" : "chat"));
          }
          if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            setMode((m) => (m === "form" ? "chat" : "form"));
          }
        }}
      >
        <ModeCard
          role="radio"
          aria-checked={mode === "chat"}
          tabIndex={mode === "chat" ? 0 : -1}
          active={mode === "chat"}
          onClick={() => setMode("chat")}
          title="Start voice chat"
          badge="Recommended"
          bullets={["Speak or type", "Upload photos", "Done in ~3–5 min"]}
          icon="🎤"
        />
        <ModeCard
          role="radio"
          aria-checked={mode === "form"}
          tabIndex={mode === "form" ? 0 : -1}
          active={mode === "form"}
          onClick={() => setMode("form")}
          title="Fill out a form instead"
          bullets={["No mic needed", "Finish in ~4–6 min"]}
          icon="📝"
          subtle
        />

        <p id={`${groupId}-help`} className="sr-only">
          Use arrow keys to switch options. Press Enter to select.
        </p>
      </section>

      {/* What you’ll need */}
      <section className="mx-auto max-w-md px-5 mt-5">
        <h3 className="text-sm font-medium mb-2 opacity-95">What you’ll need</h3>
        <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
          <li>1–3 photos of the room (optional)</li>
          <li>Your style goals and must-keep items</li>
        </ul>
      </section>

      {/* Trust line */}
      <p className="mx-auto max-w-md px-5 mt-4 text-[13px] opacity-80">
        Private to you · Switch methods anytime
      </p>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto max-w-md px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-full px-5 py-3 text-base font-medium bg-[#E9B096] text-[#1E1511]
                       shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]
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

/* ============ UI Bits ============ */

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
      {/* invisible padding to reach 44x44 on any device */}
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
  avatarSrc?: string; // optional; falls back to a neutral block
}) {
  return (
    <div className="flex items-center gap-2">
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarSrc}
          alt={avatarAlt}
          className="h-8 w-8 rounded-full object-cover border border-white/20"
        />
      ) : (
        <span
          className="h-8 w-8 rounded-full border border-white/20 bg-white/15"
          aria-label={avatarAlt}
        />
      )}
      <div className="leading-tight">
        <p className="text-[11px]/4 opacity-80">Working with</p>
        <p className="text-sm font-semibold">{name}</p>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  title,
  bullets,
  icon,
  badge,
  subtle,
  ...a11y
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  bullets: string[];
  icon: string;
  badge?: string;
  subtle?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...a11y}
      className={[
        "w-full text-left rounded-2xl border px-4 py-4 transition",
        "focus-visible:outline-none focus-visible:ring-2 ring-offset-2",
        active
          ? "bg-white/10 border-white/30"
          : subtle
          ? "bg-white/5 border-white/15"
          : "bg-white/8 border-white/20",
        "hover:bg-white/12 active:scale-[0.99]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none pt-0.5" aria-hidden>
          {icon}
        </span>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">{title}</span>
            {badge && active && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/30">
                {badge}
              </span>
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

        {/* radio indicator */}
        <span className="self-center text-lg" aria-hidden>
          {active ? "●" : "○"}
        </span>
      </div>
    </button>
  );
}

// Notes
//
// Routes assumed: /intake/chat and /intake/form. If yours differ, change the two router.push(...) paths—no other logic is touched.
//
// Typography uses font-serif and system sans. If you already wired next/font, it’ll inherit.
//
// Contrast is tuned for your green/peach brand. Buttons and cards meet ≥4.5:1 small-text contrast.

