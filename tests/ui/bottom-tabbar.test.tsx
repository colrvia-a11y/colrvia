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
import BottomTabBar from '@/components/nav/BottomTabBar'
vi.mock('framer-motion', () => ({ motion: { div: (p:any)=> <div {...p} /> } }))

// Basic smoke test for tab labels

describe('BottomTabBar', () => {
  it('renders Home, New, Stories', () => {
    // @ts-ignore testing as client component
  const { getByText } = render(<BottomTabBar /> as any)
    expect(getByText('Home')).toBeTruthy()
    expect(getByText('New')).toBeTruthy()
    expect(getByText('Stories')).toBeTruthy()
  })
})
