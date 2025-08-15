# Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production, Preview, and Development as needed):

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

> Never paste secrets into chat or client code. The service role key must only be used on the server (API routes, server utilities).

## Domains
- Production domain: https://colrvia.com (canonical)
- www.colrvia.com → redirects to apex (via Vercel Domain setting or middleware)
- Preview builds can use *.vercel.app without redirects

### Sanity check
After setting the envs and redeploying, POST `/api/stories` should **not** return `{"error":"ENV_MISSING"}`.
If you still see `{"error":"CATALOG_EMPTY"}`, seed at least five valid rows in `catalog_sw`.
