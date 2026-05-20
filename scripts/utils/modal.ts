let active_modal: HTMLElement | null = null;
let previous_focus: HTMLElement | null = null;

const focusable_selector =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

export function initialize_modals(): void {
  const backdrop = get_backdrop();

  backdrop?.addEventListener("click", close_modal);

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest("[data-modal-close]")) {
      close_modal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!active_modal) {
      return;
    }

    if (event.key === "Escape") {
      close_modal();
      return;
    }

    if (event.key === "Tab") {
      trap_focus(event, active_modal);
    }
  });
}

export function open_modal(modal_id: string): void {
  const modal = document.getElementById(modal_id);
  const backdrop = get_backdrop();

  if (!modal || !backdrop) {
    return;
  }

  previous_focus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;

  active_modal = modal;
  backdrop.hidden = false;
  modal.hidden = false;
  document.body.classList.add("modal-open");

  window.requestAnimationFrame(() => {
    backdrop.classList.add("is-open");
    modal.classList.add("is-open");
    focus_first_element(modal);
  });
}

export function close_modal(): void {
  const backdrop = get_backdrop();

  if (!active_modal || !backdrop) {
    return;
  }

  const closing_modal = active_modal;
  active_modal = null;
  backdrop.classList.remove("is-open");
  closing_modal.classList.remove("is-open");
  document.body.classList.remove("modal-open");

  window.setTimeout(() => {
    backdrop.hidden = true;
    closing_modal.hidden = true;
    previous_focus?.focus();
    previous_focus = null;
  }, 160);
}

function get_backdrop(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-modal-backdrop]");
}

function focus_first_element(modal: HTMLElement): void {
  const focusable = modal.querySelector<HTMLElement>(focusable_selector);

  if (focusable) {
    focusable.focus();
    return;
  }

  modal.setAttribute("tabindex", "-1");
  modal.focus();
}

function trap_focus(event: KeyboardEvent, modal: HTMLElement): void {
  const focusable_elements = Array.from(
    modal.querySelectorAll<HTMLElement>(focusable_selector),
  ).filter((element) => !element.hasAttribute("disabled"));

  if (focusable_elements.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable_elements[0];
  const last = focusable_elements[focusable_elements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
