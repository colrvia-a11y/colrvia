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
OG/Twitter image endpoint: `/api/share/[id]/image` (edge, 1200×630). `generateMetadata` in reveal page attaches dynamic OG image (variant param aware). Place fonts (`/public/fonts/Inter-Regular.ttf`, `Fraunces-SemiBold.ttf`) for branded output; falls back if absent. Text normalization (length cap, trimming, fallbacks) covered by `buildOgText` in `lib/og.ts` with tests.

## Cinematic Reveal & Motion Accessibility
Overlay component `components/reveal/Cinematic.tsx` triggered in reveal page via `Play Reveal`. Animates title, swatches, narrative lines; accessible exit (Esc / button).
Reduced motion: MotionProvider in `components/theme/MotionSettings.tsx` + toggle on Account page (Accessibility section). When enabled (or OS prefers-reduced-motion) heavy animations & stagger effects are disabled.

### Motion Tokens & Helpers
CSS custom properties (see `styles/tokens.css`) define durations & easing. Utility classes (`transition-standard|fast|slow`) and a `FadeIn` component (`components/motion/FadeIn.tsx`) provide consistent entrance motion that respects the reduced motion toggle. When `reduced` is true, animations render instantly. Prefer using `FadeIn` or framer-motion with the `useReducedMotion` hook rather than ad‑hoc keyframes.

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

## UI Component Tests
Initial UI tests live in `tests/ui/`. Add new tests colocated under `tests/ui/your-component.test.tsx`. The test environment is jsdom (configured in `vite.config.ts`) with jest‑dom assertions (`tests/setup.ts`). Keep component APIs small and accessible (roles / aria-* used in assertions).

## Component Library Snapshot
Key primitives: `Button`, `Chip`, `Progress`, `DesignerCard`, `SummaryCard`, `SwatchCard`, `PaletteGrid`, `StoryActionBar`, `CopyToast`. Each aims for:
1. Minimal props surface
2. Tailwind + token-driven styling only
3. Accessibility baked in (aria roles, focus ring, roving tabindex where needed)
4. Motion respect (reduced motion guard)

When adding a new component, consider: name, tokens used, motion behavior, test coverage (happy path + one edge case), and copy clarity.

## Copy & Microcopy Guidelines
Tone: calm, expert, encouraging. Avoid jargon (“palette generation” -> “your palette”). Use sentence case except brand tokens or proper nouns. Keep primary buttons action-oriented (e.g. “Generate my palette”).

## Motion Toggle
Account page -> Accessibility section. Toggle persists in localStorage (`colrvia-reduced-motion`).

## TODO / Follow-ups
- Undertone extraction from photos (avgHueSaturationFromPhoto stub)
- Expand catalog-driven variant selection (deltaE nearest matches)
- Add deletion endpoint variant recompute (recomputeHasVariants) triggers on delete
- Provide real branded PNG icon sizes & local font files for OG (self-host Inter & Fraunces; add preload hints) – IN PROGRESS (fonts scaffolded)
- Add additional UI interaction tests (copy codes, variant keyboard nav, cinematic lifecycle)
- Start flow: optional designer lens re-introduction (currently defaulting to Emily)
- Single-photo upload constraint (enforce / show replace state) – CURRENT: silent replace
- Carousel: ensure focus-visible ring theming – DONE (keyboard region + instructions)
- Motion: audit stray keyframes (keep fadeIn, swatchIn, blob) & document reduced-motion override – PARTIAL
- Dark theme polish pass (adjust brand hover, surface contrast, focus ring) – PARTIAL (tokens updated)
- Contrast audit for accent on brand / highlight on surface combinations – PLANNED
- Environment variable table implementation in README – PLANNED

### Task 8 (PWA / OG polish) Status
✔ Public OG image endpoint (no auth) at `/api/share/[id]/image` for social cards.
✔ Added global metadata (Open Graph, Twitter, icons) in `app/layout.tsx`.
✔ Theme-color meta tags for light & dark to tint address bar.
↺ Replace placeholder icons in `public/icons/` with production PNGs (192 / 512 + maskable) and update `manifest.ts` if colors/brand shift.
↺ (Optional) Add additional splash screen sizes if targeting iOS install polish.

## UX Quality Checklist (Task 10)
Snapshot of current status (✓ done, △ partial, ○ not started):

Accessibility
- ✓ Keyboard: start flow, reveal swatches (roving tabindex), cinematic dialog (focus trap / Esc), carousel horizontal scroll keys
- ✓ ARIA: progressbar, tablist for variants, live region toast (Copy), dialog semantics, carousel region + instructions
- ✓ Reduced motion toggle persists and guards stagger/animations
- △ Color contrast: core text & buttons meet WCAG AA; verify accent-on-brand combos (manual pass needed)

