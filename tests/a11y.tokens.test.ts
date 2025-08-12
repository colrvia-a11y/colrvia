import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('a11y tokens', () => {
  it('globals.css defines readable foreground tokens', () => {
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
    expect(css).toMatch(/--foreground:\s*222 47% 11%/);
    expect(css).toMatch(/--foreground:\s*0 0% 98%/);
    expect(css).toMatch(/--card-foreground:\s*222 47% 11%/);
  });

  it('layout applies text-foreground to body', () => {
    const layout = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8');
    expect(layout).toMatch(/text-foreground/);
  });
});
