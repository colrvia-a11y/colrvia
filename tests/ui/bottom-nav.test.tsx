import React from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render } from '@testing-library/react'
vi.mock('next/navigation', () => ({ usePathname: () => '/home' }))

beforeAll(()=>{
  // @ts-ignore
  window.matchMedia = window.matchMedia || function(query){
    return { matches:false, media: query, addEventListener:()=>{}, removeEventListener:()=>{} }
  }
})

import BottomNav from '@/components/nav/BottomNav'

describe('BottomNav', () => {
  it('renders Home, Stories, More', () => {
    const { getByText } = render(<BottomNav /> as any)
    expect(getByText('Home')).toBeTruthy()
    expect(getByText('Stories')).toBeTruthy()
    expect(getByText('More')).toBeTruthy()
  })
})