Performance
- ✓ Next.js App Router, edge OG image generation
- △ Lighthouse pass (target PWA 90+; run locally after adding real icons)
- △ Image optimization: add <Image> where large images are introduced (currently minimal external imagery)

Motion
- ✓ Motion tokens & helper classes centralize durations/easing
- ✓ FadeIn and framer-motion variants respect reduced motion
- △ Audit any remaining custom keyframes (keep only fadeIn if actually needed)

Copy & Tone
- ✓ Start flow steps rewritten for clarity (Task 9)
- ✓ Action buttons use imperative, concise labels
- △ Narrative generation phrasing future refinement (consistency in tense & voice)

PWA
- ✓ Manifest + service worker offline fallbacks
- ✓ Theme-color meta (light/dark)
- △ Real production icon assets (currently placeholders)
- ○ iOS splash screens (optional)

Testing
- ✓ AI logic & UI component baseline tests (contrast helpers, Chip, Progress)
- △ Add tests: swatch copy interaction, variant tab keyboard, cinematic open/close (future)

Data & Analytics
- ✓ PostHog events for cinematic & sharing
- △ Expand key funnel events (start step change, palette generation success/fail)

Security & Privacy
- ✓ Auth gate on story reveal data (except public OG image which only exposes palette & title)
- △ Rate limiting / abuse protection (consider RPS or token bucket for generation endpoints)

Deployment Readiness
- △ Add environment variable table (see below) and confirm all required keys documented

### Environment Variables (Planned Table)
| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_SITE_URL | yes | Base site origin for absolute URL generation |
| NEXT_PUBLIC_POSTHOG_KEY | optional | Analytics key for PostHog |
| NEXT_PUBLIC_POSTHOG_HOST | optional | Override host (defaults to https://app.posthog.com) |
| SUPABASE_URL | yes | Supabase project URL |
| SUPABASE_ANON_KEY | yes | Supabase anonymous key |
| STRIPE_SECRET_KEY | yes (billing) | Server key for Stripe integration |
| STRIPE_WEBHOOK_SECRET | yes (billing) | Webhook verification secret |

## Screenshots (Task 10)
Add real PNGs (or compressed WebP) under `public/screenshots/` and embed here for quick visual QA. Suggested shots:
1. Start – Step 1 (Designer selection)
2. Start – Step 2 (Space choices)
3. Start – Step 3 (Photo & summary)
4. Reveal – Recommended variant (palette grid + narrative)
5. Reveal – Cinematic overlay (light & dark)
6. Account – Accessibility (motion toggle)
7. Install prompt (PWA)

Example markdown (replace when assets exist):
```
![Start Step 1](public/screenshots/start-step1.png)
![Reveal Palette](public/screenshots/reveal-palette.png)
```

Screenshot capture tips:
- Use 1440px width light mode then dark mode where relevant.
- Hide dev tools / browser UI for clean framing.
- Run with production build (`next build && next start`) for realistic styling & fonts.

## Run / Develop
Basic commands:
```
npm install
npm run dev   # local development
npm test      # vitest suite
npm run build # production build
```

If modifying motion tokens, re-run Lighthouse to ensure no layout shift regressions (CLS). GitHub Action workflow (`.github/workflows/ci.yml`) now runs install, type-check, lint, test, and build on push / PR.

### Removed Legacy Endpoints (Projects → Stories Migration)
Legacy project endpoints (`/api/projects/*`) and related UI (project dashboard, project detail page, save-to-project widget, project sharing & image upload routes) were fully retired in favor of a simpler, story‑centric model.

Redirects ensure old bookmarks still work:
```
/projects            → /dashboard (301)
/project/:anything*  → /dashboard (301)
```

If you previously saved a Color Story inside a Project, those stories now surface directly in the dashboard (migration path relies on existing `stories` table; no project container concept remains). Any stale client code calling `/api/projects` should be removed—tests will fail if you reintroduce those routes.

Removed files (illustrative list):
- `app/api/projects/*` (all routes)
- `app/(app)/project/[id]/*` (project detail + share controls + palette generator)
- `components/SaveStoryToProject.tsx`
- `app/(app)/dashboard/new-project-form.tsx`

Add new story flows using `/api/stories` endpoints directly. Public sharing now relies on existing story reveal / OG mechanisms (project-specific public slug logic removed).

### New Tests
Added `tests/og.test.ts` for OG text normalization.

Console hints:
If you want PostHog: set NEXT_PUBLIC_POSTHOG_KEY (and optional NEXT_PUBLIC_POSTHOG_HOST).
Run Lighthouse in Chrome DevTools → check PWA + performance.