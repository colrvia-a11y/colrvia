import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import PreferencesChat from '@/components/ai/OnboardingChat'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}))

// jsdom matchMedia mock
if (typeof window !== 'undefined' && !window.matchMedia) {
  // @ts-ignore
  window.matchMedia = () => ({ matches: false, media: '', onchange: null, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false } })
}

// Ensure API mode
// @ts-ignore
process.env.NEXT_PUBLIC_ONBOARDING_MODE = 'api'

describe('OnboardingChat API mode', () => {
  it('calls /api/intakes/step and /api/intakes/finalize', async () => {
    const fetchMock = vi.fn()
      // start
      .mockResolvedValueOnce(new Response(JSON.stringify({ sessionId:'sess1', step:{ type:'question', node:{ id:'start', question:'Brand?', options:['Sherwin-Williams','Behr'] }}})))
      // step -> done
      .mockResolvedValueOnce(new Response(JSON.stringify({ step:{ type:'done' } })))
      // finalize
      .mockResolvedValueOnce(new Response(JSON.stringify({ input:{ brand:'Sherwin-Williams' }, palette_v2:{ swatches:[] } })))
    // @ts-ignore
    global.fetch = fetchMock

    const { getByText } = render(<PreferencesChat designerId="emily" />)
    // allow initial effect
    await waitFor(()=> expect(fetchMock).toHaveBeenCalledTimes(1))
    fireEvent.click(getByText(/Sherwin/i))
    await waitFor(()=> expect(fetchMock).toHaveBeenCalledWith('/api/intakes/step', expect.any(Object)))
    await waitFor(()=> expect(fetchMock).toHaveBeenCalledWith('/api/intakes/finalize', expect.any(Object)))
  })
})
