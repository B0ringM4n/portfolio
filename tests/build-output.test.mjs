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
