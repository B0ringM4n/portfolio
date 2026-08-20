import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Astro foundation', () => {
  it('pins Astro 7.2.2 and exposes the required quality commands', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.dependencies.astro).toBe('7.2.2');
    expect(pkg.scripts).toMatchObject({
      dev: 'astro dev',
      check: 'astro check',
      build: 'astro build',
      test: 'vitest run',
    });
  });

  it('includes Node type declarations for TypeScript configuration files', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.devDependencies['@types/node']).toBeDefined();
  });

  it('uses strict Astro TypeScript settings', () => {
    const config = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
    expect(config.extends).toBe('astro/tsconfigs/strict');
    expect(config.compilerOptions.paths['@/*']).toEqual(['src/*']);
  });
});
