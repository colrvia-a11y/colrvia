import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('a11y tokens', () => {
  it('globals.css defines readable foreground tokens', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
  expect(css).toMatch(/--foreground:\s*222\.2 47\.4% 11\.2%/);
  expect(css).toMatch(/--card-foreground:\s*222\.2 47\.4% 11\.2%/);
  });

  it('layout applies text-foreground to body', () => {
    const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
  // Body previously used the shadcn token class text-foreground; we've moved
  // to explicit CSS var usage for theme tokens. Allow either form so the
  // intent (applying a readable foreground text class) remains enforced.
  expect(layout).toMatch(/text-foreground|text-\[var\(--color-fg\)\]/);
  });
});
