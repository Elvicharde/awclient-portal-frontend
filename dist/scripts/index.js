import { initialize_sidebar } from "./sidebar.js";
import { initialize_clients_page } from "./clients.js";
import { initialize_monthly_logs_page } from "./monthly_logs.js";
import { initialize_reports_page } from "./reports.js";
// Centralized app bootstrap
document.addEventListener("DOMContentLoaded", () => {
    initialize_sidebar();
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
});
