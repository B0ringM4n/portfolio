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
  for (const id of ['hero', 'statement', 'about', 'stack', 'projects', 'capabilities', 'contact']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.equal((html.match(/data-project-card/g) ?? []).length, 3);
  assert.equal((html.match(/data-tech-cell/g) ?? []).length, 10);
  assert.equal((html.match(/data-gradient-sphere/g) ?? []).length, 1);
  assert.match(html, /mailto:hello@alexrivera\.dev/);
});

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

test('404 output keeps the branded shell without a decorative sphere', () => {
  const html = readFileSync('dist/404.html', 'utf8');
  assert.match(html, /<header[^>]*data-site-header/);
  assert.match(html, /<footer[^>]*data-site-footer/);
  assert.match(html, /<h1[^>]*>Esta página no está aquí\.<\/h1>/);
  assert.match(html, /<a href="\/">Volver al inicio ↗<\/a>/);
  assert.doesNotMatch(html, /data-gradient-sphere/);
});

test('non-home shell navigation returns to canonical home sections', () => {
  for (const file of [
    'dist/projects/atlas-commerce/index.html',
    'dist/projects/mono-culture/index.html',
    'dist/projects/nexo-finance/index.html',
    'dist/404.html',
  ]) {
    const html = readFileSync(file, 'utf8');
    for (const id of ['about', 'projects', 'contact']) {
      assert.match(html, new RegExp(`href="/#${id}"`));
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
