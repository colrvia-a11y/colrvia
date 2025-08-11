# Environment Variables

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
