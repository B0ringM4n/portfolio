import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');
const artifactDirectory = join(rootDirectory, 'artifacts', 'visual-audit');
const baseUrl = process.env.VISUAL_AUDIT_BASE_URL ?? 'http://127.0.0.1:4321';

const captures = [
  {
    name: 'home-desktop-1440x900.png',
    path: '/',
    viewport: { width: 1440, height: 900 },
  },
  {
    name: 'home-mobile-390x844.png',
    path: '/',
    viewport: { width: 390, height: 844 },
  },
  {
    name: 'atlas-commerce-desktop-1440x900.png',
    path: '/projects/atlas-commerce/',
    viewport: { width: 1440, height: 900 },
  },
];

async function warmPage(page) {
  const viewport = page.viewportSize();
  assert.ok(viewport, 'visual audit viewport is unavailable');
  const wheelStep = Math.max(500, Math.floor(viewport.height * 0.82));
  let previousScroll = -1;

  for (let step = 0; step < 80; step += 1) {
    await page.mouse.wheel(0, wheelStep);
    await page.waitForTimeout(120);
    const position = await page.evaluate(() => ({
      y: window.scrollY,
      bottom: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
    }));
    if (position.bottom) break;
    assert.notEqual(position.y, previousScroll, 'visual warm-up stopped before page bottom');
    previousScroll = position.y;
  }

  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );

  for (let step = 0; step < 80; step += 1) {
    await page.mouse.wheel(0, -wheelStep);
    await page.waitForTimeout(80);
    if ((await page.evaluate(() => window.scrollY)) === 0) break;
  }
  await page.waitForTimeout(500);
}

await mkdir(artifactDirectory, { recursive: true });
const browser = await chromium.launch();

try {
  for (const capture of captures) {
    const context = await browser.newContext({
      deviceScaleFactor: 1,
      viewport: capture.viewport,
    });
    const page = await context.newPage();
    await page.goto(new URL(capture.path, baseUrl).href, { waitUntil: 'networkidle' });
    await page.locator('[data-preloader]').waitFor({ state: 'hidden', timeout: 3_000 });
    await page.addStyleTag({
      content: 'html { scrollbar-width: none; } html::-webkit-scrollbar { display: none; }',
    });
    await warmPage(page);

    const artifactPath = join(artifactDirectory, capture.name);
    await page.screenshot({ path: artifactPath, fullPage: true });
    const metadata = await sharp(artifactPath).metadata();
    assert.equal(metadata.width, capture.viewport.width, `${capture.name} width`);
    assert.ok((metadata.height ?? 0) >= capture.viewport.height, `${capture.name} height`);
    console.log(`${capture.name}: ${metadata.width}x${metadata.height}`);
    await context.close();
  }
} finally {
  await browser.close();
}
