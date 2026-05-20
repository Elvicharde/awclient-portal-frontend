import { get_client_by_id, get_clients } from "./mock/client_store.js";
import { mock_monthly_logs } from "./mock/logs.js";
import { format_currency, parse_currency, set_button_loading } from "./utils/dom.js";
import { close_modal, open_modal } from "./utils/modal.js";
import { show_toast } from "./utils/toast.js";
export function initialize_monthly_logs_page() {
    populate_monthly_log_controls();
    initialize_monthly_log_selectors();
    initialize_collapsible_sections();
    initialize_monthly_log_actions();
    load_selected_log();
    console.log("Monthly logs page initialized");
}
function populate_monthly_log_controls() {
    const client_select = document.getElementById("monthly-log-client");
    if (!(client_select instanceof HTMLSelectElement)) {
        return;
    }
    const clients = get_clients();
    client_select.innerHTML = clients
        .map((client) => `<option value="${client.id}">${client.name}</option>`)
        .join("");
}
function initialize_monthly_log_selectors() {
    const client_select = document.getElementById("monthly-log-client");
    const month_select = document.getElementById("monthly-log-month");
    [client_select, month_select].forEach((control) => {
        control?.addEventListener("change", load_selected_log);
    });
    document.querySelectorAll("[data-log-field]").forEach((input) => {
        input.addEventListener("input", update_financial_summary);
    });
}
function initialize_collapsible_sections() {
    document.querySelectorAll("[data-collapsible-section]").forEach((section) => {
        const toggle = section.querySelector(".section-toggle");
        toggle?.addEventListener("click", () => {
            const is_collapsed = section.classList.toggle("is-collapsed");
            toggle.setAttribute("aria-expanded", String(!is_collapsed));
        });
    });
}
function initialize_monthly_log_actions() {
    const save_button = document.getElementById("save-draft-button");
    const generate_button = document.getElementById("generate-report-button");
    if (save_button instanceof HTMLButtonElement) {
        save_button.addEventListener("click", () => {
            set_button_loading(save_button, true, "Saving");
            window.setTimeout(() => {
                set_button_loading(save_button, false);
                show_toast({ message: "Draft saved", variant: "success" });
            }, 650);
        });
    }
    generate_button?.addEventListener("click", () => {
        open_modal("generate-report-modal");
    });
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement) || !target.matches("[data-confirm-report-generation]")) {
            return;
        }
        set_button_loading(target, true, "Generating");
        window.setTimeout(() => {
            set_button_loading(target, false);
            close_modal();
            show_toast({ message: "Report generated", variant: "success" });
        }, 900);
    });
}
function load_selected_log() {
    const client_select = document.getElementById("monthly-log-client");
    if (!(client_select instanceof HTMLSelectElement)) {
        return;
    }
    const selected_client = get_client_by_id(client_select.value);
    const selected_log = mock_monthly_logs.find((log) => log.client === selected_client?.name)
        ?? mock_monthly_logs[0];
    set_log_values(selected_log);
    update_financial_summary();
}
function set_log_values(log) {
    set_field_value("cash", log.cash);
    set_field_value("investments", log.investments);
    set_field_value("loans", log.loans);
    set_field_value("obligations", log.obligations);
    set_field_value("contributions", log.contributions);
    set_field_value("adjustments", log.adjustments);
}
function set_field_value(field, value) {
    const input = document.querySelector(`[data-log-field="${field}"]`);
    if (input) {
        input.value = format_currency(value);
    }
}
function update_financial_summary() {
    const assets = get_field_total(["cash", "investments"]);
    const liabilities = get_field_total(["loans", "obligations"]);
    const contributions = get_field_total(["contributions", "adjustments"]);
    const net_position = assets - liabilities;
    const mock_change = net_position > 0 ? "+2.4%" : "0.0%";
    set_text("assets-total", format_currency(assets));
    set_text("liabilities-total", format_currency(liabilities));
    set_text("contributions-total", format_currency(contributions));
    set_text("net-position-preview", format_currency(net_position));
    set_text("change-preview", mock_change);
}
function get_field_total(fields) {
    return fields.reduce((total, field) => {
        const input = document.querySelector(`[data-log-field="${field}"]`);
        return total + (input ? parse_currency(input.value) : 0);
    }, 0);
}
function set_text(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}
