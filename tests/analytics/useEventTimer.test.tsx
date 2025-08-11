import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEventTimer } from '@/lib/analytics/useEventTimer'

describe('useEventTimer', () => {
  it('measures elapsed ms between start and stop; peek reflects duration', () => {
    vi.useFakeTimers()
    const { result } = renderHook(()=> useEventTimer())
    act(()=> { result.current.start() })
    act(()=> { vi.advanceTimersByTime(250) })
    expect(result.current.peek()).toBeGreaterThanOrEqual(250)
    let stopped:number = 0
    act(()=> { stopped = result.current.stop() })
    expect(stopped).toBeGreaterThanOrEqual(250)
    expect(result.current.peek()).toBeGreaterThanOrEqual(250)
    vi.useRealTimers()
  })
})
