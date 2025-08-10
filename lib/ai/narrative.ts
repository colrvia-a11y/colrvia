import type { GenerateInput, ColorStory } from '@/types/story';
export function buildTitle(input: GenerateInput) {
  const t = {
    'Cozy Neutral':'Modern Rustic Serenity',
    'Airy Coastal':'Air & Light',
    'Earthy Organic':'Grounded Calm',
    'Modern Warm':'Warm Modern',
    'Soft Pastels':'Soft Nest',
    'Moody Blue-Green':'Evening Grove'
  } as const;
  return t[input.vibe] ?? 'Your Color Story';
}
export function buildNarrative(input: GenerateInput, s: Pick<ColorStory,'palette'|'placements'>) {
  const walls = s.placements.walls; const trim = s.placements.trim;
  const acc = s.placements.accent;
  const vibe = input.vibe.toLowerCase();
  return `A ${vibe} palette that feels intentional: walls in ${walls} to ground the room, ${trim} on trim for clean edges,` +
         (acc ? ` and ${acc} as a confident accent` : ``) +
         `. Tuned for your ${input.lighting} light` + (input.hasWarmWood? ` and warm wood tones.`:`.`);
}
