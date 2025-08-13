// lib/flags.ts
export const flags = {
  billing: (() => {
    const v = (process.env.NEXT_PUBLIC_FEATURE_BILLING || '').toLowerCase()
    return v === '1' || v === 'true' || v === 'on'
  })(),
}

export function isPreviewEnv(): boolean {
  return process.env.VERCEL_ENV === 'preview'
}
export function isAuthDisabled(): boolean {
  return isPreviewEnv() || process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'
}
export function allowGuestWrites(): boolean {
  if (isPreviewEnv()) return true
  return process.env.ALLOW_GUEST_WRITES === 'true'
}
