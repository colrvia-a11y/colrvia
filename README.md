# Colrvia — Next.js Migration

A clean Next.js 14 (App Router) port of your Flutter app with improved mobile-first UI/UX, Supabase-ready auth, a conditional interview form, and a Via chat page.

## Quick Start

```bash
pnpm i  # or npm i / yarn
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

Open http://localhost:3000

## What’s Included

- **App Router** with routes:
  - `/` home
  - `/start/interview-intro` options page
  - `/via` chat with Via (intro hides after first message; peach→white gradient, dark-green headings)
  - `/interview/text` conditional interview (JSON Schema-driven with `showIf`)
  - `/reveal` palette reveal, fetches from `/api/story`
  - `/dashboard`, `/billing` placeholders
  - `/auth/callback` honors `?redirectTo=/reveal?id=…` to fix post-login route
- **UI/UX**
  - No header on mobile
  - Stronger peach (#f2b897) at top, smooth gradient to white near bottom
  - Inputs are black text on white
  - Design tokens via CSS variables (brand peach/green/ink/sand)
  - Soft cards, rounded-3xl, subtle shadow
- **APIs**
  - `/api/via` calls OpenAI if `OPENAI_API_KEY` is present; otherwise returns a helpful mock
  - `/api/story` creates & reads a mock palette; replace with Supabase logic
- **Supabase**
  - `lib/supabase/{client,server}.ts` helpers
  - Add RLS policies/tables from your existing SQL and wire CRUD in `/api/story`

## Where to Connect Real Data

- **Via Palette Engine**: Replace `/api/via` with your real prompt + tools pipeline.
- **Interview → Palette**: In `/api/story`, persist answers to Supabase and call your engine, then store the resulting palette JSON.
- **Auth redirect**: Keep using `redirectTo=` to land users on `/reveal` after sign‑in.

## Styling Notes

- Colors live in `app/globals.css` as CSS variables. Adjust once, everywhere updates.
- Tailwind utility classes keep everything consistent and fast to tweak.

## Next Steps

- Install and configure your preferred component lib (shadcn/ui) if desired.
- Add image upload on Via for undertone analysis.
- Gate “Save” behind auth; give 1 free story, then Stripe paywall on `/billing`.
- Import your Supabase SQL (tables & policies) and replace the in‑memory store.

---

Built for Colrvia’s brand and flows. Enjoy ✨
