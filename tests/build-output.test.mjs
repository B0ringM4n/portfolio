import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const home = () => readFileSync('dist/index.html', 'utf8');

const pageStyles = (html) => {
  const stylesheetHrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+\.css)"/g)].map(
    ([, href]) => href,
  );
  assert.ok(stylesheetHrefs.length > 0, 'page stylesheet is missing');
  return stylesheetHrefs.map((href) => readFileSync(`dist${href}`, 'utf8')).join('\n');
};

const homeStyles = () => pageStyles(home());

const count = (html, pattern) => (html.match(pattern) ?? []).length;

const assertInOrder = (html, markers, label) => {
  let previousIndex = -1;
  for (const marker of markers) {
    const index = html.indexOf(marker);
    assert.ok(index > previousIndex, `${label}: ${marker} is missing or out of order`);
    previousIndex = index;
  }
};

test('home exposes semantic shell and no-JavaScript navigation', () => {
  const html = home();
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<header[^>]*data-site-header/);
  assert.match(html, /<main[^>]*id="main-content"/);
  assert.match(html, /<footer[^>]*data-site-footer/);
  assert.match(html, /href="\/#projects"/);
  assert.match(html, /href="\/#contact"/);
});

test('landing renders the complete approved narrative flow', () => {
  const html = home();
  assertInOrder(
    html,
    ['hero', 'statement', 'about', 'stack', 'projects', 'capabilities', 'contact'].map(
      (id) => `id="${id}"`,
    ),
    'home narrative',
  );
  assert.equal(count(html, /data-project-card/g), 3);
  assert.equal(count(html, /data-tech-cell/g), 10);
  assert.equal(count(html, /data-gradient-sphere/g), 1);
  assert.match(html, /mailto:hello@alexrivera\.dev/);
});

test('landing preserves exact content and approved motion-hook contracts', () => {
  const html = home();
  const motionHookCounts = new Map([
    ['data-hero-line', 3],
    ['data-sphere', 1],
    ['data-reveal', 32],
    ['data-parallax', 3],
    ['data-magnetic', 6],
  ]);

  assert.equal(count(html, /<h1(?:\s|>)/g), 1);
  assert.equal(count(html, /class="capabilities-section__index"/g), 6);
  for (const [hook, expected] of motionHookCounts) {
    assert.equal(count(html, new RegExp(hook, 'g')), expected, `${hook} count changed`);
  }
});

test('project count exposes text to assistive technology instead of an aria-label override', () => {
  const html = home();
  assert.match(
    html,
    /<p class="projects-section__count"><span aria-hidden="true">03<\/span><span class="sr-only">3 proyectos<\/span><\/p>/,
  );
  assert.doesNotMatch(html, /class="projects-section__count" aria-label=/);
});

test('every sample project builds the exact complete detail flow', () => {
  for (const slug of ['atlas-commerce', 'mono-culture', 'nexo-finance']) {
    const html = readFileSync(`dist/projects/${slug}/index.html`, 'utf8');
    assert.equal(count(html, /<h1(?:\s|>)/g), 1, `${slug} must have exactly one h1`);
    assertInOrder(
      html,
      [
        'data-project-hero',
        'data-project-question',
        'data-project-objective',
        'data-project-strategy',
        'class="gallery project-frame"',
        'data-project-outcome',
        'class="related-projects project-frame"',
        'id="contact"',
      ],
      slug,
    );

    const galleryItems = html.match(/<figure[^>]*data-gallery-item[\s\S]*?<\/figure>/g) ?? [];
    assert.ok(galleryItems.length >= 3, `${slug} needs at least three gallery items`);
    for (const item of galleryItems) {
      assert.match(item, /<img[^>]*alt="[^"]+"[^>]*>/, `${slug} gallery alt is empty`);
      assert.match(item, /<img[^>]*loading="lazy"[^>]*>/, `${slug} gallery image is not lazy`);
    }

    const relatedItems = html.match(/<article[^>]*data-related-project[\s\S]*?<\/article>/g) ?? [];
    assert.ok(relatedItems.length > 0, `${slug} needs at least one related project`);
    assert.ok(relatedItems.length <= 3, `${slug} has more than three related projects`);
    for (const item of relatedItems) {
      assert.doesNotMatch(item, new RegExp(`href="/projects/${slug}/"`));
    }
  }
});

test('404 output keeps the branded shell without a decorative sphere', () => {
  const html = readFileSync('dist/404.html', 'utf8');
  assert.match(html, /<header[^>]*data-site-header/);
  assert.match(html, /<footer[^>]*data-site-footer/);
  assert.match(html, /<h1[^>]*>Esta página no está aquí\.<\/h1>/);
  assert.match(html, /<a href="\/">Volver al inicio ↗<\/a>/);
  assert.doesNotMatch(html, /data-gradient-sphere/);
});

test('every shell uses canonical root-relative home-section links', () => {
  for (const file of [
    'dist/index.html',
    'dist/projects/atlas-commerce/index.html',
    'dist/projects/mono-culture/index.html',
    'dist/projects/nexo-finance/index.html',
    'dist/404.html',
  ]) {
    const html = readFileSync(file, 'utf8');
    for (const [id, expectedCount] of [
      ['about', 4],
      ['projects', 4],
      ['contact', 5],
    ]) {
      assert.equal(
        count(html, new RegExp(`href="/#${id}"`, 'g')),
        expectedCount,
        `${file} shell link /#${id} count changed`,
      );
    }
    assert.doesNotMatch(html, /href="#(?:about|projects|contact)"/);
  }
});

test('related project links remain a static non-motion affordance', () => {
  const html = readFileSync('dist/projects/atlas-commerce/index.html', 'utf8');
  const css = pageStyles(html);
  assert.doesNotMatch(css, /\.related-project__media img\{[^}]*transition:/);
  assert.doesNotMatch(css, /\.related-project[^}]*\{(?:transform:|[^}]*;transform:)/);
});

test('statement exposes real assistive text beside its decorative line rendering', () => {
  const html = home();
  assert.match(
    html,
    /<p class="statement-section__accessible sr-only">Creo experiencias digitales nítidas, expresivas y construidas para durar\.<\/p>/,
  );
  assert.match(html, /<p class="statement-section__copy" aria-hidden="true">/);
});

test('tablet output uses six capability columns with explicit content spans', () => {
  const css = homeStyles();
  const tabletStart = css.indexOf('@media (width>=43.75rem) and (width<=63.9375rem)');
  const tabletEnd = css.indexOf('@media (width<=43.6875rem)', tabletStart);
  assert.notEqual(tabletStart, -1, 'tablet media query is missing');
  assert.notEqual(tabletEnd, -1, 'tablet media query is not bounded by the mobile query');
  const tabletCss = css.slice(tabletStart, tabletEnd);

  assert.match(
    tabletCss,
    /\.capabilities-section__list>li\{grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/,
  );
  assert.match(tabletCss, /\.capabilities-section__index\{grid-column:1\/2\}/);
  assert.match(tabletCss, /\.capabilities-section__list h3\{grid-column:2\/5\}/);
  assert.match(tabletCss, /\.capabilities-section__description\{grid-column:5\/-1\}/);
});
