import gsap from 'gsap';

export interface Cleanup {
  (): void;
}

const sessionKey = 'editorial-portfolio:preloader-seen';
const completionMessage = 'Contenido listo';

export function setupPreloader(root: Document = document): Cleanup {
  const cover = root.querySelector<HTMLElement>('[data-preloader]');
  const counter = root.querySelector<HTMLElement>('[data-preloader-counter]');
  const status = root.querySelector<HTMLElement>('[data-preloader-status]');

  if (!cover || !counter || !status) return () => {};

  const documentElement = root.documentElement;
  let active = true;
  let dismissed = false;
  let timeline: gsap.core.Timeline | undefined;
  let hardDismissTimer: number | undefined;

  const stopAnimation = () => {
    timeline?.kill();
    timeline = undefined;
  };

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    stopAnimation();
    if (hardDismissTimer !== undefined) window.clearTimeout(hardDismissTimer);
    documentElement.classList.remove('is-preloading');
    cover.hidden = true;
    status.textContent = completionMessage;
    root.dispatchEvent(new CustomEvent('portfolio:preloader-complete'));
  };

  hardDismissTimer = window.setTimeout(dismiss, 2_500);

  try {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasPlayed = window.sessionStorage.getItem(sessionKey) === 'true';

    if (reducedMotion || hasPlayed) {
      dismiss();
    } else {
      try {
        window.sessionStorage.setItem(sessionKey, 'true');
      } catch {
        dismiss();
      }

      if (!dismissed) {
        cover.hidden = false;
        documentElement.classList.add('is-preloading');
        counter.textContent = '5%';

        const runOpening = () => {
          if (!active || dismissed) return;

          const progress = { value: 5 };
          timeline = gsap
            .timeline({ onComplete: dismiss })
            .to(progress, {
              value: 100,
              duration: 0.8,
              ease: 'power2.inOut',
              onUpdate: () => {
                counter.textContent = `${Math.round(progress.value)}%`;
              },
            })
            .to(cover, { yPercent: -100, duration: 0.65, ease: 'power3.inOut' }, '-=0.05');
        };

        const fontsReady = root.fonts?.ready ?? Promise.resolve();
        void Promise.resolve(fontsReady).then(runOpening).catch(dismiss);
      }
    }
  } catch {
    dismiss();
  }

  return () => {
    if (!active) return;
    active = false;
    stopAnimation();
    if (hardDismissTimer !== undefined) window.clearTimeout(hardDismissTimer);
    documentElement.classList.remove('is-preloading');
    cover.hidden = true;
  };
}
