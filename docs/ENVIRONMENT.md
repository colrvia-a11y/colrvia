# Environment Variables

# Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production + Preview):
Required runtime variables:

- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key for client
- SUPABASE_SERVICE_ROLE_KEY: Service role key (never expose to client)
- STRIPE_SECRET_KEY: Server secret for Stripe
- STRIPE_PRICE_ID: Subscription price ID
- STRIPE_WEBHOOK_SECRET: Webhook signing secret

Optional:
- STRIPE_API_VERSION: Pin Stripe API version
- OPENAI_API_KEY: Enables enhanced AI designer (otherwise deterministic local logic only)
- AI_ALLOW_CLIENT_PALETTE: "true" to accept a client-provided palette_v2 payload (dev/testing only). Defaults to false.

### AI Behavior
- If `OPENAI_API_KEY` is **not** set, palette generation falls back to deterministic logic.
- If set, we use a constrained LLM pass with a single automatic correction attempt when validation fails.

Development only helpers (scripts/): none strictly required.

## AI Designers
If OPENAI_API_KEY is absent, onboarding uses a deterministic finite state machine and local palette seed so the flow always works offline.
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase (Project Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (public, still treat as sensitive)
- `SUPABASE_SERVICE_ROLE_KEY` — service_role (server-only; NEVER expose client-side)
- `NEXT_PUBLIC_ONBOARDING_MODE=api` — enables live API-driven intake
- `STRIPE_SECRET_KEY` — Stripe server secret
- `STRIPE_PRICE_ID` — Subscription price ID
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- Optional:
	- `OPENAI_API_KEY` — tone polish & LLM assist
	- `AI_ALLOW_CLIENT_PALETTE` — "true" to accept `palette_v2` payloads (dev/testing)
	- `POSTHOG_KEY` / `POSTHOG_HOST` — analytics (server)
	- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` — client analytics

After adding or changing envs, redeploy the project.

### Notes
- Without `OPENAI_API_KEY` the system uses deterministic palette logic.
- Service role key is required for backfill scripts & admin endpoints; never log it.

