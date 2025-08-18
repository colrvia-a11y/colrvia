# Migration Map (Flutter → Next.js)

| Flutter Screen / File                | Next.js Route / Component                    | Notes |
|-------------------------------------|----------------------------------------------|------|
| `lib/screens/home_screen.dart`      | `/` (`app/page.tsx`)                         | Hero + CTAs |
| `lib/screens/interview_intro...`    | `/start/interview-intro`                     | Two clear cards with copy + buttons |
| `lib/screens/text_interview...`     | `/interview/text` + `components/InterviewForm` | JSON Schema-driven with `showIf` logic |
| `lib/screens/voice_interview...`    | `/via` + `components/ChatUI`                 | Intro text hides after first message; peach→white gradient; white input with black text |
| `lib/screens/reveal_screen.dart`    | `/reveal` + `components/StoryCard`           | Fetch via `/api/story?id=...` |
| `lib/screens/dashboard_screen.dart` | `/dashboard`                                 | Placeholder |
| `lib/screens/billing_screen.dart`   | `/billing`                                   | Stripe later |
| `lib/screens/auth_callback...`      | `/auth/callback` (route handler)             | Preserves `redirectTo` so post-login flow returns to reveal |
| `lib/widgets/gradient_header.dart`  | `components/GradientHeader.tsx`              | Peach gradient tuned for contrast |
| `lib/widgets/choice_chip_group.dart`| `components/ChoiceChipGroup.tsx`             | Single + multi select chips |
| `lib/widgets/story_card.dart`       | `components/StoryCard.tsx`                   | Palette swatches + notes |
| `lib/services/api_service.dart`     | `/api/via` and `/api/story`                  | Replace mocks with real engines + Supabase |

## Known Issues Fixed
- **Navbar Via link** now points to `/via` and renders the chat.
- **Palette generation pipeline** is centralized in `/api/story` and `/api/via` for clearer handoff.
- **Auth redirect**: `?redirectTo=` param ensures users return to `/reveal` after sign-in instead of restarting the interview.

## Theming
- Brand colors: `--brand-peach: #f2b897`, `--brand-green: #143d2b` (adjust as needed).
- Input fields: black text on white for readability.
- Header hidden on mobile per request.

## Wiring Supabase (outline)
1. Copy your SQL tables & policies into Supabase.
2. Create a server action or API route using `@supabase/ssr` to insert/read `stories`.
3. Replace the in-memory store in `/api/story` with Supabase queries.

