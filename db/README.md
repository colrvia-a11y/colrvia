# Supabase SQL

Run `supabase.sql` once in the Supabase SQL Editor after deploying new migrations. Append-only strategy: new blocks added to bottom.

Latest additions:
- stories table (color stories storage)
- profiles table (plan tiers: free/pro) + trigger to auto-create on user signup

Steps:
1. Open Supabase project → SQL Editor.
2. Paste entire contents of `db/supabase.sql` and Run (safe: uses `if not exists`).
3. Confirm `stories` and `profiles` tables exist and RLS policies applied.
4. Test by signing in and calling /api/stories.

### Sprint E (Variants) Migration
Variant support adds `variant` and `parent_id` columns plus an index. Re-run the full `supabase.sql` or just the appended block at the end (it's idempotent with `if not exists`).
