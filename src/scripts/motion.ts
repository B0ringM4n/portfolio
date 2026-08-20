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

export function setupMotion(root: Document = document): Cleanup {
  const view = root.defaultView ?? window;
  const documentElement = root.documentElement;

  if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    removeMotionClasses(documentElement);
    return () => {};
  }

  gsap.registerPlugin(ScrollTrigger);

  let active = true;
  const pointerCleanups: Array<() => void> = [];
  const scrollTriggers: ScrollTrigger[] = [];
  const lenis = new Lenis({
    duration: 1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
  });
  const updateScrollTrigger = () => ScrollTrigger.update();
  const removeLenisScrollListener = lenis.on('scroll', updateScrollTrigger);
  const tick = (time: number) => lenis.raf(time * 1_000);
  gsap.ticker.add(tick);
  documentElement.classList.add('is-motion-ready');

  const context = gsap.context(() => {
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

    if (view.matchMedia('(pointer: fine)').matches) {
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
          element.removeEventListener('pointermove', move);
          element.removeEventListener('pointerleave', reset);
          element.removeEventListener('blur', reset);
          gsap.killTweensOf(element);
          gsap.set(element, { clearProps: 'x,y' });
        });
      }
    }
  }, documentElement);

  ScrollTrigger.refresh();

  return () => {
    if (!active) return;
    active = false;
    pointerCleanups.splice(0).reverse().forEach((cleanup) => cleanup());
    scrollTriggers.splice(0).forEach((trigger) => trigger.kill());
    context.revert();
    gsap.ticker.remove(tick);
    removeLenisScrollListener();
    lenis.destroy();
    removeMotionClasses(documentElement);
  };
}
