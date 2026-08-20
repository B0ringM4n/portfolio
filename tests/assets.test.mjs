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
