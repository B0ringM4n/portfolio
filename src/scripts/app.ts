import { setupMenu } from './menu';
import { setupMotion } from './motion';
import { setupPreloader } from './preloader';

let cleanupPage: (() => void) | undefined;

const beginPageTransition = () => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('is-transitioning');
  }
};

const endPageTransition = () => {
  document.documentElement.classList.remove('is-transitioning');
};

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
document.addEventListener('astro:before-preparation', beginPageTransition);
document.addEventListener('astro:after-swap', endPageTransition);
document.addEventListener('astro:page-load', () => {
  endPageTransition();
  initPage();
});
