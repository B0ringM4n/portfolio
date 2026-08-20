import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const home = () => readFileSync('dist/index.html', 'utf8');

const homeStyles = () => {
  const stylesheetHref = home().match(/<link rel="stylesheet" href="([^"]+\.css)"/)?.[1];
  assert.ok(stylesheetHref, 'home stylesheet is missing');
  return readFileSync(`dist${stylesheetHref}`, 'utf8');
};

test('home exposes semantic shell and no-JavaScript navigation', () => {
  const html = home();
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<header[^>]*data-site-header/);
  assert.match(html, /<main[^>]*id="main-content"/);
  assert.match(html, /<footer[^>]*data-site-footer/);
  assert.match(html, /href="#projects"/);
  assert.match(html, /href="#contact"/);
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
