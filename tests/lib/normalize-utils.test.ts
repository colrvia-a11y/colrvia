// tests/lib/normalize-utils.test.ts
import { normalizePaintName, extractSwCode } from '@/lib/palette/normalize-utils';

describe('normalize-utils', () => {
  it('normalizes names consistently', () => {
    expect(normalizePaintName('Alabaster')).toBe('alabaster');
    expect(normalizePaintName('SW 7008 — Alabaster')).toBe('alabaster');
    expect(normalizePaintName('Pure  White!!')).toBe('pure white');
  });
  it('extracts SW codes from various formats', () => {
    expect(extractSwCode('SW 7008')).toBe('7008');
    expect(extractSwCode('sw-7069  ')).toBe('7069');
    expect(extractSwCode('Alabaster')).toBe(null);
  });
});
