import { render, screen } from '@testing-library/react';
import React from 'react';
import UnauthenticatedAccount from '@/app/account/Unauthenticated';

describe('UnauthenticatedAccount', () => {
  it('shows Sign in and Create account CTAs with correct links', () => {
    render(<UnauthenticatedAccount />);
    const signIn = screen.getByRole('link', { name: /sign in/i });
    const create = screen.getByRole('link', { name: /create a new account/i });
    expect(signIn).toHaveAttribute('href', '/sign-in?next=/account');
    expect(create).toHaveAttribute('href', '/sign-in?next=/account&mode=password&pw=signup');
  });
});
