import { expect, test } from '@playwright/test';

// The production deadline is 2,500ms; 300ms covers browser scheduling plus one 50ms poll.
const preloaderHardDeadlineWithSchedulerTolerance = 2_800;

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
  async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document.fonts, 'ready', {
        configurable: true,
        get() {
          return new Promise(() => {});
        },
      });
    });
    await page.goto('/');

    const preloader = page.locator('[data-preloader]');
    await expect(preloader).toBeVisible();
    await expect
      .poll(() => preloader.isHidden(), {
        timeout: preloaderHardDeadlineWithSchedulerTolerance,
        intervals: [50],
      })
      .toBe(true);
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

for (const viewport of [
  { name: 'desktop', width: 1_440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const) {
  test(`home has no horizontal overflow at the ${viewport.name} audit viewport`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('[data-preloader]')).toBeHidden({
      timeout: preloaderHardDeadlineWithSchedulerTolerance,
    });

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test('desktop keyboard order reaches the skip link and first navigation items', async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 900 });
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({
    timeout: preloaderHardDeadlineWithSchedulerTolerance,
  });

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-site-header] > div > a').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.locator('[data-site-header] nav[aria-label="Navegación principal"] a').first(),
  ).toBeFocused();
});

test('contact email remains a native mail link', async ({ page }) => {
  await page.goto('/');
  const email = page.locator('#contact a[href^="mailto:"]');

  await expect(email).toHaveCount(1);
  await expect(email).toHaveAttribute('href', 'mailto:hello@alexrivera.dev');
});

test('every project gallery image has useful text and positive rendered dimensions', async ({
  page,
}) => {
  for (const slug of ['atlas-commerce', 'mono-culture', 'nexo-finance']) {
    await page.goto(`/projects/${slug}/`);
    const images = page.locator('[data-gallery-item] img');
    await expect(images).toHaveCount(3);

    for (const image of await images.all()) {
      const rendered = await image.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          alt: element.getAttribute('alt')?.trim() ?? '',
          width: bounds.width,
          height: bounds.height,
        };
      });
      expect(rendered.alt, `${slug} gallery image alt`).not.toBe('');
      expect(rendered.width, `${slug} gallery image width`).toBeGreaterThan(0);
      expect(rendered.height, `${slug} gallery image height`).toBeGreaterThan(0);
    }
  }
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

test('late motion setup failure rolls back Lenis, listeners, and enhancement state', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const activeWheelListeners = new Set<EventListenerOrEventListenerObject>();
    const nativeAddEventListener = EventTarget.prototype.addEventListener;
    const nativeRemoveEventListener = EventTarget.prototype.removeEventListener;
    const nativeMatchMedia = window.matchMedia.bind(window);
    const testWindow = window as typeof window & { __activeLenisWheelListeners: number };
    testWindow.__activeLenisWheelListeners = 0;

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      nativeAddEventListener.call(this, type, listener, options);
      if (this === window && type === 'wheel' && listener) {
        activeWheelListeners.add(listener);
        testWindow.__activeLenisWheelListeners = activeWheelListeners.size;
      }
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      nativeRemoveEventListener.call(this, type, listener, options);
      if (this === window && type === 'wheel' && listener) {
        activeWheelListeners.delete(listener);
        testWindow.__activeLenisWheelListeners = activeWheelListeners.size;
      }
    };
    window.matchMedia = (query) => {
      if (query === '(pointer: fine)') throw new Error('Pointer capability unavailable');
      return nativeMatchMedia(query);
    };
  });
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });

  const listenerBaseline = await page.evaluate(
    () =>
      (window as typeof window & { __activeLenisWheelListeners: number })
        .__activeLenisWheelListeners,
  );

  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
  });

  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
  await expect(page.locator('html')).not.toHaveClass(/is-motion-ready|is-preloading/);
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page.locator('[data-hero-line]').first()).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __activeLenisWheelListeners: number })
            .__activeLenisWheelListeners,
      ),
    )
    .toBe(listenerBaseline);

  const initialScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScroll);
});

