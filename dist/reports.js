import { get_clients } from "./mock/client_store.js";
import { mock_reports } from "./mock/reports.js";
import { fetch_clients } from "./services/client_service.js";
import { fetch_reports } from "./services/report_service.js";
import { set_button_loading } from "./utils/dom.js";
import { close_modal, open_modal } from "./utils/modal.js";
import { show_toast } from "./utils/toast.js";
let reports = [...mock_reports];
let report_clients = [];
let sort_key = "generated_date";
let sort_direction = "desc";
export function initialize_reports_page() {
    const table_body = document.getElementById("reports-table-body");
    if (!(table_body instanceof HTMLTableSectionElement)) {
        return;
    }
    show_reports_loading();
    show_report_clients_loading();
    initialize_report_filters();
    initialize_report_sorting();
    initialize_report_actions();
    void load_reports_page_data();
    console.log("Reports page initialized");
}
async function load_reports_page_data() {
    const [client_result, report_result] = await Promise.allSettled([
        fetch_clients(),
        fetch_reports(),
    ]);
    if (client_result.status === "fulfilled") {
        report_clients = client_result.value;
    }
    else {
        report_clients = get_clients();
        show_toast({
            message: get_error_message(client_result.reason, "Backend clients unavailable. Showing mock clients."),
            variant: "error",
        });
    }
    if (report_result.status === "fulfilled") {
        reports = report_result.value;
    }
    else {
        reports = [...mock_reports];
        show_toast({
            message: get_error_message(report_result.reason, "Backend reports unavailable. Showing mock reports."),
            variant: "error",
        });
    }
    populate_report_client_select();
    render_reports();
    update_report_stats();
}
function initialize_report_filters() {
    const type_filter = document.getElementById("report-type-filter");
    type_filter?.addEventListener("change", render_reports);
}
function populate_report_client_select() {
    const client_select = document.getElementById("report-client");
    if (!(client_select instanceof HTMLSelectElement)) {
        return;
    }
    client_select.innerHTML = report_clients
        .map((client) => `<option value="${client.id}">${client.name}</option>`)
        .join("");
}
function initialize_report_sorting() {
    document.querySelectorAll("[data-sort]").forEach((button) => {
        button.addEventListener("click", () => {
            const next_sort_key = button.dataset.sort;
            if (sort_key === next_sort_key) {
                sort_direction = sort_direction === "asc" ? "desc" : "asc";
            }
            else {
                sort_key = next_sort_key;
                sort_direction = "asc";
            }
            render_reports();
            update_sort_buttons(button);
        });
    });
}
function initialize_report_actions() {
    const generate_button = document.getElementById("generate-report-button");
    generate_button?.addEventListener("click", () => open_modal("generate-report-modal"));
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) {
            return;
        }
        if (target.matches("[data-download-report]")) {
            set_button_loading(target, true, "Preparing");
            window.setTimeout(() => {
                set_button_loading(target, false);
                show_toast({ message: "Download prepared", variant: "info" });
            }, 700);
        }
        if (target.matches("[data-confirm-report-generation]")) {
            set_button_loading(target, true, "Generating");
            window.setTimeout(() => {
                const client = report_clients[0] ?? get_clients()[0];
                reports = [
                    {
                        advisor: "Operations Team",
                        client: client?.name ?? "New Mock Client",
                        generated_date: "May 19, 2026",
                        id: `report-${Date.now()}`,
                        report_type: "Combined",
                        status: "Queued",
                    },
                    ...reports,
                ];
                set_button_loading(target, false);
                close_modal();
                render_reports();
                update_report_stats();
                show_toast({ message: "Report generation started", variant: "success" });
            }, 950);
        }
    });
}
function render_reports() {
    const table_body = document.getElementById("reports-table-body");
    const empty_state = document.getElementById("reports-empty-state");
    if (!(table_body instanceof HTMLTableSectionElement) || !(empty_state instanceof HTMLElement)) {
        return;
    }
    const visible_reports = get_visible_reports();
    table_body.innerHTML = visible_reports.map(render_report_row).join("");
    empty_state.classList.toggle("hidden", visible_reports.length > 0);
}
function get_visible_reports() {
    const type_filter = document.getElementById("report-type-filter");
    const selected_type = type_filter instanceof HTMLSelectElement ? type_filter.value : "all";
    return reports
        .filter((report) => selected_type === "all" || report.report_type === selected_type)
        .sort((first_report, second_report) => {
        const first_value = first_report[sort_key];
        const second_value = second_report[sort_key];
        const direction = sort_direction === "asc" ? 1 : -1;
        return first_value.localeCompare(second_value) * direction;
    });
}
function render_report_row(report) {
    return `
    <tr>
      <td>
        <strong>${report.client}</strong>
        <span class="table-subtext">Advisor: ${report.advisor}</span>
      </td>
      <td>${report.report_type}</td>
      <td>${report.generated_date}</td>
      <td>${render_report_badge(report.status)}</td>
      <td>
        <button class="action-button" type="button" data-download-report>
          Download
        </button>
      </td>
    </tr>
  `;
}
function render_report_badge(status) {
    const badge_class = status === "Ready"
        ? "badge-success"
        : status === "Review"
            ? "badge-warning"
            : "badge-neutral";
    return `<span class="badge ${badge_class}">${status}</span>`;
}
function update_report_stats() {
    set_text("sacs-report-stat", String(reports.filter((report) => report.report_type === "SACS").length));
    set_text("tcc-report-stat", String(reports.filter((report) => report.report_type === "TCC").length));
    set_text("monthly-report-stat", String(reports.length));
}
function update_sort_buttons(active_button) {
    document.querySelectorAll("[data-sort]").forEach((button) => {
        const is_active = button === active_button;
        button.classList.toggle("is-active", is_active);
        button.classList.toggle("sort-asc", is_active && sort_direction === "asc");
    });
}
function set_text(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}
function show_reports_loading() {
    const table_body = document.getElementById("reports-table-body");
    const empty_state = document.getElementById("reports-empty-state");
    if (table_body instanceof HTMLTableSectionElement) {
        table_body.innerHTML = `
      <tr>
        <td colspan="5">
          <span class="table-subtext">Loading reports...</span>
        </td>
      </tr>
    `;
    }
    empty_state?.classList.add("hidden");
}
function show_report_clients_loading() {
    const client_select = document.getElementById("report-client");
    if (client_select instanceof HTMLSelectElement) {
        client_select.innerHTML = `<option value="">Loading clients...</option>`;
    }
}
function get_error_message(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
