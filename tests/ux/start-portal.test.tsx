import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
}))
vi.mock('framer-motion', () => ({ motion: { div: (p:any)=> <div {...p} />, span:(p:any)=> <span {...p} /> }, AnimatePresence: (p:any)=> <>{p.children}</> }))
import { StartStoryPortalProvider, useStartStory } from '@/components/ux/StartStoryPortal'

function Demo(){
  const start = useStartStory()
  return <button onClick={()=> start('/designers')}>Go</button>
}

describe('StartStoryPortal', ()=>{
  it('renders provider and hook button', ()=>{
  // mock matchMedia
  // @ts-ignore
  window.matchMedia = window.matchMedia || function(){ return { matches:false, addEventListener:()=>{}, removeEventListener:()=>{} } }
    // @ts-ignore
    const { getByText } = render(<StartStoryPortalProvider><Demo /></StartStoryPortalProvider>)
    const btn = getByText('Go')
    expect(btn).toBeTruthy()
    fireEvent.click(btn) // smoke (should not throw)
  })
})
