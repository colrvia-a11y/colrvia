# Colrvia

## PWA
Manifest route at `/manifest.webmanifest` (Next auto). Service worker in `public/sw.js` precaches `/` and `/offline` and provides network-first navigation with offline fallback. Install prompt banner component `components/pwa/InstallPrompt.tsx` (render on app pages). Icons under `public/icons` (supply real PNGs 192/512 + maskable variants). Update theme/background colors in `app/manifest.ts` if brand evolves.

Testing offline:
1. Build & run locally.
2. Open DevTools → Application → Service Workers (check it’s active)
3. Toggle offline → navigate → offline page appears.

## Dark Mode
Using `next-themes` with class strategy. Light = `light`, dark = `theme-dark`. Toggle component: `components/ui/ThemeToggle.tsx` sets theme; tokens rely on Tailwind + custom classes.

## Analytics
Client PostHog init in `lib/analytics.ts` (lazy). Provide env `NEXT_PUBLIC_POSTHOG_KEY` (optional) & `NEXT_PUBLIC_POSTHOG_HOST` (defaults). Events used: `variant_open`, `share_image_download`, `cinematic_play`, `cinematic_exit` (more TBD). Vercel page analytics via `<Analytics />` in layout.

## Variants
Variant columns: `variant` (`recommended|softer|bolder`) and `parent_id` on `stories`. Generation endpoint: `/api/stories/[id]/variant?type=softer|bolder`. Basic rule-based tweaks in `lib/ai/variants.ts` (TODO: improve undertone-aware selection & contrast guarantee). Cached in DB after first generation.

## Share Images
OG/Twitter image endpoint: `/api/share/[id]/image` (edge, 1200×630). `generateMetadata` in reveal page attaches dynamic OG image (variant param aware). Place fonts (`/public/fonts/Inter-Regular.ttf`, `Fraunces-SemiBold.ttf`) for branded output; falls back if absent.

## Cinematic Reveal
Overlay component `components/reveal/Cinematic.tsx` triggered in reveal page via `Play Reveal`. Animates title, swatches, narrative lines; accessible exit (Esc / button). Respects user reduced-motion (TODO: gate animations via media query hook).

## PWA Badge
Account page shows simple installable badge (`app/account/pwa-badge.tsx`).

## Copy Codes
Reveal page “Copy all codes” copies full lines: `Brand — Name (CODE) #hex [role]`.

## TODO / Follow-ups
- Improve variant algorithm (undertones, brand catalogs, contrast >=3:1 validation pass)
- Add reduced-motion guard to Cinematic + MagneticHover
- Persist hasVariants flag materialized view or computed query
- Stripe webhook real tier mapping (currently placeholder)
- Replace placeholder icons with branded assets

Console hints:
If you want PostHog: set NEXT_PUBLIC_POSTHOG_KEY (and optional NEXT_PUBLIC_POSTHOG_HOST).
Run Lighthouse in Chrome DevTools → check PWA + performance.