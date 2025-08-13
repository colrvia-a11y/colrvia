"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { TemplateChips } from "@/components/intake/TemplateChips";
import { Progress } from "@/components/intake/Progress";
import { LivePreview } from "@/components/intake/LivePreview";
import { StickyCTA } from "@/components/intake/StickyCTA";
import { track } from "@/lib/analytics/client";
import { uid } from "@/lib/uid";

const IntakeSchema = z.object({
  room: z.enum(["Living room", "Bedroom", "Kitchen", "Bathroom", "Workspace"], { required_error: "Pick a room" }),
  style: z.enum(["Modern", "Cozy", "Minimalist", "Mid-century", "Scandinavian"], { required_error: "Pick a style" }),
  budget: z.enum(["$", "$$", "$$$"]).optional(),
  prompt: z.string().min(8, "Describe your space (8+ chars)"),
});

type Intake = z.infer<typeof IntakeSchema>;

const TEMPLATES = [
  { label: "Modern living room", values: { room: "Living room", style: "Modern", prompt: "Bright modern living room with natural light" } },
  { label: "Cozy bedroom", values: { room: "Bedroom", style: "Cozy", prompt: "Warm bedroom with layered textures" } },
  { label: "Minimal workspace", values: { room: "Workspace", style: "Minimalist", prompt: "Clutter-free workspace with clean lines" } },
];

export default function IntakePage() {
  const router = useRouter();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<Intake>({
    mode: "onBlur",
    resolver: zodResolver(IntakeSchema),
    defaultValues: { prompt: "" } as any,
  });

  const selection = { room: watch("room"), style: watch("style") };

  function applyTemplate(v: Record<string, any>) {
    Object.entries(v).forEach(([k, val]) => setValue(k as any, val, { shouldValidate: true }));
    track("intake_start", { template: (v as any).style || undefined });
  }

  async function onSubmit(data: Intake) {
    track("intake_submit", { fields: Object.keys(data).length });
    const tempId = uid("tmp");
    router.push(`/reveal/${tempId}?optimistic=1`);

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { storyId?: string };
      if (json.storyId) {
        track("render_started", { story_id: json.storyId });
        router.replace(`/reveal/${json.storyId}?optimistic=1`); // keep skeleton until ready
        return;
      }
    } catch (e) {
      /* no-op */
    }
    router.replace(`/reveal/error?reason=story-create-failed`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-8 grid md:grid-cols-[1fr_340px] gap-6">
      <form onSubmit={handleSubmit(onSubmit)} aria-describedby="intake-help">
        <Progress step={1} total={2} />

        <TemplateChips templates={TEMPLATES} onApply={applyTemplate} />

        {/* Room */}
        <div className="mb-4">
          <label htmlFor="room" className="text-sm font-medium">Room</label>
          <select
            id="room"
            {...register("room")}
            onBlur={() => trigger("room")}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            aria-invalid={!!errors.room}
            aria-describedby="room-help"
          >
            <option value="" hidden>Select a room</option>
            {["Living room", "Bedroom", "Kitchen", "Bathroom", "Workspace"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <p id="room-help" className="mt-1 text-xs text-neutral-500">
            {errors.room?.message ?? "Pick the space you’re redesigning."}
          </p>
        </div>

        {/* Style */}
        <div className="mb-4">
          <label htmlFor="style" className="text-sm font-medium">Style</label>
          <select
            id="style"
            {...register("style")}
            onBlur={() => trigger("style")}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            aria-invalid={!!errors.style}
            aria-describedby="style-help"
          >
            <option value="" hidden>Select a style</option>
            {["Modern", "Cozy", "Minimalist", "Mid-century", "Scandinavian"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p id="style-help" className="mt-1 text-xs text-neutral-500">
            {errors.style?.message ?? "We’ll tailor layouts, textures, and finishes."}
          </p>
        </div>

        {/* Prompt */}
        <div className="mb-6">
          <label htmlFor="prompt" className="text-sm font-medium">Describe your space</label>
          <textarea
            id="prompt"
            rows={4}
            {...register("prompt")}
            onBlur={() => trigger("prompt")}
            placeholder="Natural light, wood accents, neutral palette…"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            aria-invalid={!!errors.prompt}
            aria-describedby="prompt-help"
          />
          <p id="prompt-help" className="mt-1 text-xs text-neutral-500">
            {errors.prompt?.message ?? "Add key constraints and preferences."}
          </p>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl px-4 py-3 bg-brand text-brand-contrast hover:bg-brand-hover disabled:opacity-50"
          >
            Generate (≈12s)
          </button>
          <span className="text-xs text-neutral-500">Private to you · You can edit inputs later</span>
        </div>

        {/* Mobile sticky CTA */}
        <StickyCTA disabled={isSubmitting} />
      </form>

      {/* Right rail preview (desktop) */}
      <div className="hidden md:block">
        <LivePreview selection={selection} />
      </div>
    </div>
  );
}
