import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface Cleanup {
  (): void;
}

function removeMotionClasses(documentElement: HTMLElement) {
  for (const className of Array.from(documentElement.classList)) {
    if (className === 'lenis' || className.startsWith('lenis-')) {
      documentElement.classList.remove(className);
    }
  }
  documentElement.classList.remove('is-motion-ready');
}

function safelyRun(action: (() => void) | undefined) {
  if (!action) return;
  try {
    action();
  } catch {
    // Teardown is best-effort: one failed release must not retain later resources.
  }
}

export function setupMotion(root: Document = document): Cleanup {
  const view = root.defaultView ?? window;
  const documentElement = root.documentElement;

  if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    removeMotionClasses(documentElement);
    return () => {};
  }

  let active = true;
  const pointerCleanups: Array<() => void> = [];
  const scrollTriggers: ScrollTrigger[] = [];
  let context: gsap.Context | undefined;
  let lenis: Lenis | undefined;
  let removeLenisScrollListener: (() => void) | undefined;
  let tick: ((time: number) => void) | undefined;

  const teardown = () => {
    if (!active) return;
    active = false;
    pointerCleanups.splice(0).reverse().forEach((cleanup) => safelyRun(cleanup));
    scrollTriggers.splice(0).forEach((trigger) => safelyRun(() => trigger.kill()));
    safelyRun(() => context?.revert());
    safelyRun(tick ? () => gsap.ticker.remove(tick!) : undefined);
    safelyRun(removeLenisScrollListener);
    safelyRun(() => lenis?.destroy());
    removeMotionClasses(documentElement);
  };

  try {
    gsap.registerPlugin(ScrollTrigger);

    const currentLenis = new Lenis({
      duration: 1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });
    lenis = currentLenis;
    const updateScrollTrigger = () => ScrollTrigger.update();
    removeLenisScrollListener = currentLenis.on('scroll', updateScrollTrigger);
    tick = (time: number) => currentLenis.raf(time * 1_000);
    gsap.ticker.add(tick);
    documentElement.classList.add('is-motion-ready');

    const finePointer = view.matchMedia('(pointer: fine)').matches;
    context = gsap.context(() => {}, documentElement);
    context.add(() => {
      const heroLines = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-line]'));
      const sphere = root.querySelector<HTMLElement>('[data-sphere]');
      const opening = gsap.timeline({ paused: true });

      if (sphere) {
        opening.fromTo(
          sphere,
          { autoAlpha: 0, scale: 0.94, y: 24 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 1.05, ease: 'power3.out' },
          0,
        );

        const sphereDrift = gsap.to(sphere, {
          yPercent: 9,
          rotate: 1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: sphere,
            start: 'top 85%',
            end: 'bottom top',
            scrub: 1,
          },
        });
        if (sphereDrift.scrollTrigger) scrollTriggers.push(sphereDrift.scrollTrigger);
      }

      if (heroLines.length > 0) {
        opening.fromTo(
          heroLines,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' },
          0.08,
        );
      }

      const playOpening = () => {
        if (active) opening.play();
      };
      const preloader = root.querySelector<HTMLElement>('[data-preloader]');
      if (!preloader || preloader.hidden) {
        playOpening();
      } else {
        root.addEventListener('portfolio:preloader-complete', playOpening, { once: true });
        pointerCleanups.push(() =>
          root.removeEventListener('portfolio:preloader-complete', playOpening),
        );
      }

      for (const element of root.querySelectorAll<HTMLElement>('[data-reveal]')) {
        const reveal = gsap.fromTo(
          element,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              once: true,
            },
          },
        );
        if (reveal.scrollTrigger) scrollTriggers.push(reveal.scrollTrigger);
      }

      for (const element of root.querySelectorAll<HTMLElement>('[data-parallax]')) {
        const parallax = gsap.fromTo(
          element,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: 'none',
            scrollTrigger: {
              trigger: element.parentElement ?? element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        );
        if (parallax.scrollTrigger) scrollTriggers.push(parallax.scrollTrigger);
      }

      if (finePointer) {
        for (const element of root.querySelectorAll<HTMLElement>('[data-magnetic]')) {
          const move = (event: PointerEvent) => {
            const bounds = element.getBoundingClientRect();
            const x = gsap.utils.clamp(
              -8,
              8,
              (event.clientX - bounds.left - bounds.width / 2) * 0.12,
            );
            const y = gsap.utils.clamp(
              -8,
              8,
              (event.clientY - bounds.top - bounds.height / 2) * 0.12,
            );
            gsap.to(element, { x, y, duration: 0.28, ease: 'power3.out', overwrite: true });
          };
          const reset = () => {
            gsap.to(element, {
              x: 0,
              y: 0,
              duration: 0.4,
              ease: 'power3.out',
              overwrite: true,
            });
          };

          element.addEventListener('pointermove', move);
          element.addEventListener('pointerleave', reset);
          element.addEventListener('blur', reset);
          pointerCleanups.push(() => {
            safelyRun(() => element.removeEventListener('pointermove', move));
            safelyRun(() => element.removeEventListener('pointerleave', reset));
            safelyRun(() => element.removeEventListener('blur', reset));
            safelyRun(() => gsap.killTweensOf(element));
            safelyRun(() => gsap.set(element, { clearProps: 'x,y' }));
          });
        }
      }
    });

    ScrollTrigger.refresh();
  } catch {
    teardown();
  }

  return teardown;
}
