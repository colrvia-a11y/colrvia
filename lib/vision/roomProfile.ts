import { z } from "zod"

export const FixedTone = z.enum([
"cool_light","cool_medium","cool_dark",
"warm_light","warm_medium","warm_dark",
"neutral_light","neutral_medium","neutral_dark"
])

export const RoomProfileSchema = z.object({
room: z.object({
 type: z.string().min(1), // e.g., living_room, kitchen
}),
goals: z.array(z.string()).default([]),
brand: z.enum(["Sherwin-Williams","Behr"]).default("Sherwin-Williams"),
changeable: z.object({
 walls_paint: z.boolean().default(true),
 cabinets_paintable: z.boolean().default(false),
 accent_wall: z.boolean().default(false),
}),
fixed: z.object({
 floor: z.object({
  material: z.string().optional(),
  finish: z.string().optional(),
  tone: FixedTone.optional(),
  undertone: z.string().optional(),
 }).optional(),
 counter: z.object({
  material: z.string().optional(),
  pattern: z.string().optional(),
  tone: FixedTone.optional(),
 }).optional(),
 trim: z.object({
  color_known: z.boolean().optional(),
  tone: FixedTone.optional(),
 }).optional(),
 ceiling: z.object({
  color_known: z.boolean().optional(),
 }).optional(),
 metals: z.array(z.string()).optional(),
}),
lighting: z.object({
 natural: z.object({
  orientation: z.string().optional(), // north/south/east/west/multiple/unknown
  amount: z.string().optional(), // low/medium/bright
 }).optional(),
 artificial: z.object({
  cct_kelvin: z.number().int().min(1500).max(10000).optional(),
  notes: z.string().optional(),
 }).optional(),
}).default({}),
visionFindings: z.array(z.object({
 imageId: z.string(),
 estimates: z.record(z.string(), z.string()).optional(),
 confidence: z.number().min(0).max(1).optional(),
 notes: z.string().optional(),
})).default([]),
exclusions: z.object({
 avoid_colors: z.array(z.string()).default([]),
 avoid_matching_current_walls: z.boolean().default(true),
}).default({ avoid_colors: [], avoid_matching_current_walls: true }),
notes: z.array(z.string()).default([]),
})

export type RoomProfile = z.infer<typeof RoomProfileSchema>
