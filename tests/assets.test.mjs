import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';
import { renderFrame } from '../scripts/generate-project-assets.mjs';
import {
  acceptedRasterExtensions,
  collectProjectAssetRecords,
} from './helpers/project-assets.mjs';

const acceptedSharpFormats = new Set(['avif', 'webp', 'png', 'jpeg']);

test('every frontmatter-referenced local project image is a valid accepted raster', async () => {
  const projects = await collectProjectAssetRecords('src/content/projects');
  assert.ok(projects.length > 0, 'at least one project record is required');
  assert.deepEqual(
    [...acceptedRasterExtensions].sort(),
    ['.avif', '.jpeg', '.jpg', '.png', '.webp'],
  );

  for (const project of projects) {
    assert.ok(project.cover, `${project.slug} cover reference is missing`);
    assert.ok(project.gallery.length >= 3, `${project.slug} needs at least three gallery images`);

    for (const asset of [project.cover, ...project.gallery]) {
      assert.ok(
        acceptedRasterExtensions.has(asset.extension),
        `${project.slug} ${asset.reference} must use AVIF, WebP, PNG, JPEG or JPG`,
      );
      assert.ok(existsSync(asset.absolutePath), `${project.slug} ${asset.reference} is missing`);
      const metadata = await sharp(asset.absolutePath).metadata();
      assert.ok(
        acceptedSharpFormats.has(metadata.format),
        `${project.slug} ${asset.reference} contents are not an accepted raster`,
      );
      assert.ok((metadata.width ?? 0) > 0, `${project.slug} ${asset.reference} has no width`);
      assert.ok((metadata.height ?? 0) > 0, `${project.slug} ${asset.reference} has no height`);
    }

    const galleryHashes = await Promise.all(
      project.gallery.map(async ({ absolutePath }) =>
        createHash('sha256').update(await readFile(absolutePath)).digest('hex'),
      ),
    );
    assert.equal(
      new Set(galleryHashes).size,
      galleryHashes.length,
      `${project.slug} gallery frames must be pairwise distinct`,
    );
  }
});

test('the default project artwork generator remains deterministic', () => {
  const project = {
    tones: ['#0b352d', '#d7ff56', '#f5f3ea'],
    label: 'ATLAS / COMMERCE',
  };
  const first = renderFrame(project, 0, 1600, 1000);
  const second = renderFrame(project, 0, 1600, 1000);

  assert.equal(first, second);
  assert.match(first, /width="1600" height="1000"/);
  assert.match(first, /ATLAS \/ COMMERCE/);
});

test('the technology wall owns exactly ten SVG marks', () => {
  assert.equal(readdirSync('public/marks').filter((file) => file.endsWith('.svg')).length, 10);
});
