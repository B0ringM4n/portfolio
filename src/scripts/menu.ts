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
  const closeButton = root.querySelector<HTMLButtonElement>('[data-menu-close]');
  const backgrounds = Array.from(
    root.querySelectorAll<HTMLElement>('[data-menu-background]'),
  );

  if (!trigger || !panel || !closeButton) {
    return () => {};
  }

  const documentElement = root.documentElement;
  const openLabel = trigger.getAttribute('aria-label') ?? 'Abrir menú';
  const openStateLabel = trigger.dataset.menuOpenLabel ?? 'Menú abierto';
  const previousInert = new Map<HTMLElement, boolean>();
  let isOpen = false;

  const restoreBackground = () => {
    for (const element of backgrounds) {
      if (previousInert.get(element)) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
    }
    previousInert.clear();
  };

  const closeMenu = (restoreFocus = true) => {
    if (!isOpen) return;

    isOpen = false;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', openLabel);
    panel.hidden = true;
    panel.removeAttribute('data-menu-open');
    restoreBackground();

    if (restoreFocus) trigger.focus();
  };

  const openMenu = () => {
    isOpen = true;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', openStateLabel);
    panel.hidden = false;
    panel.setAttribute('data-menu-open', '');
    for (const element of backgrounds) {
      previousInert.set(element, element.hasAttribute('inert'));
      element.setAttribute('inert', '');
    }

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
  closeButton.addEventListener('click', handleToggle);
  root.addEventListener('keydown', handleKeydown);
  panel.addEventListener('click', handlePanelClick);

  return () => {
    trigger.removeEventListener('click', handleToggle);
    closeButton.removeEventListener('click', handleToggle);
    root.removeEventListener('keydown', handleKeydown);
    panel.removeEventListener('click', handlePanelClick);
    closeMenu(false);
    documentElement.classList.remove('js-enhanced');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', openLabel);
    panel.hidden = true;
    panel.removeAttribute('data-menu-open');
    restoreBackground();
  };
}
