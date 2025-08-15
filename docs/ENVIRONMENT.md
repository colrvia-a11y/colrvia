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

## Via Tools

- `analyzeImageForUndertones(url)` uses **sharp** to downsample and infer undertones.
- `getPaintFacts(query)` reads from Supabase `paint_colors` (name, brand, code, hex, undertone, notes).

Envs needed for paint facts:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

# AI / Via Chat Environment

Set these in **Vercel → Project → Settings → Environment Variables** (and `.env.local` for dev):

- `OPENAI_API_KEY` – required for AI.
- `AI_ENABLE=true` – enables real model calls (omit or set false in CI/local to use safe stub).
- `VIA_CHAT_MODEL` – e.g., `gpt-5` (default).
- `VIA_CHAT_FAST_MODEL` – e.g., `gpt-5-mini` (default).
- `AI_MAX_OUTPUT_TOKENS` – optional, default 300.

Endpoints:
- `POST /api/via/chat` – Via Q&A chat (fast path supported by `{ fast: true }` body). Returns `{ reply, model }`.  (Ref: Via Chat cheatsheet)  

Wire navigation & links:

(Optional) Add a link to /via/chat in your site nav if you have one; otherwise you can open the page directly.

Update README (optional): Add a bullet “Via Chat: /via/chat”.
