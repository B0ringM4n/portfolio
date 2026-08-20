import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import sharp from 'sharp';

const slugs = ['atlas-commerce', 'mono-culture', 'nexo-finance'];

test('each project owns contract-sized WebP media with distinct gallery frames', async () => {
  for (const slug of slugs) {
    const dir = `src/assets/projects/${slug}`;
    assert.equal(existsSync(dir), true, `${slug} asset directory is missing`);
    const files = readdirSync(dir).filter((file) => file.endsWith('.webp'));
    assert.equal(files.includes('cover.webp'), true, `${slug} cover is missing`);
    assert.ok(files.length >= 4, `${slug} needs a cover and three gallery images`);

    const expectedDimensions = new Map([
      ['cover.webp', { width: 1600, height: 1000 }],
      ['gallery-01.webp', { width: 1600, height: 1200 }],
      ['gallery-02.webp', { width: 1600, height: 1200 }],
      ['gallery-03.webp', { width: 1600, height: 1200 }],
    ]);

    for (const [filename, expected] of expectedDimensions) {
      const metadata = await sharp(join(dir, filename)).metadata();
      assert.equal(metadata.width, expected.width, `${slug} ${filename} width is incorrect`);
      assert.equal(metadata.height, expected.height, `${slug} ${filename} height is incorrect`);
    }

    const galleryHashes = await Promise.all(
      ['gallery-01.webp', 'gallery-02.webp', 'gallery-03.webp'].map(async (filename) => (
        createHash('sha256').update(await readFile(join(dir, filename))).digest('hex')
      )),
    );
    assert.equal(new Set(galleryHashes).size, 3, `${slug} gallery frames must be unique`);
  }
});

test('the technology wall owns exactly ten SVG marks', () => {
  assert.equal(readdirSync('public/marks').filter((file) => file.endsWith('.svg')).length, 10);
});
