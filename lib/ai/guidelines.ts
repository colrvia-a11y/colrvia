export const PALETTE_GUIDELINES = `
You are selecting an interior paint palette from *only* the provided candidates.
Rules:
- Roles: primary, secondary, accent, trim, ceiling (exactly one of each; five total).
- Each swatch must exactly match a provided candidate (brand, name, code, hex).
- No duplicate roles. No duplicate {brand,code,name,hex}.
- Keep accent meaningfully distinct in lightness from primary.
- It's OK to omit 'placements'—we'll apply defaults if missing.
Output:
- JSON only, matching the provided schema. No prose, no markdown.
`;
