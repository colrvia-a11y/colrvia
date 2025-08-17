# Single-Room Text Interview v2

This app uses a schema-driven interview (Single-Room Color Interview). See `lib/realtalk/questionnaire.ts` for steps, branching, and labels. The chat UI supports single/multi chips, boolean chips, free text, and "tags" (array of strings). On completion we still POST `/api/stories` with both the full `answers` and a `answersV1Legacy` shim for backward compatibility during rollout.
