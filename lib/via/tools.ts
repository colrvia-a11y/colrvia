// lib/via/tools.ts
// Minimal placeholder tools. Flesh out later as needed.
import sharp from "sharp";

// Analyze an image URL for undertones (very light placeholder)
export async function analyzeImageForUndertones(url: string) {
  // In real impl, fetch image & bucket colors.
  // Here we return a deterministic stub so tests/dev work without image IO.
  return {
    undertone: "neutral",
    confidence: 0.4,
    topHexes: ["#f6f6f6", "#e8e8e8", "#cfcfcf"],
    note: "Stub result; replace with sharp-based analysis.",
  };
}

// Fetch paint facts from DB (placeholder; wire to Supabase later)
export async function getPaintFacts(query: string) {
  // Return a safe, deterministic sample while DB wiring is pending.
  const lc = query.toLowerCase();
  const isAlabaster = lc.includes("alabaster") || lc.includes("sw 7008");
  return {
    found: isAlabaster,
    brand: isAlabaster ? "Sherwin-Williams" : null,
    code: isAlabaster ? "SW 7008" : null,
    name: isAlabaster ? "Alabaster" : null,
    undertone: isAlabaster ? "warm" : null,
    notes: isAlabaster ? "Popular soft white; trims or walls." : "No exact match.",
  };
}

// Tool registry descriptor used by API
export const toolDescriptors = [
  {
    name: "analyzeImageForUndertones",
    description: "Given a public image URL, infer undertone and top hex colors.",
    parameters: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
    },
    handler: async ({ url }: { url: string }) => analyzeImageForUndertones(url),
  },
  {
    name: "getPaintFacts",
    description: "Lookup paint brand/code/name facts.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
    handler: async ({ query }: { query: string }) => getPaintFacts(query),
  },
] as const;
