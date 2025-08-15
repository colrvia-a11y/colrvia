import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

import BottomNav from '@/components/nav/BottomNav';

describe('BottomNav', () => {
  it('renders 4 tabs with labels', () => {
    render(<BottomNav />);
    for (const label of ['Home', 'Via', 'Favorites', 'More']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  it('marks Favorites as current when on /dashboard', () => {
    render(<BottomNav />);
    const fav = screen.getByLabelText('Favorites');
    expect(fav.getAttribute('aria-current')).toBe('page');
  });
});
