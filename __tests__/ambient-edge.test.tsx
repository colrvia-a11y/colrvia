import React from 'react';
import { render, screen } from '@testing-library/react';
import AmbientEdge from '@/components/ui/ambient-edge';

describe('AmbientEdge', () => {
  it('renders when active', () => {
    render(<AmbientEdge active />);
    expect(screen.getByRole('presentation', { hidden: true })).toBeTruthy();
  });

  it('does not render when inactive', () => {
    const { queryByTestId } = render(<AmbientEdge active={false} />);
    expect(document.querySelector('[data-ambient-edge]')).toBeNull();
  });
});
