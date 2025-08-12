import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Cinematic from '@/components/reveal/Cinematic'
import { MotionProvider } from '@/components/theme/MotionSettings'

const story = {
  id: '1',
  title: 'Story',
  palette: [{ hex: '#fff', role: 'base' }],
  narrative: 'First line.',
  placements: {}
}

test('cinematic traps focus and closes on escape', async () => {
  const user = userEvent.setup()
  const onExit = vi.fn()
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
  render(
    <MotionProvider>
      <button data-testid="outside">outside</button>
      <Cinematic open story={story} onExit={onExit} />
    </MotionProvider>
  )

  const exit = screen.getByRole('button', { name: /exit reveal/i })
  expect(exit).toHaveFocus()

  const outside = screen.getByTestId('outside')
  expect(outside.closest('[aria-hidden="true"]')).not.toBeNull()

  await user.tab()
  expect(exit).toHaveFocus()

  await user.tab({ shift: true })
  expect(exit).toHaveFocus()

  await user.keyboard('{Escape}')
  expect(onExit).toHaveBeenCalled()
})
