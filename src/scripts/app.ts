import { setupMenu } from './menu';
import { setupMotion } from './motion';
import { setupPreloader } from './preloader';

let cleanupPage: (() => void) | undefined;

function safelySetup(setup: () => () => void) {
  try {
    return setup();
  } catch {
    return () => {};
  }
}

function safelyCleanup(cleanup: (() => void) | undefined) {
  if (!cleanup) return;
  try {
    cleanup();
  } catch {
    // Continue releasing the remaining page enhancements.
  }
}

function initPage() {
  safelyCleanup(cleanupPage);
  const cleanups = [
    safelySetup(setupMenu),
    safelySetup(setupPreloader),
    safelySetup(setupMotion),
  ];
  cleanupPage = () =>
    cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => safelyCleanup(cleanup));
}

document.addEventListener('astro:before-swap', () => safelyCleanup(cleanupPage));
document.addEventListener('astro:after-swap', () => {
  document.documentElement.classList.remove('is-transitioning');
});
document.addEventListener('astro:page-load', initPage);
