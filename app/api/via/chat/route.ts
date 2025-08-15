// app/api/via/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { MODELS, AI } from "@/lib/ai/config";
import { toolDescriptors } from "@/lib/via/tools";

export const runtime = "nodejs";

type Msg = { role: "system" | "user" | "assistant" | "tool"; content: string; name?: string };

function systemPrompt() {
  return [
    "You are Via, Colrvia’s interior paint specialist.",
    "Voice: warm, expert, concise. Avoid jargon unless asked.",
    "Use tools when the user asks about image undertones or brand-specific paint facts.",
    "When unsure about brand codes, ask a brief follow-up before asserting.",
    "Always provide one actionable next step at the end.",
  ].join(" ");
}

async function runToolsIfNeeded(messages: Msg[]) {
  // Simple, conservative tool trigger heuristic while we wire full function-calling:
  // - If content contains http(s):// and 'undertone', call analyzeImageForUndertones
  // - If content contains 'SW ' or looks like a paint query, call getPaintFacts
  const last = messages.slice().reverse().find(m => m.role === "user");
  if (!last) return null;
  const c = last.content || "";
  if (/https?:\/\/\S+/.test(c) && /undertone/i.test(c)) {
    const url = (c.match(/https?:\/\/\S+/) || [])[0]!;
    const res = await (toolDescriptors[0].handler as any)({ url });
    return { name: toolDescriptors[0].name, result: res };
  }
  if (/SW\s?\d{3,4}/i.test(c) || /(alabaster|pure white|sea salt)/i.test(c)) {
    const res = await (toolDescriptors[1].handler as any)({ query: c });
    return { name: toolDescriptors[1].name, result: res };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages = [], fast = false } = body as { messages: Msg[]; fast?: boolean };

    // Dev/test fallback so CI can pass without real AI:
    if (!AI.ENABLED || !process.env.OPENAI_API_KEY) {
      const toolOutcome = await runToolsIfNeeded(messages);
      const base = "AI is disabled in this environment; here’s a concise, helpful reply.";
      const toolLine = toolOutcome
        ? `\nI also ran ${toolOutcome.name} → ${JSON.stringify(toolOutcome.result)}`
        : "";
      return NextResponse.json({
        reply: `${base}${toolLine}\nNext step: ask me about a room, lighting, or paste a photo URL for undertones.`,
        model: fast ? MODELS.CHAT_FAST : MODELS.CHAT,
        usedTool: toolOutcome?.name || null,
      });
    }

    const openai = getOpenAI();
    const model = fast ? MODELS.CHAT_FAST : MODELS.CHAT;

    // Opportunistically enrich with a tool result (we’ll move to full tool-calling later).
    const toolOutcome = await runToolsIfNeeded(messages);
    const toolNote = toolOutcome
      ? `\n\nTool context (${toolOutcome.name}): ${JSON.stringify(toolOutcome.result)}`
      : "";

    const userConcat = messages
      .filter(m => m.role !== "system")
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const prompt = `${systemPrompt()}\n\nConversation:\n${userConcat}${toolNote}\n\nReply as Via.`;

    // Use Responses API if available; fall back to classic completions
    const resp: any = await openai.responses.create({
      model,
      input: prompt,
      max_output_tokens: AI.MAX_OUTPUT_TOKENS,
    });

    // Pull the text response
    const reply =
      (resp.output && Array.isArray(resp.output) && resp.output[0]?.content?.[0]?.text) ||
      resp.output_text ||
      "Sorry — I couldn’t compose a reply.";

    return NextResponse.json({ reply, model, usedTool: toolOutcome?.name || null });
  } catch (err: any) {
    console.error("via/chat error", err?.message || err);
    return NextResponse.json({ error: "VIA_CHAT_FAILED" }, { status: 500 });
  }
}
