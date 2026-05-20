import { initialize_clients_page } from "./clients.js";
import { initialize_client_form_page } from "./client_form.js";
import { initialize_monthly_logs_page } from "./monthly_logs.js";
import { initialize_reports_page } from "./reports.js";
import { initialize_sidebar } from "./sidebar.js";
import { initialize_modals } from "./utils/modal.js";

const component_paths = {
  modals: "/ui/components/modals.html",
  navbar: "/ui/components/navbar.html",
  sidebar: "/ui/components/sidebar.html",
} as const;

async function load_component(target_id: string, component_path: string): Promise<void> {
  const target = document.getElementById(target_id);

  if (!target) {
    return;
  }

  const response = await fetch(component_path);

  if (!response.ok) {
    throw new Error(`Unable to load ${component_path}`);
  }

  target.innerHTML = await response.text();
}

async function load_shell_components(): Promise<void> {
  await Promise.all([
    load_component("navbar", component_paths.navbar),
    load_component("modal-root", component_paths.modals),
    load_component("sidebar", component_paths.sidebar),
  ]);
}

function initialize_current_page(): void {
  const page = document.body.dataset.page;

  switch (page) {
    case "clients":
      initialize_clients_page();
      break;
    case "client_form":
      initialize_client_form_page();
      break;
    case "monthly_logs":
      initialize_monthly_logs_page();
      break;
    case "reports":
      initialize_reports_page();
      break;
    default:
      console.warn("Unknown page type:", page);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await load_shell_components();
    initialize_modals();
    initialize_sidebar();
    initialize_current_page();
  } catch (error) {
    console.error("Application bootstrap failed", error);
  }
});
