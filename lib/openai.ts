import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Throw only when a route is actually invoked, not at module import time
    throw new Error("Server misconfigured: OPENAI_API_KEY is missing.");
  }
  _client = new OpenAI({ apiKey });
  return _client;
}
