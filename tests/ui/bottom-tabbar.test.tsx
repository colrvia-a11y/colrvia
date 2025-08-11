import React from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render } from '@testing-library/react'
vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
beforeAll(()=>{
  // minimal matchMedia shim
  // @ts-ignore
  window.matchMedia = window.matchMedia || function(query){
    return {
      matches: false,
      media: query,
      addEventListener: ()=>{},
      removeEventListener: ()=>{}
    }
  }
})
// Legacy BottomTabBar test retained only to ensure component still loads until removed.
import BottomTabBar from '@/components/nav/BottomTabBar'
vi.mock('framer-motion', () => ({ motion: { div: (p:any)=> <div {...p} /> } }))

describe('BottomTabBar (legacy)', () => {
  it('renders legacy labels Home, New, Stories', () => {
    const { getByText } = render(<BottomTabBar /> as any)
    expect(getByText('Home')).toBeTruthy()
    expect(getByText('New')).toBeTruthy()
    expect(getByText('Stories')).toBeTruthy()
  })
})
