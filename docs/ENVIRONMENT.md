# Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables** (and your local `.env.local` if developing):

- `OPENAI_API_KEY`: required for any OpenAI calls.
- `AI_ENABLE`: set to `true` to allow server to call OpenAI.
- `VIA_PALETTE_MODEL`: **`gpt-5`**  ← palette generation model used by the orchestrator.
- (optional) `OPENAI_MODEL`: default chat/narrative model (fallback for non-palette places).
- (optional) `OPENAI_VISION_MODEL`, `OPENAI_REALTIME_MODEL`, etc., if you use vision/realtime.

> Safety: never paste secrets in chat; keep them in Vercel envs.
