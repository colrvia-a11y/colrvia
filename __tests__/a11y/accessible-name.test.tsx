import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

describe('Accessible names derive from visible text when present', () => {
  it('link accessible name matches its visible text', () => {
    render(<a href="/start">Start with Color Therapist</a>);
    expect(screen.getByRole('link', { name: /Start with Color Therapist/i })).toBeInTheDocument();
  });
});
