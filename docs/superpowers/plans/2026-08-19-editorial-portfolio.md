# Editorial Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Astro portfolio that reproduces the approved OFF+BRAND-inspired editorial flow with original content, project galleries, and accessible coordinated motion.

**Architecture:** Astro statically renders the landing and one route per validated project. Site-wide copy lives in a typed data module, project copy and image references live in a build-time content collection, and small client modules progressively enhance the native document with navigation and GSAP/Lenis motion.

**Tech Stack:** Astro 7.2.2, TypeScript strict mode, Astro Content Collections, Astro Assets, GSAP/ScrollTrigger, Lenis, Instrument Sans Variable, Vitest, Playwright, Sharp.

**Spec:** `docs/superpowers/specs/2026-08-19-editorial-portfolio-design.md`

## Global Constraints

- Declare Astro version `7.2.2` exactly.
- Canvas `#e5e4e0`, ink `#1d1d1d`, paper `#ffffff`, ash `#bfbebe`, and stone `#cdcdc9` are the only surface colors.
- The iridescent gradient appears exactly once, on the home hero sphere.
- Use Instrument Sans Variable as the single locally served family and expose it through `--font-primary`.
- Cards and media have square corners and no shadows; only interactive hit areas may use a 10px radius.
- Do not add React, Vue, Svelte, Tailwind, a CMS, a database, or a contact-form backend.
- All semantic content and links must remain usable without client JavaScript.
- Disable Lenis, scroll parallax, magnetic movement, and entrance timelines for `prefers-reduced-motion: reduce`.
- Demo project media must be original, local, and replaceable without component edits.
- Every task preserves the component, content, accessibility, and responsive contracts in the approved spec.

---

## File Responsibility Map

### Foundation and verification

- `package.json`: dependency and command contract.
- `astro.config.mjs`: static Astro and transition-compatible build configuration.
- `tsconfig.json`: strict Astro TypeScript configuration and aliases.
- `playwright.config.ts`: desktop/mobile browser verification configuration.
- `tests/project-order.test.ts`: pure project ordering contract.
- `tests/build-output.test.mjs`: generated route and semantic HTML contract.
- `tests/assets.test.mjs`: source media inventory contract.
- `tests/e2e/portfolio.spec.ts`: navigation, motion preference, overflow, and mobile-menu behavior.
- `scripts/generate-project-assets.mjs`: deterministic original WebP media generator.
- `scripts/verify-production.mjs`: production artifact acceptance verifier.

### Content and queries

- `src/data/site.ts`: identity, global copy, navigation, technologies, capabilities, contact, and social links.
- `src/content.config.ts`: project collection schema, including local image validation.
- `src/content/projects/*.md`: one validated project record per route.
- `src/lib/project-order.ts`: pure deterministic sorting and duplicate-order checks.
- `src/lib/projects.ts`: Astro collection query facade and related-project selection.
- `src/types/site.ts`: stable site-data interfaces used by components.

### Shell and shared UI

- `src/layouts/BaseLayout.astro`: HTML document, metadata, font import, `ClientRouter`, header, main slot, contact/footer ownership, and animation entry point.
- `src/layouts/ProjectLayout.astro`: detail-page composition around `BaseLayout`.
- `src/components/shell/Header.astro`: desktop links and progressively enhanced mobile menu.
- `src/components/shell/Preloader.astro`: first-session presentation cover and counter markup.
- `src/components/shell/Footer.astro`: global navigation, social links, location, and copyright.
- `src/components/ui/TextLink.astro`: consistent arrow-link affordance.
- `src/components/ui/SectionLabel.astro`: section micro-label.
- `src/components/decor/GradientSphere.astro`: singleton hero visual.
- `src/components/decor/ConcentricRings.astro`: decorative hairline geometry.

### Landing

- `src/components/home/HeroSection.astro`: headline, sphere, availability, and scroll indicator.
- `src/components/home/StatementSection.astro`: large personal manifesto.
- `src/components/home/AboutSection.astro`: two-column personal introduction.
- `src/components/home/TechWallSection.astro`: ten-cell technology wall.
- `src/components/home/ProjectCard.astro`: one linked editorial work tile.
- `src/components/home/ProjectsSection.astro`: count, anchor, and full ordered project sequence.
- `src/components/home/CapabilitiesSection.astro`: large capability list.
- `src/components/home/ContactSection.astro`: monumental email invitation.
- `src/pages/index.astro`: landing data query and section composition only.

### Project detail

- `src/components/project/ProjectHero.astro`: title, optimized cover, and metadata.
- `src/components/project/ProjectNarrative.astro`: question, objective, strategy, and outcome blocks.
- `src/components/project/ProjectGallery.astro`: ordered `wide` and `half` responsive gallery.
- `src/components/project/RelatedProjects.astro`: at most three related links.
- `src/pages/projects/[slug].astro`: static path generation and detail composition.
- `src/pages/404.astro`: branded missing-route page.

