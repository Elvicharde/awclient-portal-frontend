import { get_clients } from "./mock/client_store.js";
import type { ClientSummary } from "./types/client.js";
import { open_modal } from "./utils/modal.js";

type ClientSortKey = "name" | "status" | "advisor" | "last_updated";

let clients: ClientSummary[] = [];
let sort_key: ClientSortKey = "name";
let sort_direction: "asc" | "desc" = "asc";

export function initialize_clients_page(): void {
  const table_body = document.getElementById("clients-table-body");

  if (!(table_body instanceof HTMLTableSectionElement)) {
    return;
  }

  clients = get_clients();
  render_clients();
  initialize_client_filters();
  initialize_client_sorting();
  initialize_client_table_actions();
  initialize_client_navigation();
  update_client_stats();

  console.log("Clients page initialized");
}

function initialize_client_filters(): void {
  const search_input = document.getElementById("client-search");
  const status_filter = document.getElementById("client-status-filter");

  search_input?.addEventListener("input", render_clients);
  status_filter?.addEventListener("change", render_clients);
}

function initialize_client_sorting(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const next_sort_key = button.dataset.sort as ClientSortKey;

      if (sort_key === next_sort_key) {
        sort_direction = sort_direction === "asc" ? "desc" : "asc";
      } else {
        sort_key = next_sort_key;
        sort_direction = "asc";
      }

      render_clients();
      update_sort_buttons(button);
    });
  });
}

function initialize_client_table_actions(): void {
  const table_body = document.getElementById("clients-table-body");

  table_body?.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const row = target.closest<HTMLTableRowElement>("tr[data-client-id]");
    const client = row ? find_client(row.dataset.clientId) : undefined;

    if (row) {
      table_body.querySelectorAll("tr").forEach((table_row) => {
        table_row.classList.toggle("is-selected", table_row === row);
      });
    }

    const menu_toggle = target.closest<HTMLButtonElement>("[data-action-menu-toggle]");

    if (menu_toggle) {
      const menu = menu_toggle.nextElementSibling;

      if (menu instanceof HTMLElement) {
        const is_open = !menu.hidden;
        close_action_menus();
        menu.hidden = is_open;
        menu_toggle.setAttribute("aria-expanded", String(!is_open));
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
    if (!(event.target instanceof Element) || !event.target.closest(".action-menu")) {
      close_action_menus();
    }
  });
}

function initialize_client_navigation(): void {
  const add_client_button = document.getElementById("add-client-button");

  add_client_button?.addEventListener("click", () => {
    window.location.href = "/pages/client_form.html";
  });
}

function render_clients(): void {
  const table_body = document.getElementById("clients-table-body");
  const empty_state = document.getElementById("clients-empty-state");

  if (!(table_body instanceof HTMLTableSectionElement) || !(empty_state instanceof HTMLElement)) {
    return;
  }

  const filtered_clients = get_visible_clients();
  table_body.innerHTML = filtered_clients.map(render_client_row).join("");
  empty_state.classList.toggle("hidden", filtered_clients.length > 0);
}

function get_visible_clients(): ClientSummary[] {
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

function render_client_row(client: ClientSummary): string {
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
          <div class="action-menu-list" hidden>
            <button type="button" data-client-action="view">View</button>
            <button type="button" data-client-action="edit">Edit</button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function render_client_badge(status: ClientSummary["status"]): string {
  const badge_class = status === "Active"
    ? "badge-success"
    : status === "Pending"
      ? "badge-warning"
      : "badge-neutral";

  return `<span class="badge ${badge_class}">${status}</span>`;
}

function update_client_stats(): void {
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

function update_sort_buttons(active_button: HTMLButtonElement): void {
  document.querySelectorAll<HTMLButtonElement>("[data-sort]").forEach((button) => {
    const is_active = button === active_button;

    button.classList.toggle("is-active", is_active);
    button.classList.toggle("sort-asc", is_active && sort_direction === "asc");
  });
}

function populate_client_modal(client: ClientSummary): void {
  set_detail("name", client.name);
  set_detail("status", client.status);
  set_detail("advisor", client.advisor);
  set_detail("last_updated", client.last_updated);
}

function set_detail(key: string, value: string): void {
  const element = document.querySelector(`[data-client-detail="${key}"]`);

  if (element) {
    element.textContent = value;
  }
}

function find_client(client_id: string | undefined): ClientSummary | undefined {
  return clients.find((client) => client.id === client_id);
}

function close_action_menus(): void {
  document.querySelectorAll<HTMLElement>(".action-menu-list").forEach((menu) => {
    menu.hidden = true;
  });

  document.querySelectorAll<HTMLButtonElement>("[data-action-menu-toggle]").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
}
