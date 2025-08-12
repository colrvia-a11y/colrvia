import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

/**
 * Heuristic test: flags elements where aria-label duplicates or is a substring of visible text content.
 * This helps discourage redundant aria-label usage that can cause double announcement.
 */
describe('No redundant aria-label duplication', () => {
  function check(node: HTMLElement, issues: string[]) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT)
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement
      const ariaLabel = el.getAttribute('aria-label')
      if (!ariaLabel) continue
      const text = el.textContent?.trim() || ''
      const hasVisibleText = text.length > 0
      if (hasVisibleText) {
        const norm = (s:string)=>s.replace(/\s+/g,' ').toLowerCase()
        if (norm(text).includes(norm(ariaLabel))) {
          issues.push(`<${el.tagName.toLowerCase()}> aria-label='${ariaLabel}' redundant with visible text '${text}'`)
        }
      }
    }
  }

  it('flags redundancy (sample)', () => {
    const { container } = render(
      <div>
        {/* Intentionally redundant example to ensure detection logic works */}
        <button aria-label="Save changes">Save changes</button>
      </div>
    )
    const issues: string[] = []
    check(container, issues)
  expect(issues.some(i=>i.includes("aria-label='Save changes'"))).toBe(true)
  })
})
