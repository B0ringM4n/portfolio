# Editorial portfolio

A static Astro portfolio with centralized site copy, validated project case studies, responsive image galleries, and progressively enhanced motion.

## Development and verification

Use Node.js 22 or newer, then run:

```sh
npm install
npm run dev
```

The development server prints its local URL. Before shipping a change, run both gates:

```sh
npm run verify
npm run test:e2e
```

`npm run verify` checks Astro and TypeScript, runs the unit and generated-output contracts, creates `dist/`, and verifies the production routes and content. Playwright separately exercises the real desktop and mobile browser behavior.

## Replace identity and landing copy

Edit `src/data/site.ts`. It owns the name, role, location, timezone, availability, SEO text, navigation, three hero lines, statement, biography, technology wall, six capabilities, contact copy and email, and social links. Keep section links root-relative (`/#about`, `/#projects`, and `/#contact`) so they work from project and 404 routes.

The production contract currently expects exactly three hero lines, ten technologies, six capabilities, and three projects. Update the corresponding tests and verifier deliberately if the portfolio structure changes.

## Replace technology marks

Technology marks live in `public/marks/` as monochrome SVG files. For a file such as `public/marks/A11Y.svg`, set that technology's `mark` value in `src/data/site.ts` to `A11Y`; the component resolves it as `/marks/A11Y.svg`. Also update the technology `name` and `category`. Keep the filename case identical to the `mark` value and provide exactly ten SVG marks unless the production contract is intentionally revised.

## Edit project text

Each file in `src/content/projects/*.md` creates `/projects/<filename>/`. Edit its frontmatter for the title, summary, year, client, role, capabilities, question, objective, strategy, outcome, optional `externalUrl`, media and gallery. The numeric `order` controls landing order and must be a positive value unique across all projects.

Project records are validated during the build. Required copy cannot be blank, URLs must be valid, each project needs a cover and at least three gallery items, and media references must resolve.

## Replace project covers and galleries

Store each project's media under `src/assets/projects/<slug>/`. Accepted cover and gallery formats are AVIF, WebP, PNG, JPEG and JPG. Reference files from the project's Markdown frontmatter with a relative path, for example:

```yaml
cover: ../../assets/projects/atlas-commerce/cover.webp
coverAlt: Editorial product catalog shown on a warm paper surface
gallery:
  - image: ../../assets/projects/atlas-commerce/gallery-01.webp
    alt: Desktop catalog grid with oversized product typography
    caption: Catalog direction
    layout: wide
  - image: ../../assets/projects/atlas-commerce/gallery-02.webp
    alt: Mobile product detail with size and color controls
    layout: half
```

Every informative image needs specific, non-empty `coverAlt` or `alt` text. Use `wide` for a full gallery row and `half` for a two-up desktop item; all items become full width on mobile. Gallery order is the YAML list order. Replace assets and paths together, keep at least three items, and never reuse an `order` value from another project.

## Motion and reduced motion

Client behavior lives in `src/scripts/`:

- `app.ts` owns Astro page lifecycle setup and cleanup.
- `preloader.ts` owns the first-visit cover and its 2.5-second hard dismissal.
- `menu.ts` owns the enhanced mobile navigation.
- `motion.ts` owns GSAP, ScrollTrigger, Lenis, hero/sphere reveals, editorial reveals, parallax, and restrained magnetic links.

Do not hide semantic content while waiting for JavaScript. When `prefers-reduced-motion: reduce` matches, Lenis, parallax, magnetic movement and multi-step entrance timelines remain disabled and content is immediately usable. Any new motion must preserve that fallback and return page-scoped cleanup through the existing lifecycle.

## Typography

Ataero Retina OB is proprietary and is not included. Its substitution point is `--font-primary` in `src/styles/tokens.css`. The current open substitute is Instrument Sans Variable, imported once from `@fontsource-variable/instrument-sans/wght.css` in `src/layouts/BaseLayout.astro`. To change the font, replace that single import, update `--font-primary`, and confirm every used weight is bundled.

## Visual audit artifacts

The audited reference captures are stable files under `artifacts/visual-audit/`:

- `home-desktop-1440x900.png`
- `home-mobile-390x844.png`
- `atlas-commerce-desktop-1440x900.png`

Regenerate them at those exact viewport dimensions after layout, type, media, or motion changes, then rerun both verification gates.
