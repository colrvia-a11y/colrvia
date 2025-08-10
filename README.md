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
Variant columns: `variant` (`recommended|softer|bolder`) and `parent_id` on `stories`. Generation endpoint: `/api/stories/[id]/variant?type=softer|bolder`.
Algorithm now uses LAB-based lightness shifts + contrast guards (walls/trim >=3:1, accent vs walls >=2:1) in `lib/ai/variants.ts` & helpers in `lib/ai/color.ts`. Tests: `tests/ai.test.ts` (run with `npm test`).
`has_variants` column (optional) plus `lib/db/stories.ts` computes and persists flags for dashboard badges.

## Share Images
OG/Twitter image endpoint: `/api/share/[id]/image` (edge, 1200×630). `generateMetadata` in reveal page attaches dynamic OG image (variant param aware). Place fonts (`/public/fonts/Inter-Regular.ttf`, `Fraunces-SemiBold.ttf`) for branded output; falls back if absent.

## Cinematic Reveal & Motion Accessibility
Overlay component `components/reveal/Cinematic.tsx` triggered in reveal page via `Play Reveal`. Animates title, swatches, narrative lines; accessible exit (Esc / button).
Reduced motion: MotionProvider in `components/theme/MotionSettings.tsx` + toggle on Account page (Accessibility section). When enabled (or OS prefers-reduced-motion) heavy animations & stagger effects are disabled.

## PWA Badge
Account page shows simple installable badge (`app/account/pwa-badge.tsx`).

## Copy Codes
Reveal page “Copy all codes” copies full lines: `Brand — Name (CODE) #hex [role]`.

## Stripe Billing
Checkout session sets `client_reference_id`, `metadata.user_id`, and reuses/creates a Stripe Customer with `metadata.user_id`. Webhook (`/api/stripe/webhook`) resolves user via layered fallbacks (client_reference_id -> session metadata -> customer metadata -> email) and is idempotent (skips if already pro). Replay helper: `scripts/replay-webhook.ts`.

## Brand Assets & OG
Icons under `public/icons/` (replace the provided SVG & generate PNGs). OG share image endpoint gracefully falls back to system fonts if local font files are absent.

## Testing Variants & Contrast
Run `npm test` to execute vitest suite verifying contrast rules & variant shifts.

## Motion Toggle
Account page -> Accessibility section. Toggle persists in localStorage (`colrvia-reduced-motion`).

## TODO / Follow-ups
- Undertone extraction from photos (avgHueSaturationFromPhoto stub)
- Expand catalog-driven variant selection (deltaE nearest matches)
- Add deletion endpoint variant recompute (recomputeHasVariants) triggers on delete
- Provide real branded PNG icon sizes & local font files for OG

Console hints:
If you want PostHog: set NEXT_PUBLIC_POSTHOG_KEY (and optional NEXT_PUBLIC_POSTHOG_HOST).
Run Lighthouse in Chrome DevTools → check PWA + performance.