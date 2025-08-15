# Environment Variables (Colrvia AI)

Set these in **Vercel → Project → Settings → Environment Variables** (and your local `.env.local` for dev):

Required:
- `OPENAI_API_KEY` — OpenAI key for all LLM calls.
- `AI_ENABLE` — set to `true` to allow server to call OpenAI.

Model Map (safe defaults provided):
- `VIA_CHAT_MODEL` — default Via chat model (e.g., `gpt-5`).
- `VIA_CHAT_FAST_MODEL` — fast Via chat model (e.g., `gpt-5-mini`).
- `VIA_INTERVIEW_MODEL` — interview helper/explain model (e.g., `gpt-5-mini`).
- `VIA_PALETTE_MODEL` — palette generation model (e.g., `gpt-5`).

Optional:
- `OPENAI_MODEL` — legacy/general chat model used by older paths.
- `OPENAI_VISION_MODEL`, `OPENAI_REALTIME_MODEL`, etc.

> Never paste secrets in chat. Store them only in Vercel envs.

## Interview Routing

- `POST /api/interview` with `{ "mode": "realtime" }` → returns `{ sessionEndpoint, offerEndpoint, model }`.
- `POST /api/interview` with `{ "mode": "form", "questionText": "...", "answers": { ... } }` → returns `{ explanation, model }`.

### Envs
- `OPENAI_REALTIME_MODEL` (default: `gpt-4o-mini`) – used for live talk.
- `VIA_INTERVIEW_MODEL` (default: `gpt-5-mini`) – used for text form explains.
