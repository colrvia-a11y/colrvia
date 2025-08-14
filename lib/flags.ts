// lib/flags.ts
export function isVoiceEnabled() {
  if (typeof window !== 'undefined') {
    const v = (window as any).__VOICE_ENABLED__ // optional runtime flag
    if (typeof v === 'boolean') return v
  }
  const env = process.env.NEXT_PUBLIC_VOICE_ENABLED
  if (env === 'false' || env === '0') return false
  return true
}
