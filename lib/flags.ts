// lib/flags.ts
export function isVoiceEnabled() {
  if (typeof window !== 'undefined') {
    const qs = new URLSearchParams(window.location.search)
    const q = qs.get('voice')
    if (q === 'off') {
      try {
        localStorage.setItem('voice', 'off')
      } catch {}
      return false
    }
    if (q === 'on') {
      try {
        localStorage.setItem('voice', 'on')
      } catch {}
      return true
    }
    const v = (window as any).__VOICE_ENABLED__ // optional runtime flag
    if (typeof v === 'boolean') return v
    try {
      const stored = localStorage.getItem('voice')
      if (stored === 'off') return false
      if (stored === 'on') return true
    } catch {}
  }
  const env = process.env.NEXT_PUBLIC_VOICE_ENABLED
  if (env === 'false' || env === '0') return false
  return true
}