### Styling and behavior

- `src/styles/tokens.css`: exact color, type, spacing, grid, and motion tokens.
- `src/styles/global.css`: reset, base document behavior, focus, skip link, and reduced-motion rules.
- `src/styles/shell.css`: preloader, navigation, footer, and transition-cover presentation.
- `src/styles/home.css`: landing composition.
- `src/styles/project.css`: detail and gallery composition.
- `src/scripts/app.ts`: one-time Astro lifecycle registration and page-scoped cleanup ownership.
- `src/scripts/menu.ts`: accessible mobile menu enhancement.
- `src/scripts/motion.ts`: Lenis/GSAP setup and cleanup.
- `src/scripts/preloader.ts`: session-safe preloader timeout and reveal sequence.

---

### Task 1: Astro foundation and executable quality gates

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`
- Create: `vitest.config.ts`
- Create: `tests/foundation.test.ts`

**Interfaces:**
- Consumes: approved design specification and global constraints.
- Produces: `npm run dev`, `npm run check`, `npm run build`, `npm test`, and strict `@/*` imports for every later task.

- [ ] **Step 1: Write the failing foundation test**

```ts
// tests/foundation.test.ts
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

  it('uses strict Astro TypeScript settings', () => {
    const config = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
    expect(config.extends).toBe('astro/tsconfigs/strict');
    expect(config.compilerOptions.paths['@/*']).toEqual(['src/*']);
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing foundation**

Run: `npx vitest run tests/foundation.test.ts`

Expected: FAIL because `package.json` and `tsconfig.json` do not exist.

- [ ] **Step 3: Create the package and Astro configuration**

Use this package contract, then run `npm install` to resolve the current compatible versions of non-Astro packages into `package-lock.json`:

```json
{
  "name": "editorial-portfolio",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "build": "astro build",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "verify": "npm run check && npm test && npm run build && node scripts/verify-production.mjs"
  },
  "dependencies": {
    "@fontsource-variable/instrument-sans": "latest",
    "astro": "7.2.2",
    "gsap": "latest",
    "lenis": "latest"
  },
  "devDependencies": {
    "@astrojs/check": "latest",
    "@playwright/test": "latest",
    "sharp": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
```

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

Create `src/env.d.ts` with `/// <reference types="astro/client" />`, ignore `node_modules/`, `dist/`, `.astro/`, and Playwright output, and render a semantic temporary `<main><h1>Editorial portfolio</h1></main>` in `src/pages/index.astro`.

- [ ] **Step 4: Run foundation checks**

Run: `npm test -- tests/foundation.test.ts && npm run check && npm run build`

Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 5: Commit the foundation**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/env.d.ts src/pages/index.astro vitest.config.ts tests/foundation.test.ts
git commit -m "build: scaffold Astro portfolio"
```

---

### Task 2: Typed global data and validated project repository

**Files:**
- Create: `src/types/site.ts`
- Create: `src/data/site.ts`
- Create: `src/content.config.ts`
- Create: `src/lib/project-order.ts`
- Create: `src/lib/projects.ts`
- Create: `tests/project-order.test.ts`

**Interfaces:**
- Consumes: Astro Content Collections and strict TypeScript from Task 1.
- Produces: `SiteData`, `Technology`, `Capability`, `sortProjects<T>()`, `getProjects()`, and `getRelatedProjects()` for landing and detail components.

- [ ] **Step 1: Write failing ordering and duplicate tests**

```ts
// tests/project-order.test.ts
import { describe, expect, it } from 'vitest';
import { assertUniqueProjectOrder, sortProjects } from '@/lib/project-order';

const entries = [
  { id: 'nexo', data: { order: 3, year: 2024 } },
  { id: 'atlas', data: { order: 1, year: 2026 } },
  { id: 'mono', data: { order: 2, year: 2025 } },
];

describe('project ordering', () => {
  it('sorts by ascending explicit order without mutating input', () => {
    expect(sortProjects(entries).map(({ id }) => id)).toEqual(['atlas', 'mono', 'nexo']);
    expect(entries[0].id).toBe('nexo');
  });

  it('rejects duplicate explicit order values', () => {
    expect(() => assertUniqueProjectOrder([
      entries[0],
      { id: 'duplicate', data: { order: 3, year: 2023 } },
    ])).toThrow('Duplicate project order 3: nexo, duplicate');
  });
});
```

- [ ] **Step 2: Run the tests and confirm missing repository modules**

Run: `npm test -- tests/project-order.test.ts`

Expected: FAIL because `@/lib/project-order` does not exist.

- [ ] **Step 3: Implement the pure ordering boundary**

```ts
// src/lib/project-order.ts
export interface OrderedProject {
  id: string;
  data: { order: number; year: number };
}

export function assertUniqueProjectOrder<T extends OrderedProject>(projects: readonly T[]): void {
  const idsByOrder = new Map<number, string[]>();
  for (const project of projects) {
    idsByOrder.set(project.data.order, [...(idsByOrder.get(project.data.order) ?? []), project.id]);
  }
  for (const [order, ids] of idsByOrder) {
    if (ids.length > 1) throw new Error(`Duplicate project order ${order}: ${ids.join(', ')}`);
  }
}

export function sortProjects<T extends OrderedProject>(projects: readonly T[]): T[] {
  assertUniqueProjectOrder(projects);
  return [...projects].sort((a, b) => a.data.order - b.data.order);
}
```

- [ ] **Step 4: Define site interfaces and centralized demo content**

Define these stable interfaces in `src/types/site.ts`:

```ts
export interface NavItem { label: string; href: string }
export interface SocialLink extends NavItem { external: boolean }
export interface Technology { name: string; category: string; mark: string }
export interface Capability { name: string; description: string }
export interface SiteData {
  identity: { name: string; role: string; location: string; timezone: string; availability: string };
  seo: { title: string; description: string };
  navigation: NavItem[];
  hero: { lines: [string, string, string]; eyebrow: string };
  statement: string;
  about: { label: string; lead: string; body: string };
  technologies: Technology[];
  capabilities: Capability[];
  contact: { lines: [string, string, string]; email: string };
  socials: SocialLink[];
}
```

Export `siteData satisfies SiteData` from `src/data/site.ts` with the demo identity `ALEX RIVERA.`, role `Creative developer`, location `Cancún, México`, email `hello@alexrivera.dev`, exactly ten named technologies, and exactly six approved capabilities. Keep all visible landing copy in this file.

- [ ] **Step 5: Define the Astro 7 project schema and query facade**

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const galleryItem = (image: () => z.ZodTypeAny) => z.object({
  image: image(),
  alt: z.string().trim().min(1),
  caption: z.string().trim().min(1).optional(),
  layout: z.enum(['wide', 'half']),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    year: z.number().int().min(2000).max(2100),
    order: z.number().int().positive(),
    client: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1),
    capabilities: z.array(z.string().trim().min(1)).min(1),
    cover: image(),
    coverAlt: z.string().trim().min(1),
    question: z.string().trim().min(1),
    objective: z.string().trim().min(1),
    strategy: z.string().trim().min(1),
    outcome: z.string().trim().min(1),
    externalUrl: z.string().url().optional(),
    gallery: z.array(galleryItem(image)).min(3),
  }),
});

export const collections = { projects };
```

In `src/lib/projects.ts`, export:

```ts
export async function getProjects(): Promise<CollectionEntry<'projects'>[]>;
export async function getRelatedProjects(
  current: CollectionEntry<'projects'>,
  limit?: number,
): Promise<CollectionEntry<'projects'>[]>;
```

`getProjects()` calls `getCollection('projects')` and `sortProjects()`. `getRelatedProjects()` excludes `current.id`, scores each entry by capability intersection, sorts descending score then ascending `order`, and returns `slice(0, Math.min(limit, 3))` with a default limit of 3.

- [ ] **Step 6: Run unit and type checks**

Run: `npm test -- tests/project-order.test.ts && npm run check`

Expected: unit tests pass; `astro check` reports no type errors.

- [ ] **Step 7: Commit the content boundary**

```bash
git add src/types/site.ts src/data/site.ts src/content.config.ts src/lib/project-order.ts src/lib/projects.ts tests/project-order.test.ts
git commit -m "feat: define typed portfolio content"
```

---

### Task 3: Original project media and validated project entries

**Files:**
- Create: `scripts/generate-project-assets.mjs`
- Create: `src/assets/projects/atlas-commerce/*.webp`
- Create: `src/assets/projects/mono-culture/*.webp`
- Create: `src/assets/projects/nexo-finance/*.webp`
- Create: `src/content/projects/atlas-commerce.md`
- Create: `src/content/projects/mono-culture.md`
- Create: `src/content/projects/nexo-finance.md`
- Create: `public/marks/*.svg`
- Create: `tests/assets.test.mjs`

**Interfaces:**
- Consumes: schema from `src/content.config.ts` and technology paths from `siteData`.
- Produces: three complete project entries, twelve original WebP images, and ten monochrome SVG marks.

- [ ] **Step 1: Write the failing media inventory test**

```js
// tests/assets.test.mjs
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import test from 'node:test';

const slugs = ['atlas-commerce', 'mono-culture', 'nexo-finance'];

test('each project owns a cover and at least three WebP gallery images', () => {
  for (const slug of slugs) {
    const dir = `src/assets/projects/${slug}`;
    assert.equal(existsSync(dir), true, `${slug} asset directory is missing`);
    const files = readdirSync(dir).filter((file) => file.endsWith('.webp'));
    assert.equal(files.includes('cover.webp'), true, `${slug} cover is missing`);
    assert.ok(files.length >= 4, `${slug} needs a cover and three gallery images`);
  }
});

test('the technology wall owns exactly ten SVG marks', () => {
  assert.equal(readdirSync('public/marks').filter((file) => file.endsWith('.svg')).length, 10);
});
```

- [ ] **Step 2: Run the inventory test and confirm assets are absent**

Run: `node --test tests/assets.test.mjs`

Expected: FAIL with `asset directory is missing`.

- [ ] **Step 3: Create the deterministic media generator**

Implement `scripts/generate-project-assets.mjs` with `sharp`. It must create 1600×1000 WebP covers and 1600×1200 gallery frames from original SVG strings. Use these project palettes only inside project media—not as interface colors:

```js
const projects = [
  { slug: 'atlas-commerce', tones: ['#0b352d', '#d7ff56', '#f5f3ea'], label: 'ATLAS / COMMERCE' },
  { slug: 'mono-culture', tones: ['#241f1a', '#f1b4c8', '#f4efe6'], label: 'MONO / CULTURE' },
  { slug: 'nexo-finance', tones: ['#152238', '#85c7f2', '#eef1f5'], label: 'NEXO / FINANCE' },
];
```

Export one `renderFrame(project, index, width, height): string` function that returns accessible, text-light geometric UI artwork with a solid background, grid lines, one product panel, and the project label. For each project, write `cover.webp`, `gallery-01.webp`, `gallery-02.webp`, and `gallery-03.webp` at quality 90. Running the script twice must produce the same file names and dimensions.

- [ ] **Step 4: Generate media and add SVG technology marks**

Run: `node scripts/generate-project-assets.mjs`

Create exactly ten `public/marks/*.svg` files named for the ten `siteData.technologies` entries. Each SVG uses `viewBox="0 0 120 48"`, `fill="currentColor"`, a short text/acronym or simple geometric line mark, and no embedded interface color.

- [ ] **Step 5: Author three complete project records**

Each Markdown file uses relative media paths and this exact field shape:

```yaml
---
title: Atlas Commerce
summary: A modular commerce experience that makes a large catalogue feel calm, tactile, and fast.
year: 2026
order: 1
client: Independent concept
role: Design and frontend development
capabilities:
  - Creative development
  - Design systems
cover: ../../assets/projects/atlas-commerce/cover.webp
coverAlt: Editorial interface concept for the Atlas Commerce catalogue
question: How can a dense product catalogue feel considered instead of overwhelming?
objective: Build a flexible shopping system with an editorial pace and a clear path from discovery to purchase.
strategy: A strict modular grid, expressive product crops, and restrained motion turn repeated commerce patterns into a coherent narrative.
outcome: The concept delivers a fast, reusable system whose visual hierarchy scales cleanly across catalogue, story, and product views.
gallery:
  - image: ../../assets/projects/atlas-commerce/gallery-01.webp
    alt: Atlas Commerce catalogue grid with oversized product typography
    caption: Catalogue direction
    layout: wide
  - image: ../../assets/projects/atlas-commerce/gallery-02.webp
    alt: Atlas Commerce mobile product interface
    caption: Mobile product flow
    layout: half
  - image: ../../assets/projects/atlas-commerce/gallery-03.webp
    alt: Atlas Commerce design system components
    caption: Modular interface system
    layout: half
---
```

Create complete, original records for `Mono Culture` (order 2, 2025) and `Nexo Finance` (order 3, 2024) with the same required fields and project-specific copy. Do not render a Markdown body; all required narrative content remains in validated frontmatter.

- [ ] **Step 6: Verify media and content schemas**

Run: `node --test tests/assets.test.mjs && npm run check && npm run build`

Expected: asset tests pass, all three collection entries validate, and the build exits 0.

- [ ] **Step 7: Commit project content and resources**

```bash
git add scripts/generate-project-assets.mjs src/assets/projects src/content/projects public/marks tests/assets.test.mjs
git commit -m "feat: add original portfolio projects"
```

---

### Task 4: Global shell, design tokens, and progressive navigation

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/styles/shell.css`
- Create: `src/components/ui/TextLink.astro`
- Create: `src/components/ui/SectionLabel.astro`
- Create: `src/components/shell/Header.astro`
- Create: `src/components/shell/Preloader.astro`
- Create: `src/components/shell/Footer.astro`
- Create: `src/components/decor/ConcentricRings.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/scripts/menu.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `siteData`, Astro `ClientRouter`, and global visual constraints.
- Produces: `BaseLayout` props `{ title: string; description: string; canonicalPath?: string }`, one header/footer, native no-JavaScript navigation, and stable `data-*` hooks for Task 7.

- [ ] **Step 1: Add a failing shell contract to the production HTML test**

```js
// tests/build-output.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const home = () => readFileSync('dist/index.html', 'utf8');

test('home exposes semantic shell and no-JavaScript navigation', () => {
  const html = home();
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<header[^>]*data-site-header/);
  assert.match(html, /<main[^>]*id="main-content"/);
  assert.match(html, /<footer[^>]*data-site-footer/);
  assert.match(html, /href="#projects"/);
  assert.match(html, /href="#contact"/);
});
```

- [ ] **Step 2: Build and confirm the shell contract fails**

Run: `npm run build && node --test tests/build-output.test.mjs`

Expected: FAIL because the semantic shell is absent.

- [ ] **Step 3: Implement design tokens and global baseline**

In `tokens.css`, define the approved color variables, singleton sphere gradient, `--font-primary`, fluid display/body scales, max width 1400px, gutters, 76–119px fluid section spacing, and 10px interactive radius. In `global.css`, implement box sizing, margin reset, parchment canvas, ink text, font smoothing, native smooth-scroll disabled when enhanced Lenis runs, visible `:focus-visible`, a skip link, image defaults, and reduced-motion overrides.

Import `@fontsource-variable/instrument-sans/wght.css`, `tokens.css`, `global.css`, and `shell.css` exactly once from `BaseLayout.astro`.

- [ ] **Step 4: Implement shared links, labels, and shell components**

`TextLink.astro` accepts `{ href: string; label: string; external?: boolean; class?: string }` and renders a native anchor plus an aria-hidden arrow. `SectionLabel.astro` accepts `{ text: string; index?: string }`. `Header.astro` renders desktop links, a no-JavaScript mobile link row, and an enhanced dialog-like panel with trigger attributes `aria-expanded`, `aria-controls="mobile-menu"`, and `data-menu-toggle`. `Footer.astro` reads navigation/social data passed from `BaseLayout` and owns the only `<footer>`.

`menu.ts` exports:

```ts
export interface Cleanup { (): void }
export function setupMenu(root: Document = document): Cleanup;
```

The setup adds `js-enhanced` to `<html>`, toggles the panel, traps focus while open, closes on Escape/link activation, restores trigger focus, toggles `inert` on `<main>`, and returns a function that removes every listener and state attribute.

- [ ] **Step 5: Implement `BaseLayout` and temporary main composition**

Use `ClientRouter` from `astro:transitions` with `fallback="swap"`. Render `<Preloader />` before the header, a skip link, `<Header />`, `<main id="main-content"><slot /></main>`, `<slot name="contact" />`, and `<Footer />`. Add title, description, canonical URL when `Astro.site` exists, theme color, and viewport metadata. Do not hide the page content before client enhancement.

- [ ] **Step 6: Verify shell semantics and types**

Run: `npm run check && npm run build && node --test tests/build-output.test.mjs`

Expected: type check, build, and shell contract all pass.

- [ ] **Step 7: Commit the shell**

```bash
git add src/styles src/components/ui src/components/shell src/components/decor/ConcentricRings.astro src/layouts/BaseLayout.astro src/scripts/menu.ts src/pages/index.astro tests/build-output.test.mjs
git commit -m "feat: build editorial site shell"
```

---

### Task 5: Complete landing composition

**Files:**
- Create: `src/styles/home.css`
- Create: `src/components/decor/GradientSphere.astro`
- Create: `src/components/home/HeroSection.astro`
- Create: `src/components/home/StatementSection.astro`
- Create: `src/components/home/AboutSection.astro`
- Create: `src/components/home/TechWallSection.astro`
- Create: `src/components/home/ProjectCard.astro`
- Create: `src/components/home/ProjectsSection.astro`
- Create: `src/components/home/CapabilitiesSection.astro`
- Create: `src/components/home/ContactSection.astro`
- Modify: `src/pages/index.astro`
- Modify: `tests/build-output.test.mjs`

**Interfaces:**
- Consumes: `siteData`, ordered `CollectionEntry<'projects'>[]`, `TextLink`, `SectionLabel`, and optimized Astro images.
- Produces: approved landing flow and stable hooks `[data-hero-line]`, `[data-sphere]`, `[data-reveal]`, `[data-parallax]`, and `[data-magnetic]` for Task 7.

- [ ] **Step 1: Extend the failing production HTML contract**

Add this test:

```js
test('landing renders the complete approved narrative flow', () => {
  const html = home();
  for (const id of ['hero', 'statement', 'about', 'stack', 'projects', 'capabilities', 'contact']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.equal((html.match(/data-project-card/g) ?? []).length, 3);
  assert.equal((html.match(/data-tech-cell/g) ?? []).length, 10);
  assert.equal((html.match(/data-gradient-sphere/g) ?? []).length, 1);
  assert.match(html, /mailto:hello@alexrivera\.dev/);
});
```

- [ ] **Step 2: Build and confirm the landing contract fails**

Run: `npm run build && node --test tests/build-output.test.mjs`

Expected: FAIL because the approved sections are not present.

- [ ] **Step 3: Implement hero, statement, and about components**

`GradientSphere.astro` renders one aria-hidden `<div data-gradient-sphere data-sphere>`. `HeroSection` accepts `siteData.hero` and identity data, renders exactly one `h1` with three mask wrappers and `data-hero-line`, and positions the singleton sphere behind it. `StatementSection` renders the statement in accessible text with line-reveal spans. `AboutSection` renders the approved two-column copy, rings, and email link.

- [ ] **Step 4: Implement technology wall and project sequence**

`TechWallSection` accepts `Technology[]` and renders exactly ten `<li data-tech-cell>` cells with `<img src={mark}>`, meaningful alt text, name, and category. `ProjectCard` accepts one `CollectionEntry<'projects'>` and uses Astro `<Image>` with cover metadata, alt text, responsive widths, `data-parallax`, title, year, capabilities, and `/projects/${project.id}/`. `ProjectsSection` renders count, `VIEW PROJECTS ↓` linked to the first card ID, and every ordered entry.

- [ ] **Step 5: Implement capabilities, contact, and home composition**

`CapabilitiesSection` renders six ordered typographic rows with name, description, and index. `ContactSection` renders the three configured lines and real mail link. In `index.astro`, call `getProjects()`, compose all sections in the approved order inside `BaseLayout`, and pass `<ContactSection slot="contact" />` so `BaseLayout` retains footer ownership.

- [ ] **Step 6: Implement responsive landing CSS**

Use a 12-column grid above 1024px, 6 columns from 700–1023px, and vertical narrative flow below 700px. Implement fluid display sizes, 100dvh hero, sphere placement, two-column about, 5-column technology wall, varied project card proportions, grid-paper background, capability hairlines, and monumental contact. Use `overflow: clip` only on intentional media/decoration containers; do not hide document overflow horizontally as a repair.

- [ ] **Step 7: Verify the landing output**

Run: `npm run check && npm run build && node --test tests/build-output.test.mjs`

Expected: all checks pass; the output has three project cards, ten tech cells, and one gradient sphere.

- [ ] **Step 8: Commit the landing**

```bash
git add src/styles/home.css src/components/decor/GradientSphere.astro src/components/home src/pages/index.astro tests/build-output.test.mjs
git commit -m "feat: compose animated editorial landing"
```

---

### Task 6: Project detail routes and editorial galleries

**Files:**
- Create: `src/styles/project.css`
- Create: `src/components/project/ProjectHero.astro`
- Create: `src/components/project/ProjectNarrative.astro`
- Create: `src/components/project/ProjectGallery.astro`
- Create: `src/components/project/RelatedProjects.astro`
- Create: `src/layouts/ProjectLayout.astro`
- Create: `src/pages/projects/[slug].astro`
- Create: `src/pages/404.astro`
- Modify: `tests/build-output.test.mjs`

**Interfaces:**
- Consumes: one `CollectionEntry<'projects'>`, `getProjects()`, `getRelatedProjects()`, `BaseLayout`, and `ContactSection`.
- Produces: `/projects/atlas-commerce/`, `/projects/mono-culture/`, `/projects/nexo-finance/`, a gallery accepting `Project['data']['gallery']`, and a branded 404 page.

- [ ] **Step 1: Add failing route and gallery contracts**

```js
test('every sample project builds a complete detail route', () => {
  for (const slug of ['atlas-commerce', 'mono-culture', 'nexo-finance']) {
    const html = readFileSync(`dist/projects/${slug}/index.html`, 'utf8');
    assert.match(html, /data-project-hero/);
    assert.match(html, /data-project-question/);
    assert.match(html, /data-project-objective/);
    assert.match(html, /data-project-strategy/);
    assert.match(html, /data-project-outcome/);
    assert.ok((html.match(/data-gallery-item/g) ?? []).length >= 3);
    assert.ok((html.match(/data-related-project/g) ?? []).length <= 3);
  }
});
```

- [ ] **Step 2: Build and confirm routes are absent**

Run: `npm run build && node --test tests/build-output.test.mjs`

Expected: FAIL with missing `dist/projects/atlas-commerce/index.html`.

- [ ] **Step 3: Implement project presentational components**

`ProjectHero` renders one page `h1`, optimized cover, client/project type, year, role, capabilities, and optional external link. The displayed project type is the first capability; no additional schema field is introduced. `ProjectNarrative` receives explicit `question`, `objective`, `strategy`, and `outcome` strings and renders labeled semantic sections. `ProjectGallery` maps the validated gallery items in source order, applies `gallery__item--wide` or `gallery__item--half`, and renders Astro `<Image>` with responsive widths and lazy loading. `RelatedProjects` renders no more than three native links.

- [ ] **Step 4: Implement static routes and layout**

`[slug].astro` exports `getStaticPaths()` that maps `await getProjects()` to `{ params: { slug: project.id }, props: { project } }`. Query related projects for the selected entry, then render `ProjectLayout`. `ProjectLayout` composes hero, question/objective, strategy, gallery, outcome, related projects, and the shared slotted contact/footer path in the approved order.

- [ ] **Step 5: Implement project and 404 styling**

Use the shared grid and parchment canvas. Metadata uses hairline-separated cells; the challenge and objective use oversized left-aligned type; wide gallery items span 12 columns; consecutive half items span 6 columns; every item becomes full width below 700px. The 404 page uses ink text, parchment background, a home link, and no second sphere gradient.

- [ ] **Step 6: Verify all generated routes**

Run: `npm run check && npm run build && node --test tests/build-output.test.mjs`

Expected: all three detail pages, gallery contracts, related-project limits, and 404 output pass.

- [ ] **Step 7: Commit project routes**

```bash
git add src/styles/project.css src/components/project src/layouts/ProjectLayout.astro src/pages/projects src/pages/404.astro tests/build-output.test.mjs
git commit -m "feat: add editorial project case studies"
```

---

### Task 7: Coordinated preloader, scroll motion, and page transitions

**Files:**
- Create: `src/scripts/preloader.ts`
- Create: `src/scripts/motion.ts`
- Create: `src/scripts/app.ts`
- Modify: `src/components/shell/Preloader.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/shell.css`
- Modify: `src/styles/global.css`
- Create: `tests/e2e/portfolio.spec.ts`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: stable data hooks from Tasks 4–6 and Astro `ClientRouter` lifecycle events.
- Produces: `setupPreloader(): Cleanup`, `setupMotion(): Cleanup`, one global `astro:before-swap`/`astro:after-swap`/`astro:page-load` lifecycle coordinator, and accessible final states after any failure.

- [ ] **Step 1: Write failing browser interaction tests**

```ts
// tests/e2e/portfolio.spec.ts
import { expect, test } from '@playwright/test';

test('desktop navigation reaches a project and returns without duplicate shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3000 });
  await page.locator('[data-project-card]').first().getByRole('link').click();
  await expect(page.locator('[data-project-hero]')).toBeVisible();
  await expect(page.locator('[data-site-header]')).toHaveCount(1);
  await expect(page.locator('[data-site-footer]')).toHaveCount(1);
});

test('reduced motion keeps native scrolling and visible content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('[data-hero-line]').first()).toBeVisible();
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 1000 });
});

test('mobile menu traps and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const trigger = page.locator('[data-menu-toggle]');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Run browsers and confirm motion behavior is missing**

Run: `npx playwright install chromium && npm run build && npm run test:e2e`

Expected: FAIL because preloader lifecycle and enhanced mobile menu orchestration are incomplete.

- [ ] **Step 3: Implement fail-safe preloader behavior**

`Preloader.astro` renders a cover with `data-preloader`, an aria-hidden counter, and an accessible `aria-live="polite"` completion message. `setupPreloader()` checks reduced motion and a guarded `sessionStorage` read, sets a 2500ms hard dismissal timer, animates counter values 5–100 and the cover only on the first eligible visit, writes the session flag inside `try/catch`, always removes scroll lock, and returns an idempotent cleanup that clears timers/tweens.

- [ ] **Step 4: Implement page-scoped GSAP and Lenis motion**

```ts
// src/scripts/motion.ts
export interface Cleanup { (): void }
export function setupMotion(root: Document = document): Cleanup;
```

If reduced motion matches, return an empty cleanup after ensuring all enhancement classes are removed. Otherwise register `ScrollTrigger`, create one Lenis instance, connect its `scroll` event to `ScrollTrigger.update`, call `lenis.raf(time * 1000)` from one GSAP ticker callback, and animate only the approved hooks: hero line clip reveals, singleton sphere entrance/drift, `[data-reveal]` line reveals, `[data-parallax]` media translation, and restrained `[data-magnetic]` links. The cleanup removes pointer listeners, kills only the created GSAP context/ScrollTriggers, detaches the ticker callback, and destroys Lenis.

- [ ] **Step 5: Implement one-time Astro lifecycle coordination**

`app.ts` holds a single page cleanup function. Register document listeners once:

```ts
let cleanupPage: (() => void) | undefined;

function initPage() {
  cleanupPage?.();
  const cleanups = [setupMenu(), setupPreloader(), setupMotion()];
  cleanupPage = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
}

document.addEventListener('astro:before-swap', () => cleanupPage?.());
document.addEventListener('astro:after-swap', () => document.documentElement.classList.remove('is-transitioning'));
document.addEventListener('astro:page-load', initPage);
```

Import the bundled module once from `BaseLayout`. The transition cover may use an ink pseudo-layer, but navigation must continue when setup throws; wrap each setup call so one enhancement failure does not prevent the others or native page interaction.

- [ ] **Step 6: Configure Playwright and pass behavior checks**

Configure Chromium desktop plus a 390×844 mobile project, `webServer.command: 'npm run dev -- --host 127.0.0.1'`, `webServer.url: 'http://127.0.0.1:4321'`, and `reuseExistingServer: true`. Run:

`npm run check && npm run build && npm run test:e2e`

Expected: desktop navigation, reduced-motion behavior, mobile focus restoration, and single-shell assertions pass.

- [ ] **Step 7: Commit the motion system**

```bash
git add src/scripts src/components/shell/Preloader.astro src/layouts/BaseLayout.astro src/styles/shell.css src/styles/global.css tests/e2e/portfolio.spec.ts playwright.config.ts
git commit -m "feat: add accessible editorial motion"
```

---

### Task 8: Production verifier, visual audit, and replacement guide

**Files:**
- Create: `scripts/verify-production.mjs`
- Create: `README.md`
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: complete static output and all acceptance criteria.
- Produces: one `npm run verify` gate, reproducible visual screenshots, and exact content/resource replacement instructions.

- [ ] **Step 1: Write the production verifier before its implementation**

Add `verify:production` to `package.json` as `node scripts/verify-production.mjs`, and keep `verify` as `npm run check && npm test && npm run build && npm run verify:production`. The verifier must fail unless:

```js
const requirements = {
  routes: ['dist/index.html', 'dist/404.html',
    'dist/projects/atlas-commerce/index.html',
    'dist/projects/mono-culture/index.html',
    'dist/projects/nexo-finance/index.html'],
  homeSections: ['hero', 'statement', 'about', 'stack', 'projects', 'capabilities', 'contact'],
  projectCount: 3,
  technologyCount: 10,
  gradientSphereCount: 1,
  minimumGalleryItemsPerProject: 3,
};
```

Run: `npm run build && npm run verify:production`

Expected: FAIL because `scripts/verify-production.mjs` does not exist.

- [ ] **Step 2: Implement the production verifier**

Use `node:fs` and `node:assert/strict` only. Read the listed HTML files, assert every route and home section, count exact home cards/tech cells/sphere, assert gallery minimums, reject the two common incomplete-work tokens constructed from `['TO', 'DO']` and `['T', 'BD']`, empty `href`, `href="#"`, a second sphere marker, and copied OFF+BRAND client names. Print one concise success line with route, project, and gallery counts.

- [ ] **Step 3: Add overflow and keyboard browser checks**

Extend Playwright tests to assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at 1440×900 and 390×844, Tab through the skip link and first navigation items, follow the contact mail link by inspecting its `href`, and confirm every project gallery image has non-empty `alt`, positive rendered width, and positive rendered height.

- [ ] **Step 4: Capture visual evidence and inspect it**

Run the built site and capture full-page screenshots at 1440×900 and 390×844 for the home page plus 1440×900 for `atlas-commerce`. Save them to `artifacts/visual-audit/`. Inspect hero overlap, singleton sphere, section rhythm, project grids, gallery alignment, contact/footer ownership, mobile navigation, and horizontal overflow. Fix concrete visual defects in the owning CSS/component and rerun the screenshots until all three views satisfy the approved design.

- [ ] **Step 5: Write the replacement and development guide**

Document:

- `npm install`, `npm run dev`, `npm run verify`, and `npm run test:e2e`.
- Identity/copy replacement in `src/data/site.ts`.
- Technology mark replacement in `public/marks/` with matching `siteData` paths.
- Project text editing in `src/content/projects/*.md`.
- Project cover/gallery replacement under `src/assets/projects/<slug>/`, including accepted formats, relative frontmatter paths, non-empty alt text, `wide`/`half`, and order uniqueness.
- Motion locations in `src/scripts/` and the reduced-motion contract.
- The proprietary Ataero substitution point in `tokens.css` and current Instrument Sans package import.

- [ ] **Step 6: Run the full completion audit**

Run:

```bash
npm run verify
npm run test:e2e
git diff --check
git status --short
```

Expected: every command exits 0; status contains only intended task files; screenshots show no blocking visual defects.

- [ ] **Step 7: Commit verification and documentation**

```bash
git add package.json package-lock.json scripts/verify-production.mjs tests/e2e/portfolio.spec.ts README.md artifacts/visual-audit
git commit -m "docs: add portfolio verification and editing guide"
```

---

## Plan Self-Review

- Spec coverage: Tasks 1–8 cover every page, section, component boundary, content contract, asset rule, animation lifecycle, fallback, accessibility requirement, and acceptance criterion from the approved specification.
- Scope: The plan produces one static portfolio; it adds no independent backend, CMS, form service, WebGL scene, or administration subsystem.
- Type consistency: `SiteData`, `Technology`, `Capability`, `CollectionEntry<'projects'>`, `sortProjects()`, `getProjects()`, `getRelatedProjects()`, and the cleanup function signature are defined before consumption.
- Runtime consistency: `BaseLayout` owns the only header/footer/router; pages own only main and slotted contact content; `app.ts` owns one set of Astro lifecycle listeners and page-scoped cleanup.
- Content consistency: Required `order`, narrative strings, cover, alt text, and at least three gallery items are validated; duplicate order is rejected before rendering.
- Placeholder scan: The plan contains no deferred implementation markers or unspecified error-handling steps.
