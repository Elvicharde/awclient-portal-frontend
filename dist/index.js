import { initialize_clients_page } from "./clients.js";
import { initialize_monthly_logs_page } from "./monthly_logs.js";
import { initialize_reports_page } from "./reports.js";
import { initialize_sidebar } from "./sidebar.js";
const component_paths = {
    navbar: "/ui/components/navbar.html",
    sidebar: "/ui/components/sidebar.html",
};
async function load_component(target_id, component_path) {
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
async function load_shell_components() {
    await Promise.all([
        load_component("navbar", component_paths.navbar),
        load_component("sidebar", component_paths.sidebar),
    ]);
}
function initialize_current_page() {
    const page = document.body.dataset.page;
    switch (page) {
        case "clients":
            initialize_clients_page();
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
        initialize_sidebar();
        initialize_current_page();
    }
    catch (error) {
        console.error("Application bootstrap failed", error);
    }
});
