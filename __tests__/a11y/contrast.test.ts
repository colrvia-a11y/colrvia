import { contrastRatio } from '@/lib/a11y/contrast';

describe('Brand tokens meet WCAG AA', () => {
  it('muted text on white >= 4.5:1', () => {
    expect(contrastRatio('#ffffff', '#475569')).toBeGreaterThanOrEqual(4.5);
  });
  it('card foreground on card bg >= 4.5:1 (light)', () => {
    expect(contrastRatio('#f8fafc', '#1f2937')).toBeGreaterThanOrEqual(4.5);
  });
  it('foreground on dark bg >= 4.5:1', () => {
    expect(contrastRatio('#0f172a', '#e5e7eb')).toBeGreaterThanOrEqual(4.5);
  });
});
