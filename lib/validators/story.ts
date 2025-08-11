// lib/validators/story.ts
import { z } from "zod"

// Minimal, permissive schema that matches current usage but prevents empty objects.
export const StoryBodySchema = z
  .object({
    // Free-form prompt/description about space or vibe
    prompt: z.string().min(1).max(1000).optional(),
    // Optional short label we already surface (e.g., “Cozy Neutral”)
    vibe: z.string().min(1).max(120).optional(),
    // Brand defaults to sherwin_williams if omitted; allow any string to avoid tight coupling
    brand: z.string().trim().default("sherwin_williams").optional(),
    // Optional seed palette; we only shallow-check shape here—normalize/repair handles strictness
    palette: z
      .array(
        z
          .object({
            brand: z.string().optional(),
            code: z.string().optional(),
            name: z.string().optional(),
            hex: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional(),
            role: z.string().optional(),
          })
          .strict()
      )
      .min(1)
      .optional(),
    // Misc optional fields we’ve used in tests/telemetry
    notes: z.string().max(2000).optional(),
    source: z.string().max(64).optional(),
  })
  // Require at least one meaningful signal to proceed
  .refine((d) => Boolean(d.prompt || d.vibe || d.palette), {
    message: "At least one of prompt, vibe, or palette is required",
    path: [],
  })

export type StoryBody = z.infer<typeof StoryBodySchema>
