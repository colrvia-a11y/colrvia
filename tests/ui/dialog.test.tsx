import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

describe('Dialog', () => {
  function Wrapper() {
    const [open, setOpen] = React.useState(false)
    return (
      <div>
        <button onClick={() => setOpen(true)}>Open</button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <button autoFocus onClick={() => setOpen(false)}>Close</button>
            </DialogHeader>
            <button>First</button>
            <button>Second</button>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  it('traps focus and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)
    const openButton = screen.getByText('Open')
    await user.click(openButton)

    const closeButton = screen.getByText('Close')
    const first = screen.getByText('First')
    const second = screen.getByText('Second')

    expect(closeButton).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()
    await user.tab()
    expect(second).toHaveFocus()
    await user.tab()
    expect(closeButton).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('links content to title with aria-labelledby', () => {
    const { getByRole, getByText } = render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Label</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    const dialog = getByRole('dialog')
    const title = getByText('Label')
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id)
  })
})
