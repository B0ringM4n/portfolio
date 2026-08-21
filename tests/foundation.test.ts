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
      'test:output': 'node --test tests/*.test.mjs',
      verify:
        'npm run check && npm test && npm run build && npm run test:output && npm run verify:production',
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

  it('keeps semantic secondary text WCAG AA compliant and ash decorative-only', () => {
    const tokens = readFileSync('src/styles/tokens.css', 'utf8');
    const styles = ['src/styles/shell.css', 'src/styles/home.css', 'src/styles/project.css']
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    const color = (name: string) => {
      const match = tokens.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'));
      expect(match, `missing --color-${name}`).not.toBeNull();
      return match![1];
    };
    const luminance = (hex: string) => {
      const channels = [1, 3, 5].map(
        (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
      );
      const linear = channels.map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const contrast = (foreground: string, background: string) => {
      const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
        (a, b) => b - a,
      );
      return (lighter + 0.05) / (darker + 0.05);
    };

    expect(contrast(color('muted'), color('canvas'))).toBeGreaterThanOrEqual(4.5);
    expect(styles).not.toMatch(/(?:^|[;{]\s*)color:\s*var\(--color-ash\)/m);
  });

  it('centralizes every landing presentation label in typed site data', async () => {
    const { siteData } = await import('../src/data/site');
    expect(siteData.copy).toEqual({
      skipLink: 'Saltar al contenido',
      menuText: 'Menú',
      menuOpenLabel: 'Abrir menú',
      menuCloseLabel: 'Cerrar menú',
      menuOpenStateLabel: 'Menú abierto',
      statementHeading: 'Declaración',
      aboutContactCta: 'Escríbeme',
      technologiesHeading: 'Tecnologías con las que construyo',
      capabilitiesLabel: 'Capacidades',
      projectsHeading: 'Proyectos seleccionados',
      projectsJump: 'VIEW PROJECTS ↓',
      projectsEmpty: 'Aún estoy preparando los próximos casos de estudio.',
      projectsEmptyCta: 'Cuéntame sobre tu proyecto',
      projectsCountNoun: 'proyectos',
      projectLinkLabelPrefix: 'Ver proyecto',
      projectCapabilitiesLabel: 'Capacidades del proyecto',
      technologyMarkAltPrefix: 'Marca de',
      heroScroll: 'SCROLL ↓',
    });
  });

  it('defines an explicit editorial empty-project state linked to contact', () => {
    const source = readFileSync('src/components/home/ProjectsSection.astro', 'utf8');
    expect(source).toContain('projects-section__empty');
    expect(source).toContain('href="#contact"');
  });
});
