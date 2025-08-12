// lib/url.ts
export function getBaseUrl() {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site;
  const vercel = process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : 'http://localhost:3000';
}

export function getAuthCallbackUrl() {
  return `${getBaseUrl()}/auth/callback`;
}
