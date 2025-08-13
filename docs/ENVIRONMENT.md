# Environment Variables (Colrvia)

Set these in **Vercel → Project → Settings → Environment Variables** (all environments), and in local `.env.local` when developing.

## Required
- `OPENAI_API_KEY` — OpenAI server key (server only).
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase URL (client + server).
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server only; **never** expose in browser).

## Recommended
- `COLRVIA_LLM_MODEL` — text model for palette generation/onboarding (e.g., `gpt-5`, `gpt-5-mini`, `gpt-5-nano`).
- `OPENAI_VISION_MODEL` — vision model for image analysis (default: `gpt-4o`).
- `OPENAI_REALTIME_MODEL` — realtime voice model (default: `gpt-4o-realtime-preview-2024-12-17`).
- `OPENAI_TTS_VOICE` — optional default voice name for realtime sessions.

## Other app vars (if used)
- `AI_ENABLE`, `AI_MAX_OUTPUT_TOKENS`
- `NEXT_PUBLIC_ONBOARDING_MODE` (UI behavior)
- PostHog: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_KEY`, `POSTHOG_HOST`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- Sentry: `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT`

## Guest / Auth Flags
- `NEXT_PUBLIC_AUTH_DISABLED` — locally force guest mode.
- `ALLOW_GUEST_WRITES` — allow guest writes outside preview.
- `VERCEL_ENV=preview` (Vercel-provided) auto-enables guest mode & disables auth gating.

## Legacy / scheduled removal
- `OPENAI_MODEL` — replaced by `COLRVIA_LLM_MODEL` (and `OPENAI_VISION_MODEL` for vision).
- `SUPABASE_SERVICE_ROLE` — replaced by `SUPABASE_SERVICE_ROLE_KEY`.

## Quick audit
Run:
```bash
npm run env:scan
```
Compare output against this document and clean up Vercel envs accordingly.

## Health check
`GET /api/health/auth` returns non-secret flag summary to confirm environment setup.

Example:
```json
{
  "vercelEnv": "preview",
  "authDisabled": true,
  "allowGuestWrites": true,
  "env": { "NEXT_PUBLIC_SUPABASE_URL": true, "SUPABASE_SERVICE_ROLE_KEY": true }
}
```

