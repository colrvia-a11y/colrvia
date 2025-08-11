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
### Palette Normalization & Backfill
#### Diagnostics
```
-- Empty palettes
select count(*) from public.stories where jsonb_typeof(palette)='array' and jsonb_array_length(palette)=0;
-- Sample rows
select id, jsonb_array_length(palette) as len, brand, created_at from public.stories order by created_at desc limit 10;
```
Palettes now persist as a strict ordered array of 5 swatches (`walls, trim, cabinets, accent, extra`). Normalization logic in `lib/palette.ts` (`normalizePalette`) coerces legacy shapes (role-keyed objects, colorN keys, string arrays). Invalid inputs trigger 422 on creation.

Backfill script:
```
tsx scripts/backfill-palettes.ts
```
SQL sanity checks:
```
select count(*) from public.stories where jsonb_typeof(palette) <> 'array' or (jsonb_typeof(palette)='array' and jsonb_array_length(palette)=0);
select id, jsonb_typeof(palette) palette_type, case when jsonb_typeof(palette)='array' then jsonb_array_length(palette) end palette_len, brand, created_at from public.stories order by created_at desc limit 20;
```
Variant columns: `variant` (`recommended|softer|bolder`) and `parent_id` on `stories`.

Generation endpoint (POST only): `POST /api/stories/:id/variant` with JSON body:
```
{ "mode": "softer" | "bolder", "palette": DecodedSwatch[] }
```
Response:
```
{ "variant": DecodedSwatch[] }
```
Notes:
1. `palette` is optional (server falls back to stored palette). If supplied, it is decoded & validated; malformed shapes yield 422.
2. Deprecated: previous `GET /api/stories/:id/variant?type=...` now returns `405 USE_POST`.
3. Rate limiting: in-memory best-effort limit of 6 requests/minute and 40/hour per user (429 with `{ error:"RATE_LIMITED", scope, retryAfter }`).
4. Logs (`VARIANT_POST_*`) trace lifecycle: START, BAD_INPUT, RATE_LIMIT, OK, FAIL.

Algorithm uses LAB-based lightness shifts + contrast guards (walls/trim >=3:1, accent vs walls >=2:1) in `lib/ai/variants.ts` & helpers in `lib/ai/color.ts`.
Tests: `tests/ai.test.ts` + decoder/contract tests (`tests/variant-route.test.ts`, `tests/variant-post.test.ts`).
`has_variants` column (optional) plus `lib/db/stories.ts` computes & persists flags for dashboard badges.

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

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_SITE_URL | yes | Base site origin for absolute URL generation |
| NEXT_PUBLIC_POSTHOG_KEY | optional | Analytics key for PostHog |
| NEXT_PUBLIC_POSTHOG_HOST | optional | Override host (defaults to https://app.posthog.com) |
| NEXT_PUBLIC_SUPABASE_URL | yes | Supabase project URL (client & server) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | yes | Supabase anonymous key |
| SUPABASE_SERVICE_ROLE | yes (server ops) | Service role key for privileged server tasks (never expose client-side) |
| STRIPE_SECRET_KEY | yes (billing) | Server key for Stripe integration |
| STRIPE_WEBHOOK_SECRET | yes (billing) | Webhook verification secret |

## Seed Sherwin-Williams Catalog
Seed the paint catalog into Supabase (table `public.catalog_sw`).

1. Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=<your-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role>
```
2. Run:
```
npm run seed:sw
```
3. Verify row count:
```
select count(*) from public.catalog_sw;
```
The script reads `db/seeds/catalog_sw.json` and upserts (on conflict code) in batches of 500. Hex values are validated (`#RRGGBB`). Non‑conforming rows are skipped and summarized. RLS allows public read (anon+authenticated) and blocks writes.


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

### Voice & AI
- Voice input/output uses the browser Web Speech APIs. Works best in Chrome. Gracefully falls back to typing.
- To enable designer phrasing via LLM, add `OPENAI_API_KEY` in Vercel → Project → Settings → Environment Variables. If unset, onboarding still works deterministically.
- **Quick replies**: For questions with predefined options, chips appear under the chat. Single-select submits immediately; multi-select supports up to the shown max, then Continue.
 - **Prompt variety**: Seeded templates provide varied greetings, acknowledgements, and question transitions; with an OpenAI key we lightly rewrite while preserving deterministic structure fallback.

### AI Design Orchestrator
- Server-only palette generator that filters SW/Behr catalogs, assigns roles (60/30/10 + trim/ceiling), and **optionally** lets OpenAI pick among safe candidates.
- Env: set `OPENAI_API_KEY` (Vercel → Project → Settings → Environment Variables) to enable LLM assistance. Without it, the generator runs deterministically.
- The `/api/stories` create route now calls the orchestrator if no `palette` is provided in the request body.
- **Transitional compatibility**: Legacy roles (`walls`, `trim`, `cabinets`, `accent`, `extra`) are still stored. Server maps orchestrator roles (`primary`, `secondary`, `accent`, `trim`, `ceiling`) → legacy (primary→walls, secondary→cabinets, accent→accent, trim→trim, ceiling→extra). To accept a client palette in the new schema send it as `palette_v2` with `AI_ALLOW_CLIENT_PALETTE=true`; invalid palettes return 422.

#### Example `palette_v2` payload
```json
{
	"palette_v2": {
		"swatches": [
			{ "role": "primary",  "brand": "Sherwin-Williams", "code": "XXXX", "name": "Some Name", "hex": "#dde0e3" },
			{ "role": "secondary","brand": "Sherwin-Williams", "code": "YYYY", "name": "Other",     "hex": "#aab0b5" },
			{ "role": "accent",   "brand": "Sherwin-Williams", "code": "ZZZZ", "name": "Pop",       "hex": "#223344" },
			{ "role": "trim",     "brand": "Sherwin-Williams", "code": "WWWW", "name": "White",     "hex": "#f7f7f5" },
			{ "role": "ceiling",  "brand": "Sherwin-Williams", "code": "VVVV", "name": "Ceiling",   "hex": "#f4f4f2" }
		],
		"placements": { "primary":60, "secondary":30, "accent":10, "trim":5, "ceiling":5 }
	}
}
```

### Onboarding persistence
- Each onboarding run creates an `intakes` row keyed by a secure, httpOnly cookie token (no auth required).
- Routes: `POST /api/intakes/start`, `GET /api/intakes/resume`, `POST /api/intakes/patch`, `POST /api/intakes/finalize`.
- State (answers + chat messages) is saved after every turn; on finalize the created `story_id` is linked and the cookie cleared.

### Analytics (optional)
- PostHog instrumentation is gated by `NEXT_PUBLIC_POSTHOG_KEY` and never sends raw free‑text answers.
- Events: `designer_select`, `intake_start`, `intake_resume`, `onboarding_question`, `onboarding_answer` (choices or length only), `voice_toggle`, `mic_toggle`, `tts_speak`, `onboarding_complete`.
- Env vars:
	- `NEXT_PUBLIC_POSTHOG_KEY` (key)
	- `NEXT_PUBLIC_POSTHOG_HOST` (optional host, defaults US cloud)