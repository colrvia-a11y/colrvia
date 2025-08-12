import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import PreferencesChat from '@/components/ai/OnboardingChat'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() })
}))

if (typeof window !== 'undefined' && !window.matchMedia) {
  // @ts-ignore
  window.matchMedia = () => ({ matches: false, media: '', onchange: null, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false } })
}

describe('PreferencesChat', () => {
  it('calls /api/ai/preferences and /api/stories', async () => {
    const fetchMock = vi.fn()
      // start
      .mockResolvedValueOnce(new Response(JSON.stringify({ state:{ answers:{}, currentKey:'space', done:false }, utterance:'Q1' })))
      // answer -> done
      .mockResolvedValueOnce(new Response(JSON.stringify({ state:{ answers:{ space:'Living room' }, done:true }, utterance:'Done' })))
      // stories
      .mockResolvedValueOnce(new Response(JSON.stringify({ id:'story1' })))
    // @ts-ignore
    global.fetch = fetchMock

    const { getByText } = render(<PreferencesChat designerId="emily" />)
    await waitFor(()=> expect(fetchMock).toHaveBeenCalledTimes(1))
    fireEvent.click(getByText(/Living room/i))
    await waitFor(()=> expect(fetchMock).toHaveBeenCalledWith('/api/ai/preferences', expect.any(Object)))
    await waitFor(()=> expect(fetchMock).toHaveBeenCalledWith('/api/stories', expect.any(Object)))
  })
})