test('one throwing cleanup cannot block remaining lifecycle teardown', async ({ page }) => {
  await page.addInitScript(() => {
    const activeMenuClickListeners = new Set<EventListenerOrEventListenerObject>();
    const nativeAddEventListener = EventTarget.prototype.addEventListener;
    const nativeRemoveEventListener = EventTarget.prototype.removeEventListener;
    const nativeSetTimeout = window.setTimeout.bind(window);
    const nativeClearTimeout = window.clearTimeout.bind(window);
    const testWindow = window as typeof window & {
      __armPreloaderCleanupFailure: () => void;
      __activeMenuClickListeners: number;
    };
    let cleanupFailureArmed = false;
    let preloaderTimer: number | undefined;
    testWindow.__activeMenuClickListeners = 0;
    testWindow.__armPreloaderCleanupFailure = () => {
      cleanupFailureArmed = true;
    };

    window.setTimeout = ((handler: TimerHandler, timeout = 0, ...args: unknown[]) => {
      const timer = nativeSetTimeout(handler, timeout, ...args);
      if (timeout === 2_500) preloaderTimer = timer;
      return timer;
    }) as typeof window.setTimeout;
    window.clearTimeout = ((timer) => {
      if (cleanupFailureArmed && timer === preloaderTimer) {
        cleanupFailureArmed = false;
        throw new Error('Injected preloader cleanup failure');
      }
      nativeClearTimeout(timer);
    }) as typeof window.clearTimeout;

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      nativeAddEventListener.call(this, type, listener, options);
      if (
        this instanceof Element &&
        this.matches('[data-menu-toggle]') &&
        type === 'click' &&
        listener
      ) {
        activeMenuClickListeners.add(listener);
        testWindow.__activeMenuClickListeners = activeMenuClickListeners.size;
      }
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      nativeRemoveEventListener.call(this, type, listener, options);
      if (
        this instanceof Element &&
        this.matches('[data-menu-toggle]') &&
        type === 'click' &&
        listener
      ) {
        activeMenuClickListeners.delete(listener);
        testWindow.__activeMenuClickListeners = activeMenuClickListeners.size;
      }
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });

  const trigger = page.locator('[data-menu-toggle]');
  await trigger.click();
  await expect(page.locator('main')).toHaveAttribute('inert', '');

  await page.evaluate(() => {
    (
      window as typeof window & {
        __armPreloaderCleanupFailure: () => void;
      }
    ).__armPreloaderCleanupFailure();
    document.dispatchEvent(new Event('astro:before-swap'));
  });

  await expect(page.locator('html')).not.toHaveClass(/\blenis\b|is-motion-ready/);
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await page.evaluate(() => {
    document.dispatchEvent(new Event('astro:page-load'));
    document.dispatchEvent(new Event('astro:page-load'));
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __activeMenuClickListeners: number })
            .__activeMenuClickListeners,
      ),
    )
    .toBe(1);
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

test('magnetic links respond modestly and return to rest', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2_500 });
  test.skip(
    !(await page.evaluate(() => window.matchMedia('(pointer: fine)').matches)),
    'Magnetic response requires a fine pointer.',
  );

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

test('mobile menu navigation cleans state and remains usable across repeated swaps', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/atlas-commerce/');
  await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3_000 });

  const navigateThroughMenu = async (name: 'Proyectos' | 'Perfil') => {
    const trigger = page.locator('[data-menu-toggle]');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('main')).toHaveAttribute('inert', '');
    await page.locator('[data-menu-panel]').getByRole('link', { name, exact: true }).click();

    await expect(page.locator('[data-project-card]')).toHaveCount(3);
    await expect(page.locator('[data-site-header]')).toHaveCount(1);
    await expect(page.locator('[data-site-footer]')).toHaveCount(1);
    const currentTrigger = page.locator('[data-menu-toggle]');
    await expect(currentTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-menu-panel]')).toBeHidden();
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
    await currentTrigger.focus();
    await expect(currentTrigger).toBeFocused();
  };

  await navigateThroughMenu('Proyectos');

  const projectCard = page.locator('[data-project-card]').first();
  await projectCard.scrollIntoViewIfNeeded();
  await expect(projectCard).toBeVisible();
  await projectCard.getByRole('link').click();
  await expect(page.locator('[data-project-hero]')).toBeVisible();

  await navigateThroughMenu('Perfil');
  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.locator('[data-site-header]')).toHaveCount(1);
  await expect(page.locator('[data-site-footer]')).toHaveCount(1);
});
