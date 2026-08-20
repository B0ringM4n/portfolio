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

function initPage() {
  cleanupPage?.();
  const cleanups = [
    safelySetup(setupMenu),
    safelySetup(setupPreloader),
    safelySetup(setupMotion),
  ];
  cleanupPage = () => cleanups.splice(0).reverse().forEach((cleanup) => cleanup());
}

document.addEventListener('astro:before-swap', () => cleanupPage?.());
document.addEventListener('astro:after-swap', () => {
  document.documentElement.classList.remove('is-transitioning');
});
document.addEventListener('astro:page-load', initPage);
