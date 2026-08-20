# Editorial Portfolio Design Specification

**Date:** 2026-08-19  
**Status:** Approved for specification review  
**Reference:** `DESIGN.md` supplied by the user and the public structure of [OFF+BRAND](https://www.itsoffbrand.com/)

## 1. Objective

Build a production-ready personal portfolio using Astro 7.2.2. The site must preserve the narrative pace, typographic scale, section order, and transition language of OFF+BRAND while using original copy and original project media. It must not reuse OFF+BRAND branding, copy, or assets.

The result includes:

- A single-page landing with hero, about, projects, technology stack/capabilities, and contact.
- One statically generated detail route per project with editorial copy and an image gallery.
- Smooth, coordinated animation with usable reduced-motion and no-JavaScript fallbacks.
- Centralized, typed content and project-local assets that can be replaced without editing presentation components.
- Responsive layouts for desktop, tablet, and mobile.

## 2. Chosen Direction

The chosen approach is an animated editorial site built primarily with Astro components and CSS, with GSAP/ScrollTrigger for coordinated reveal and scroll choreography and Lenis for smooth scrolling. A Three.js/WebGL hero was rejected because the supplied design defines the iridescent sphere as a CSS form and because WebGL would add weight without improving fidelity to that contract. A CSS-only animation approach was rejected because it would not provide the required sequencing and scroll coordination.

The visual concept is "iridescent signal on printed stock": a restrained warm monochrome page where one gradient sphere provides the only chromatic event. Large type, sharp surfaces, hairlines, grid-paper project cells, and long vertical pauses produce the editorial rhythm.

## 3. User-Facing Content Flow

### 3.1 Global preloader

- Display a minimal full-screen preloader on the first page load of a browser session.
- Advance visibly from 5% through 100% while the document and critical hero font are initialized.
- The counter represents presentation progress, not fabricated network-byte progress.
- Store a session flag after completion so subsequent in-site navigation does not replay the full sequence.
- If JavaScript is unavailable, the preloader is not rendered and content remains visible.
- If reduced motion is requested, show a short non-animated cover and remove it immediately when the document is ready.

### 3.2 Header and navigation

- Show the portfolio identity at the left and availability, projects, and contact links at the right on wide screens.
- Use in-page anchors for landing sections and regular routes for project pages.
- Use a compact menu trigger on mobile that opens an accessible full-screen navigation panel.
- Preserve native link behavior and a visible focus state.

### 3.3 Hero

- Fill at least the initial viewport, accounting for dynamic mobile viewport units.
- Present an original professional statement in three monumental lines.
- Place the iridescent sphere slightly right of center and behind the text.
- Show a small `SCROLL ↓` indicator near the lower-right edge.
- Reveal sphere, title lines, navigation, and scroll label in one deliberate opening sequence.
- Use the exact singleton sphere gradient from the supplied design. It must not appear elsewhere.

### 3.4 Personal statement

- Follow the hero with a large editorial statement about combining emotion, clarity, and engineering.
- Use mixed emphasis through size and case, not additional colors or typefaces.
- Reveal text in line groups as it enters the viewport.

### 3.5 About

- Use an asymmetric two-column founder-introduction layout.
- The first column contains a section label, concise positioning statement, and contact link.
- The second column contains the longer biography.
- Use concentric hairline circles as low-contrast background structure.
- Collapse to a clear vertical reading order on narrow screens.

### 3.6 Technology wall

- Adapt the reference site's strict "Trusted by" grid into a technology wall.
- Display ten technology cells in a 2-by-5 desktop grid with white surfaces and ash dividers.
- Each cell contains a replaceable local SVG mark, accessible technology name, and optional category metadata.
- At smaller widths, use two columns and preserve the same hairline grid logic.
- Marks remain monochrome so the hero sphere stays the only color event.

### 3.7 Featured projects

- Show a section heading, total count, and an `ALL PROJECTS →` affordance.
- Render large project cards on white grid-paper surfaces.
- Vary card scale and media proportion in a controlled editorial sequence rather than a uniform card grid.
- Each card contains title, year, category/capability markers, image, and link to the project route.
- Media receives subtle scroll parallax; title and arrow respond lightly to pointer hover.
- All information and links remain visible without animation or JavaScript.

### 3.8 Capabilities and stack

- Follow projects with a large typographic capability list that mirrors the reference site's service-list rhythm.
- Initial categories are frontend development, creative development, motion, UX/UI, design systems, and performance.
- Treat this as the second half of the technology-stack story, not an unrelated new section.
- Use layout and hairlines for differentiation; do not introduce pills, colored tags, or filled buttons.

### 3.9 Contact and footer

- End with a monumental multi-line invitation to work together.
- Provide a prominent email link and configurable social links.
- The footer contains section navigation, location/timezone, availability, and copyright.
- Do not present a fake form. A future form may only be added alongside a real submission endpoint and defined success/error states.

## 4. Project Detail Flow

Each project route follows this sequence:

1. Project title and hero media.
2. Metadata for client/project type, year, role, capabilities, and optional external URL.
3. A large "question" or challenge statement.
4. Objective heading and concise project summary.
5. Strategy/process narrative.
6. Editorial media gallery.
7. Outcome/result narrative.
8. Three related project links when available, otherwise all remaining projects.
9. Shared contact invitation and footer.

The gallery supports:

- Full-width landscape media.
- Two-up portrait media on desktop that becomes a vertical sequence on mobile.
- Optional captions.
- Explicit alternative text.
- Optional per-item layout choice: `wide`, `portrait`, or `split`.
- Subtle parallax only when the user allows motion.

Every project page must be generated from validated content. Unknown slugs resolve to Astro's static 404 rather than a partially rendered template.

## 5. Visual System

### 5.1 Color

- Canvas: `#e5e4e0`.
- Ink: `#1d1d1d`.
- Paper: `#ffffff`.
- Ash hairlines: `#bfbebe`.
- Stone secondary surface: `#cdcdc9`.
- Singleton sphere: `linear-gradient(255deg, rgb(250, 203, 14), rgb(240, 107, 168) 30%, rgb(120, 186, 230) 65%, rgb(255, 255, 255))`.

No shadows are permitted. Cards and media remain square. Only interactive hit areas use a 10px radius.

### 5.2 Typography

- Use locally bundled Instrument Sans Variable as the open substitute for proprietary Ataero Retina OB.
- Use one font family for display, body, navigation, labels, and metadata.
- Make the family replaceable through `--font-primary` and a single font import.
- Display text uses fluid sizing up to approximately `clamp(4.75rem, 9vw, 9.375rem)` with tightly controlled line height.
- Body copy stays within 15–18px on common viewports.
- Section labels are 11px, uppercase, and tracked at approximately 0.05em.
- Avoid faux bolding and ensure the used font weights are bundled.

### 5.3 Layout

- Maximum content width: 1400px.
- Desktop grid: 12 columns.
- Tablet grid: 6 columns.
- Mobile grid: 2 columns for structured walls and 1 column for narrative content.
- Section pauses use a fluid equivalent of the 76–119px design range, with larger pauses around hero, projects, and contact.
- Use `clamp()` and logical properties so the system scales without breakpoint-specific duplication.

### 5.4 Media assets

- Demo media must be original and created for this repository.
- Store media under `src/assets/projects/<slug>/`.
- Keep a cover and at least three gallery items per demo project.
- Content files own the reference, alt text, caption, and layout choice for every asset.
- Replacing media must not require component changes.
- Use Astro image optimization for raster assets and explicit dimensions/aspect ratios for all media containers.

## 6. Motion System

### 6.1 Libraries and boundaries

- Use `gsap` and `ScrollTrigger` for coordinated timelines, viewport reveals, parallax, and page covers.
- Use `lenis` for smooth scroll on capable devices.
- Keep animation bootstrapping in a small client module. Astro components must not each create unrelated global animation loops.
- Connect Lenis updates to GSAP's ticker and refresh ScrollTrigger after fonts and images needed for layout are ready.
- Destroy listeners, Lenis instances, and ScrollTriggers before Astro page swaps and reinitialize after swaps.

### 6.2 Animation language

- Use clipping masks, controlled vertical translation, opacity, and restrained scale.
- Do not use bouncy easing, continuous cursor followers, scroll hijacking, or gratuitous 3D transforms.
- Project images may move within an overflow-hidden frame by a small amount.
- Interactive text links may shift an arrow or underline; magnetic movement must stay within a few pixels.
- The page-transition cover uses ink and reveals the destination without delaying navigation unnecessarily.

### 6.3 Reduced motion and fallback

- When `prefers-reduced-motion: reduce` matches, do not initialize Lenis, scroll parallax, magnetic links, or multi-step entrance timelines.
- Show final visual states immediately or with a brief opacity transition.
- Core navigation, content, and project discovery must work without client JavaScript.
- Do not hide semantic content by default in CSS waiting for JavaScript to reveal it; add enhancement classes only after animation initialization.

## 7. Technical Architecture

### 7.1 Pages

- `src/pages/index.astro`: landing composition.
- `src/pages/projects/[slug].astro`: static project route using `getStaticPaths()`.
- `src/pages/404.astro`: branded not-found page with a link home.

### 7.2 Layouts

- `src/layouts/BaseLayout.astro`: document metadata, local font, global styles, header, page-transition shell, client-motion entry point, and footer slot ownership.
- `src/layouts/ProjectLayout.astro`: shared project chrome and project metadata composition.

### 7.3 Section components

- `Header.astro`
- `Preloader.astro`
- `HeroSection.astro`
- `StatementSection.astro`
- `AboutSection.astro`
- `TechWallSection.astro`
- `ProjectsSection.astro`
- `ProjectCard.astro`
- `CapabilitiesSection.astro`
- `ContactSection.astro`
- `Footer.astro`

### 7.4 Project components

- `ProjectHero.astro`
- `ProjectMetadata.astro`
- `ProjectNarrative.astro`
- `ProjectGallery.astro`
- `RelatedProjects.astro`

### 7.5 Shared UI and decoration

- `TextLink.astro`
- `SectionLabel.astro`
- `GradientSphere.astro`
- `ConcentricRings.astro`
- `TechMark.astro`

Each component accepts explicit serializable props, owns one presentational responsibility, and does not read global content directly unless it is a top-level section composition component.

### 7.6 Content and configuration

- `src/data/site.ts` contains identity, navigation, availability, biography, email, social links, capabilities, and technology-wall entries.
- `src/content.config.ts` defines the project collection and validation schema.
- `src/content/projects/*.md` contains one project per file with frontmatter and structured Markdown body.
- `src/lib/projects.ts` exposes focused queries for all projects, a project by slug, and related projects.

Required project fields:

- `title`
- `summary`
- `year`
- `role`
- `capabilities`
- `cover`
- `coverAlt`
- `question`
- `objective`
- `gallery` with at least three items

Optional fields:

- `client`
- `externalUrl`
- `featured`
- `order`
- `outcome`

Build-time schema validation rejects missing required content, malformed URLs, duplicate explicit ordering, or gallery items without alt text.

## 8. Data and Rendering Flow

1. Astro loads and validates the project collection at build time.
2. The landing queries featured projects, sorts them by explicit order and then year, and passes normalized entries to `ProjectsSection`.
3. `getStaticPaths()` returns one path and validated props object per project.
4. The detail page renders project content and requests related entries by shared capability, excluding the current project.
5. Site-wide copy and links come from `site.ts` and are passed into the relevant top-level components.
6. Animation modules query stable `data-*` hooks after DOM readiness; component classes remain styling hooks rather than implicit behavior contracts.

No runtime API, CMS, database, or server rendering is required for the initial release.

## 9. Error and Edge Handling

- Content schema errors fail the build with the affected project identified.
- Empty featured-project results render a clear editorial message and a contact link in development; the production build verifier must reject an empty project collection.
- Invalid or missing local media fails content validation/build.
- External project links are optional and omitted cleanly when absent.
- Images use fixed aspect-ratio containers to prevent layout shift.
- Animation initialization failures leave all content visible and native scrolling intact.
- The mobile navigation controls focus, closes with Escape, restores focus to the trigger, and prevents background interaction while open.
- Email and external links remain real anchors and do not depend on animation handlers.

## 10. Accessibility and Performance

- Use one `h1` per page and a logical heading hierarchy.
- Provide a skip link, visible focus styles, keyboard-operable navigation, descriptive links, and semantic landmarks.
- Decorative rings and the sphere are hidden from assistive technology.
- Gallery media requires useful alt text; purely decorative media uses empty alt text deliberately.
- Maintain WCAG AA contrast for all text and interactive states.
- Respect reduced motion and browser zoom.
- Optimize local images at build time and lazy-load below-the-fold gallery media.
- Preload only the critical local font subset/variable file and hero media if it is a raster asset.
- Avoid shipping a UI framework; Astro, focused animation libraries, and small local modules are sufficient.

## 11. Verification and Acceptance Criteria

The work is accepted when all of the following are true:

1. The project declares the latest verified stable Astro release, 7.2.2.
2. A production build succeeds without content validation warnings.
3. The landing visibly contains the approved flow: preloader, header, hero, statement, about, technology wall, featured projects, capabilities, contact, and footer.
4. Hero, about, projects, technology stack/capabilities, and contact are distinct, reusable components.
5. At least three demo projects render on the landing and each has a working `/projects/<slug>/` route.
6. Every demo project has a detail introduction and at least three gallery items.
7. Site copy is centralized in `site.ts`; project copy/media references are centralized in project content files.
8. Original demo assets are stored by project and are replaceable without component edits.
9. GSAP/ScrollTrigger and Lenis provide the approved motion choreography on capable devices.
10. Reduced-motion mode disables smooth scrolling and nonessential motion.
11. All semantic content and links remain usable if client JavaScript fails or is disabled.
12. Desktop and mobile visual inspections show no horizontal overflow, obscured content, or broken galleries.
13. Keyboard checks pass for skip link, navigation, project cards, mobile menu, contact links, and page transition behavior.
14. The visual palette, sphere singleton rule, flat surfaces, sharp cards, typography scale, and hairline grid remain faithful to the supplied design.
15. The repository includes concise instructions for changing personal data, technologies, project text, and project media.

## 12. Explicit Non-Goals

- No CMS, database, authentication, analytics dashboard, or administration UI.
- No contact-form submission without a real endpoint.
- No WebGL or Three.js scene.
- No copied OFF+BRAND assets, client names, portfolio copy, or proprietary fonts.
- No secondary color theme, dark mode, rounded card system, or shadow-based elevation.
- No filtering application or separate all-projects index in the initial release; the landing's featured-work region is the project index.

