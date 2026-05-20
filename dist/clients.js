import { get_clients } from "./mock/client_store.js";
import { fetch_clients } from "./services/client_service.js";
import { open_modal } from "./utils/modal.js";
import { show_toast } from "./utils/toast.js";
let clients = [];
let sort_key = "name";
let sort_direction = "asc";
let active_action_client_id = null;
let active_action_button = null;
export function initialize_clients_page() {
    const table_body = document.getElementById("clients-table-body");
    if (!(table_body instanceof HTMLTableSectionElement)) {
        return;
    }
    show_clients_loading();
    initialize_client_filters();
    initialize_client_sorting();
    initialize_client_table_actions();
    initialize_client_navigation();
    void load_clients();
    console.log("Clients page initialized");
}
async function load_clients() {
    try {
        clients = await fetch_clients();
    }
    catch (error) {
        clients = get_clients();
        show_toast({
            message: get_error_message(error, "Backend clients unavailable. Showing mock clients."),
            variant: "error",
        });
    }
    render_clients();
    update_client_stats();
}
function initialize_client_filters() {
    const search_input = document.getElementById("client-search");
    const status_filter = document.getElementById("client-status-filter");
    search_input?.addEventListener("input", render_clients);
    status_filter?.addEventListener("change", render_clients);
}
function initialize_client_sorting() {
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
            render_clients();
            update_sort_buttons(button);
        });
    });
}
function initialize_client_table_actions() {
    const table_body = document.getElementById("clients-table-body");
    table_body?.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const row = target.closest("tr[data-client-id]");
        const client = row ? find_client(row.dataset.clientId) : undefined;
        if (row) {
            table_body.querySelectorAll("tr").forEach((table_row) => {
                table_row.classList.toggle("is-selected", table_row === row);
            });
        }
        const menu_toggle = target.closest("[data-action-menu-toggle]");
        if (menu_toggle) {
            const is_current_menu_open = active_action_button === menu_toggle;
            close_action_menus();
            if (!is_current_menu_open && client) {
                open_floating_action_menu(menu_toggle, client.id);
            }
            return;
        }
        if (target.closest("[data-client-action='view']") && client) {
            populate_client_modal(client);
            open_modal("view-client-modal");
            close_action_menus();
            return;
        }
        if (target.closest("[data-client-action='edit']") && client) {
            window.location.href = `/pages/client_form.html?mode=edit&id=${encodeURIComponent(client.id)}`;
            close_action_menus();
        }
    });
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            close_action_menus();
            return;
        }
        const action_button = target.closest("[data-floating-client-action]");
        if (action_button) {
            const client = active_action_client_id ? find_client(active_action_client_id) : undefined;
            const action = action_button.dataset.floatingClientAction;
            if (action === "view" && client) {
                populate_client_modal(client);
                open_modal("view-client-modal");
                close_action_menus();
            }
            if (action === "edit" && client) {
                window.location.href = `/pages/client_form.html?mode=edit&id=${encodeURIComponent(client.id)}`;
                close_action_menus();
            }
            return;
        }
        if (!target.closest(".action-menu") && !target.closest(".floating-action-menu")) {
            close_action_menus();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            close_action_menus();
        }
    });
    window.addEventListener("resize", close_action_menus);
    window.addEventListener("scroll", close_action_menus, true);
}
function initialize_client_navigation() {
    const add_client_button = document.getElementById("add-client-button");
    add_client_button?.addEventListener("click", () => {
        window.location.href = "/pages/client_form.html";
    });
}
function render_clients() {
    const table_body = document.getElementById("clients-table-body");
    const empty_state = document.getElementById("clients-empty-state");
    if (!(table_body instanceof HTMLTableSectionElement) || !(empty_state instanceof HTMLElement)) {
        return;
    }
    const filtered_clients = get_visible_clients();
    table_body.innerHTML = filtered_clients.map(render_client_row).join("");
    empty_state.classList.toggle("hidden", filtered_clients.length > 0);
}
function show_clients_loading() {
    const table_body = document.getElementById("clients-table-body");
    const empty_state = document.getElementById("clients-empty-state");
    if (table_body instanceof HTMLTableSectionElement) {
        table_body.innerHTML = `
      <tr>
        <td colspan="5">
          <span class="table-subtext">Loading clients...</span>
        </td>
      </tr>
    `;
    }
    empty_state?.classList.add("hidden");
}
function get_visible_clients() {
    const search_input = document.getElementById("client-search");
    const status_filter = document.getElementById("client-status-filter");
    const search_term = search_input instanceof HTMLInputElement
        ? search_input.value.trim().toLowerCase()
        : "";
    const selected_status = status_filter instanceof HTMLSelectElement
        ? status_filter.value
        : "all";
    return clients
        .filter((client) => {
        const matches_search = `${client.name} ${client.advisor} ${client.status}`
            .toLowerCase()
            .includes(search_term);
        const matches_status = selected_status === "all" || client.status === selected_status;
        return matches_search && matches_status;
    })
        .sort((first_client, second_client) => {
        const first_value = first_client[sort_key];
        const second_value = second_client[sort_key];
        const direction = sort_direction === "asc" ? 1 : -1;
        return first_value.localeCompare(second_value) * direction;
    });
}
function render_client_row(client) {
    return `
    <tr data-client-id="${client.id}">
      <td>
        <strong>${client.name}</strong>
        <span class="table-subtext">${client.note}</span>
      </td>
      <td>${render_client_badge(client.status)}</td>
      <td>${client.advisor}</td>
      <td>${client.last_updated}</td>
      <td>
        <div class="action-menu">
          <button class="action-button" type="button" data-action-menu-toggle aria-expanded="false">
            Actions
          </button>
        </div>
      </td>
    </tr>
  `;
}
function render_client_badge(status) {
    const badge_class = status === "Active"
        ? "badge-success"
        : status === "Pending"
            ? "badge-warning"
            : "badge-neutral";
    return `<span class="badge ${badge_class}">${status}</span>`;
}
function update_client_stats() {
    const total_stat = document.getElementById("total-clients-stat");
    const active_stat = document.getElementById("active-clients-stat");
    const pending_stat = document.getElementById("pending-clients-stat");
    if (total_stat) {
        total_stat.textContent = String(clients.length);
    }
    if (active_stat) {
        active_stat.textContent = String(clients.filter((client) => client.status === "Active").length);
    }
    if (pending_stat) {
        pending_stat.textContent = String(clients.filter((client) => client.status === "Pending").length);
    }
}
function update_sort_buttons(active_button) {
    document.querySelectorAll("[data-sort]").forEach((button) => {
        const is_active = button === active_button;
        button.classList.toggle("is-active", is_active);
        button.classList.toggle("sort-asc", is_active && sort_direction === "asc");
    });
}
function populate_client_modal(client) {
    set_detail("name", client.name);
    set_detail("status", client.status);
    set_detail("advisor", client.advisor);
    set_detail("last_updated", client.last_updated);
}
function set_detail(key, value) {
    const element = document.querySelector(`[data-client-detail="${key}"]`);
    if (element) {
        element.textContent = value;
    }
}
function find_client(client_id) {
    return clients.find((client) => client.id === client_id);
}
function close_action_menus() {
    const floating_menu = document.getElementById("clients-floating-action-menu");
    if (floating_menu instanceof HTMLElement) {
        floating_menu.hidden = true;
    }
    document.querySelectorAll("[data-action-menu-toggle]").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
    });
    active_action_client_id = null;
    active_action_button = null;
}
function get_error_message(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
function open_floating_action_menu(button, client_id) {
    const menu = get_floating_action_menu();
    const button_rect = button.getBoundingClientRect();
    const spacing = 8;
    active_action_client_id = client_id;
    active_action_button = button;
    button.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    const menu_width = menu.offsetWidth;
    const menu_height = menu.offsetHeight;
    const viewport_padding = 12;
    const left = Math.min(Math.max(viewport_padding, button_rect.right - menu_width), window.innerWidth - menu_width - viewport_padding);
    const preferred_top = button_rect.bottom + spacing;
    const top = preferred_top + menu_height > window.innerHeight - viewport_padding
        ? Math.max(viewport_padding, button_rect.top - menu_height - spacing)
        : preferred_top;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
}
function get_floating_action_menu() {
    const existing_menu = document.getElementById("clients-floating-action-menu");
    if (existing_menu instanceof HTMLElement) {
        return existing_menu;
    }
    const menu = document.createElement("div");
    menu.id = "clients-floating-action-menu";
    menu.className = "action-menu-list floating-action-menu";
    menu.hidden = true;
    menu.innerHTML = `
    <button type="button" data-floating-client-action="view">View</button>
    <button type="button" data-floating-client-action="edit">Edit</button>
  `;
    document.body.append(menu);
    return menu;
}
