export function initialize_sidebar(): void {
  const app_layout = document.querySelector<HTMLElement>(".app-layout");
  const sidebar_host = document.getElementById("sidebar");
  const sidebar = sidebar_host?.querySelector<HTMLElement>(".sidebar");
  const navbar_toggle = document.querySelector<HTMLButtonElement>(
    ".navbar-sidebar-toggle",
  );
  const collapse_button = sidebar?.querySelector<HTMLButtonElement>(
    ".sidebar-collapse-btn",
  );

  if (!app_layout || !sidebar_host || !sidebar) {
    return;
  }

  collapse_button?.addEventListener("click", () => {
    const is_collapsed = sidebar_host.classList.toggle("sidebar-collapsed");

    app_layout.classList.toggle("sidebar-collapsed", is_collapsed);
    collapse_button.setAttribute("aria-expanded", String(!is_collapsed));
  });

  navbar_toggle?.addEventListener("click", () => {
    const is_open = sidebar_host.classList.toggle("sidebar-open");

    navbar_toggle.setAttribute("aria-expanded", String(is_open));
  });

  sidebar.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof Element && target.closest(".nav-link")) {
      close_mobile_sidebar(sidebar_host, navbar_toggle);
    }
  });

  document.addEventListener("click", (event) => {
    if (!sidebar_host.classList.contains("sidebar-open")) {
      return;
    }

    const target = event.target;

    if (
      target instanceof Node &&
      !sidebar_host.contains(target) &&
      !navbar_toggle?.contains(target)
    ) {
      close_mobile_sidebar(sidebar_host, navbar_toggle);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close_mobile_sidebar(sidebar_host, navbar_toggle);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      close_mobile_sidebar(sidebar_host, navbar_toggle);
    }
  });

  mark_active_nav_item(sidebar);
}

function close_mobile_sidebar(
  sidebar_host: HTMLElement,
  navbar_toggle: HTMLButtonElement | null,
): void {
  sidebar_host.classList.remove("sidebar-open");
  navbar_toggle?.setAttribute("aria-expanded", "false");
}

function mark_active_nav_item(sidebar: HTMLElement): void {
  const page = document.body.dataset.page;

  if (!page) {
    return;
  }

  const active_link = sidebar.querySelector<HTMLAnchorElement>(
    `.nav-link[data-nav="${page}"]`,
  );

  active_link?.classList.add("active");
  active_link?.setAttribute("aria-current", "page");
}
