export interface Cleanup {
  (): void;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function setupMenu(root: Document = document): Cleanup {
  const trigger = root.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-menu-panel]');
  const main = root.querySelector<HTMLElement>('main');

  if (!trigger || !panel) {
    return () => {};
  }

  const documentElement = root.documentElement;
  let isOpen = false;

  const closeMenu = (restoreFocus = true) => {
    if (!isOpen) return;

    isOpen = false;
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    panel.removeAttribute('data-menu-open');
    main?.removeAttribute('inert');

    if (restoreFocus) trigger.focus();
  };

  const openMenu = () => {
    isOpen = true;
    trigger.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    panel.setAttribute('data-menu-open', '');
    main?.setAttribute('inert', '');

    const firstFocusable = panel.querySelector<HTMLElement>(focusableSelector);
    (firstFocusable ?? panel).focus();
  };

  const handleToggle = () => {
    if (isOpen) {
      closeMenu();
      return;
    }

    openMenu();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusableElements.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements.at(-1)!;
    const activeElement = root.activeElement;

    if (event.shiftKey && activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  const handlePanelClick = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest('a[href]')) closeMenu(false);
  };

  documentElement.classList.add('js-enhanced');
  trigger.addEventListener('click', handleToggle);
  root.addEventListener('keydown', handleKeydown);
  panel.addEventListener('click', handlePanelClick);

  return () => {
    trigger.removeEventListener('click', handleToggle);
    root.removeEventListener('keydown', handleKeydown);
    panel.removeEventListener('click', handlePanelClick);
    closeMenu(false);
    documentElement.classList.remove('js-enhanced');
    trigger.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    panel.removeAttribute('data-menu-open');
    main?.removeAttribute('inert');
  };
}
