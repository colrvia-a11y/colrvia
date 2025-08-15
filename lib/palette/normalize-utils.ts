// lib/palette/normalize-utils.ts
export function normalizePaintName(name: string) {
  return (name || "")
    .toLowerCase()
    .replace(/sw\s*[-#: ]?\s*\d{3,4}/gi, "") // strip embedded codes like "SW 7008"
    .replace(/[^\p{L}\p{N}\s]/gu, " ")       // remove punctuation
    .replace(/\s+/g, " ")                    // collapse spaces
    .trim();
}

export function extractSwCode(text?: string) {
  if (!text) return null;
  const m = String(text).match(/\b(?:sw)?\s*[-#: ]?\s*(\d{3,4})\b/i);
  return m ? m[1].toUpperCase() : null; // "7008"
}
