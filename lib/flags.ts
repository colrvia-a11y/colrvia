// lib/flags.ts
export const flags = {
  billing: (() => {
    const v = (process.env.NEXT_PUBLIC_FEATURE_BILLING || '').toLowerCase()
    return v === '1' || v === 'true' || v === 'on'
  })(),
}
