import { expect, test } from '@playwright/test';

test('first visit announces completion and hard-dismisses the preloader', async ({ page }) => {
  await page.goto('/');

  const preloader = page.locator('[data-preloader]');
  const counter = page.locator('[data-preloader-counter]');
  const status = page.locator('[data-preloader-status]');

  await expect(preloader).toBeVisible();
  await expect(preloader).not.toHaveAttribute('aria-hidden', 'true');
  await expect(counter).toHaveAttribute('aria-hidden', 'true');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toHaveText('Contenido listo', { timeout: 2_500 });
  await expect(preloader).toBeHidden({ timeout: 2_500 });
  await expect(page.locator('html')).not.toHaveClass(/is-preloading/);
});

test('preloader storage failure dismisses safely without blocking navigation', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    Object.defineProperty(Storage.prototype, 'getItem', {
      configurable: true,
      value(key: string) {
        if (key === 'editorial-portfolio:preloader-seen') {
          throw new Error('Storage unavailable');
        }
        return nativeGetItem.call(this, key);
      },
    });
  });
  await page.goto('/');

  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 1_000 });
  await expect(page.locator('html')).not.toHaveClass(/is-preloading/);
  const projectCard = page.locator('[data-project-card]').first();
  await projectCard.scrollIntoViewIfNeeded();
  await expect(projectCard).toBeVisible();
  await projectCard.getByRole('link').click();
  await expect(page.locator('[data-project-hero]')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().every(({ playState }) => playState === 'finished'),
      ),
    )
    .toBe(true);
});

test('preloader font readiness failure dismisses safely', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document.fonts, 'ready', {
      configurable: true,
      get() {
        return Promise.reject(new Error('Fonts unavailable'));
      },
    });
  });
  await page.goto('/');

  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 1_000 });
  await expect(page.locator('[data-preloader-status]')).toHaveText('Contenido listo');
  await expect(page.locator('html')).not.toHaveClass(/is-preloading/);
});

test(
  'preloader hard-dismisses when font readiness never settles',
  async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes('mobile'), 'The hard deadline is viewport-independent.');
    await page.addInitScript(() => {
      Object.defineProperty(document.fonts, 'ready', {
        configurable: true,
        get() {
          return new Promise(() => {});
        },
      });
    });
    await page.goto('/');

    await expect(page.locator('[data-preloader]')).toBeVisible();
    await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3_000 });
    await expect(page.locator('html')).not.toHaveClass(/is-preloading/);
  },
);

test('server-rendered content stays visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.locator('[data-preloader]')).toBeHidden();
  await expect(page.locator('[data-hero-line]').first()).toBeVisible();
  await expect(page.locator('[data-project-card]')).toHaveCount(3);

  await context.close();
});

test('one failed enhancement does not prevent mobile menu setup', async ({ page }) => {
  await page.addInitScript(() => {
    window.matchMedia = () => {
      throw new Error('Motion preference unavailable');
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 1_000 });
  await expect(page.locator('[data-preloader-status]')).toHaveText('Contenido listo');
  const trigger = page.locator('[data-menu-toggle]');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('standard motion enhances scrolling with one Lenis instance', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });

  await expect(page.locator('html')).toHaveClass(/\blenis\b/);
});

test('below-fold editorial reveals become visible on scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });

  const heading = page
    .locator('[data-reveal]')
    .filter({ hasText: 'Proyectos seleccionados' })
    .first();
  await expect
    .poll(() => heading.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeLessThan(0.1);

  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeInViewport();
  await expect
    .poll(() => heading.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)))
    .toBeGreaterThan(0.9);
});

test('project media receives restrained parallax translation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });

  const media = page.locator('[data-parallax]').first();
  await media.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 240);

  await expect
    .poll(() =>
      media.evaluate((element) => {
        const transform = getComputedStyle(element).transform;
        return transform === 'none' ? 0 : Math.abs(new DOMMatrixReadOnly(transform).m42);
      }),
    )
    .toBeGreaterThan(1);
});

test('magnetic links respond modestly and return to rest', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Magnetic response is pointer-only.');
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });

  const link = page.locator('[data-magnetic]').first();
  await link.scrollIntoViewIfNeeded();
  const bounds = await link.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.move(bounds!.x + bounds!.width * 0.8, bounds!.y + bounds!.height * 0.2, {
    steps: 4,
  });

  const distanceFromRest = () =>
    link.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      if (transform === 'none') return 0;
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.hypot(matrix.m41, matrix.m42);
    });

  await expect.poll(distanceFromRest).toBeGreaterThan(0.5);
  await page.mouse.move(0, 0);
  await expect.poll(distanceFromRest).toBeLessThan(0.5);
});

test('page lifecycle cleanup is idempotent and reinitializes once', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });
  await expect(page.locator('html')).toHaveClass(/\blenis\b/);

  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:before-swap'));
    document.dispatchEvent(new Event('astro:before-swap'));
  });
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');

  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
  });
  await expect(page.locator('html')).toHaveClass(/\blenis\b/);

  await page.setViewportSize({ width: 390, height: 844 });
  const trigger = page.locator('[data-menu-toggle]');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('main')).toHaveAttribute('inert', '');

  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:before-swap'));
    document.dispatchEvent(new Event('astro:before-swap'));
  });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
});

test('desktop navigation reaches a project and returns without duplicate shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3_000 });

  const projectCard = page.locator('[data-project-card]').first();
  await projectCard.scrollIntoViewIfNeeded();
  await expect(projectCard).toBeVisible();
  await projectCard.getByRole('link').click();

  await expect(page.locator('[data-project-hero]')).toBeVisible();
  await expect(page.locator('[data-site-header]')).toHaveCount(1);
  await expect(page.locator('[data-site-footer]')).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().every(({ playState }) => playState === 'finished'),
      ),
    )
    .toBe(true);

  await page.locator('[data-site-header]').getByRole('link', { name: /inicio/i }).click();
  await expect(page.locator('[data-project-card]')).toHaveCount(3);
  await expect(page.locator('[data-site-header]')).toHaveCount(1);
  await expect(page.locator('[data-site-footer]')).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().every(({ playState }) => playState === 'finished'),
      ),
    )
    .toBe(true);
});

test('reduced motion keeps native scrolling and visible content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('[data-hero-line]').first()).toBeVisible();
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 1_000 });
});

test('mobile menu traps focus, marks content inert, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3_000 });

  const trigger = page.locator('[data-menu-toggle]');
  const panel = page.locator('[data-menu-panel]');
  const links = panel.getByRole('link');
  await trigger.click();

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(links.first()).toBeFocused();

  await links.last().focus();
  await page.keyboard.press('Tab');
  await expect(links.first()).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(links.last()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});
