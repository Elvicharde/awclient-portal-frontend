import { get_client_by_id, get_clients } from "./mock/client_store.js";
import { fetch_clients } from "./services/client_service.js";
import { format_currency, parse_currency, set_button_loading } from "./utils/dom.js";
import { close_modal, open_modal } from "./utils/modal.js";
import { show_toast } from "./utils/toast.js";
import type { ClientSummary, Liability } from "./types/client.js";

const quarter_multiplier = 4;

const quarter_labels: Record<string, string> = {
  Q1: "Q1 — Jan 1 to Mar 31",
  Q2: "Q2 — Apr 1 to Jun 30",
  Q3: "Q3 — Jul 1 to Sep 30",
  Q4: "Q4 — Oct 1 to Dec 31",
};

const client_1_retirement_fields = [
  "client1_ira",
  "client1_roth_ira",
  "client1_401k",
  "client1_pension",
];

const client_2_retirement_fields = [
  "client2_ira",
  "client2_roth_ira",
  "client2_401k",
  "client2_pension",
];

const non_retirement_fields = [
  "brokerage",
  "joint_brokerage",
  "checking",
  "savings",
];

const liability_fields = [
  "mortgage_balance",
  "auto_loan_balance",
  "credit_card_balance",
  "personal_loan_balance",
  "other_liability_balance",
];

const account_field_map: Record<string, string> = {
  "401K": "client1_401k",
  Brokerage: "brokerage",
  Checking: "checking",
  IRA: "client1_ira",
  Pension: "client1_pension",
  "Joint Brokerage": "joint_brokerage",
  "Roth IRA": "client1_roth_ira",
  Savings: "savings",
};

const client_1_retirement_field_map: Record<string, string> = {
  "401K": "client1_401k",
  IRA: "client1_ira",
  Pension: "client1_pension",
  "Roth IRA": "client1_roth_ira",
};

const client_2_retirement_field_map: Record<string, string> = {
  "401K": "client2_401k",
  IRA: "client2_ira",
  Pension: "client2_pension",
  "Roth IRA": "client2_roth_ira",
};

const non_retirement_field_map: Record<string, string> = {
  Brokerage: "brokerage",
  Checking: "checking",
  "Joint Brokerage": "joint_brokerage",
  Savings: "savings",
};

const liability_field_map: Record<string, string> = {
  "Auto loan": "auto_loan_balance",
  "Credit card": "credit_card_balance",
  Mortgage: "mortgage_balance",
  Other: "other_liability_balance",
  "Personal loan": "personal_loan_balance",
};

let available_clients: ClientSummary[] = [];
let selected_profile_reserve_target: number | null = null;

export function initialize_monthly_logs_page(): void {
  show_client_select_loading();
  initialize_quarterly_log_selectors();
  initialize_collapsible_sections();
  initialize_quarterly_log_actions();
  update_quarter_feedback();
  void load_quarterly_log_clients();

  console.log("Quarterly logs page initialized");
}

async function load_quarterly_log_clients(): Promise<void> {
  try {
    available_clients = await fetch_clients();
  } catch (error) {
    available_clients = get_clients();
    show_toast({
      message: get_error_message(error, "Backend clients unavailable. Showing mock clients."),
      variant: "error",
    });
  }

  populate_quarterly_log_controls(available_clients);
  load_selected_client_static_data();
  update_quarterly_calculations();
}

function populate_quarterly_log_controls(client_options: ClientSummary[]): void {
  const client_select = document.getElementById("monthly-log-client");

  if (!(client_select instanceof HTMLSelectElement)) {
    return;
  }

  client_select.innerHTML = client_options
    .map((client) => `<option value="${client.id}">${client.name}</option>`)
    .join("");
}

function show_client_select_loading(): void {
  const client_select = document.getElementById("monthly-log-client");

  if (client_select instanceof HTMLSelectElement) {
    client_select.innerHTML = `<option value="">Loading clients...</option>`;
  }
}

function initialize_quarterly_log_selectors(): void {
  const client_select = document.getElementById("monthly-log-client");
  const quarter_select = document.getElementById("monthly-log-quarter");

  client_select?.addEventListener("change", () => {
    load_selected_client_static_data();
    update_quarterly_calculations();
  });

  quarter_select?.addEventListener("change", () => {
    update_quarter_feedback();
    update_quarterly_calculations();
  });

  document.querySelectorAll<HTMLInputElement>("[data-log-field]").forEach((input) => {
    input.addEventListener("input", () => {
      update_field_completion(input);
      update_quarterly_calculations();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-use-last]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.useLast;
      const input = field ? get_log_input(field) : null;

      if (!input) {
        return;
      }

      input.value = format_currency(parse_currency(input.dataset.lastValue ?? "0"));
      update_field_completion(input);
      update_quarterly_calculations();
    });
  });
}

function initialize_collapsible_sections(): void {
  document.querySelectorAll<HTMLElement>("[data-collapsible-section]").forEach((section) => {
    const toggle = section.querySelector<HTMLButtonElement>(".section-toggle");

    toggle?.addEventListener("click", () => {
      const is_collapsed = section.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!is_collapsed));
    });
  });
}

function initialize_quarterly_log_actions(): void {
  const save_button = document.getElementById("save-draft-button");
  const generate_button = document.getElementById("generate-report-button");

  if (save_button instanceof HTMLButtonElement) {
    save_button.addEventListener("click", () => {
      set_button_loading(save_button, true, "Saving");

      window.setTimeout(() => {
        set_button_loading(save_button, false);
        show_toast({ message: "Quarterly draft saved", variant: "success" });
      }, 650);
    });
  }

  generate_button?.addEventListener("click", () => {
    if (!validate_required_quarterly_fields()) {
      show_toast({
        message: "Complete all required quarterly balances before generating the report.",
        variant: "error",
      });
      return;
    }

    open_modal("generate-report-modal");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement) || !target.matches("[data-confirm-report-generation]")) {
      return;
    }

    if (!validate_required_quarterly_fields()) {
      close_modal();
      show_toast({
        message: "Complete all required quarterly balances before generating the report.",
        variant: "error",
      });
      return;
    }

    set_button_loading(target, true, "Generating");

    window.setTimeout(() => {
      set_button_loading(target, false);
      close_modal();
      show_toast({ message: `${get_selected_quarter()} report generated`, variant: "success" });
    }, 900);
  });
}

function load_selected_client_static_data(): void {
  const client_select = document.getElementById("monthly-log-client");

  if (!(client_select instanceof HTMLSelectElement)) {
    return;
  }

  const selected_client = get_selected_client();

  reset_profile_field_state();
  clear_prefilled_quarterly_fields();

  if (!selected_client) {
    update_household_visibility(false);
    configure_dynamic_balance_fields(undefined);
    return;
  }

  update_household_visibility(selected_client.payload.marital_status === "Married");
  prefill_static_financial_data(selected_client);
  configure_dynamic_balance_fields(selected_client);
  prefill_account_structure(selected_client);
  prefill_trust_details(selected_client);
  prefill_liability_structure(selected_client.payload.liabilities);
}

function update_quarter_feedback(): void {
  const quarter = get_selected_quarter();
  const label = quarter_labels[quarter] ?? quarter_labels.Q1;
  const generate_button = document.getElementById("generate-report-button");

  set_text("selected-quarter-feedback", `Selected quarter: ${label}`);

  if (generate_button) {
    generate_button.textContent = `Generate ${quarter} Report`;
  }
}

function update_quarterly_calculations(): void {
  const is_married = get_selected_client()?.payload.marital_status === "Married";
  const inflow_fields = is_married
    ? ["client1_quarterly_inflow", "client2_quarterly_inflow"]
    : ["client1_quarterly_inflow"];
  const outflow_fields = is_married
    ? ["client1_quarterly_outflow", "client2_quarterly_outflow"]
    : ["client1_quarterly_outflow"];
  const inflow = get_field_total(inflow_fields);
  const outflow = get_field_total(outflow_fields);
  const insurance_deductible = get_field_total(["insurance_deductible"]);
  const monthly_expense_basis = outflow / quarter_multiplier;
  const calculated_reserve_target = (6 * monthly_expense_basis) + insurance_deductible;
  const reserve_target = selected_profile_reserve_target ?? calculated_reserve_target;
  const excess = inflow - outflow;

  const client_1_retirement = get_field_total(client_1_retirement_fields);
  const client_2_retirement = is_married ? get_field_total(client_2_retirement_fields) : 0;
  const non_retirement = get_field_total(non_retirement_fields);
  const trust_total = get_field_total(["trust_property_value"]);
  const liabilities = get_field_total(liability_fields);
  const grand_total_net_worth = client_1_retirement
    + client_2_retirement
    + non_retirement
    + trust_total;

  set_text("inflow-total", format_currency(inflow));
  set_text("expense-total", format_currency(outflow));
  set_text("reserve-total", format_currency(reserve_target));
  set_text("excess-preview", format_currency(excess));
  set_text("reserve-target-preview", format_currency(reserve_target));
  set_text("retirement-total", format_currency(client_1_retirement));
  set_text("client1-retirement-total", format_currency(client_1_retirement));
  set_text("client2-retirement-total", format_currency(client_2_retirement));
  set_text("non-retirement-total", format_currency(non_retirement));
  set_text("trust-total", format_currency(trust_total));
  set_text("grand-total-net-worth", format_currency(grand_total_net_worth));
  set_text("liabilities-total", format_currency(liabilities));
  update_required_quarterly_field_states();
}

function validate_required_quarterly_fields(): boolean {
  return update_required_quarterly_field_states();
}

function update_required_quarterly_field_states(): boolean {
  const required_inputs = document.querySelectorAll<HTMLInputElement>("[data-required-log]:not(:disabled)");
  let completed_count = 0;
  let is_valid = true;

  required_inputs.forEach((input) => {
    const is_complete = is_complete_required_input(input);

    input.classList.toggle("is-incomplete", !is_complete);
    input.closest(".form-field")?.classList.toggle("is-incomplete", !is_complete);

    if (is_complete) {
      completed_count += 1;
    }

    if (!is_complete) {
      is_valid = false;
    }
  });

  update_completion_tracker(completed_count, required_inputs.length);

  const status = document.getElementById("quarterly-review-status");

  if (status) {
    status.textContent = is_valid ? "Ready" : "Incomplete";
    status.className = `badge ${is_valid ? "badge-success" : "badge-warning"}`;
  }

  return is_valid;
}

function update_field_completion(input: HTMLInputElement): void {
  if (!input.matches("[data-required-log]")) {
    return;
  }

  const is_complete = is_complete_required_input(input);

  input.classList.toggle("is-incomplete", !is_complete);
  input.closest(".form-field")?.classList.toggle("is-incomplete", !is_complete);
}

function is_complete_required_input(input: HTMLInputElement): boolean {
  if (input.value.trim().length === 0) {
    return false;
  }

  const normalized_value = input.value.replace(/[^0-9.-]/g, "");

  return normalized_value.length > 0 && Number.isFinite(Number(normalized_value));
}

function update_completion_tracker(completed_count: number, total_count: number): void {
  const tracker = document.getElementById("quarterly-completion-tracker");
  const percent_element = document.getElementById("quarterly-completion-percent");
  const progress_ring = document.getElementById("quarterly-completion-ring-progress");
  const percent = total_count > 0 ? Math.round((completed_count / total_count) * 100) : 0;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  if (percent_element) {
    percent_element.textContent = `${percent}%`;
  }

  if (progress_ring instanceof SVGCircleElement) {
    progress_ring.style.strokeDasharray = `${circumference}`;
    progress_ring.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
  }

  if (tracker) {
    tracker.classList.toggle("is-complete", percent === 100);
  }
}

function get_selected_quarter(): string {
  const quarter_select = document.getElementById("monthly-log-quarter");

  return quarter_select instanceof HTMLSelectElement ? quarter_select.value : "Q1";
}

function get_field_total(fields: string[]): number {
  return fields.reduce((total, field) => {
    const input = get_log_input(field);

    return total + (input ? parse_currency(input.value) : 0);
  }, 0);
}

function set_field_value(field: string, value: number): void {
  const input = get_log_input(field);

  if (input) {
    input.value = value > 0 ? format_currency(value) : "";
    update_field_completion(input);
  }
}

function clear_prefilled_quarterly_fields(): void {
  document.querySelectorAll<HTMLInputElement>("[data-log-field]").forEach((input) => {
    input.value = "";
    update_field_completion(input);
  });
}

function prefill_static_financial_data(client: ClientSummary): void {
  const static_data = client.payload.static_financial_data;
  const client_1_quarterly_inflow = static_data.monthly_salary_after_tax * quarter_multiplier;
  const client_1_quarterly_outflow = static_data.monthly_expense_budget * quarter_multiplier;
  const client_2_quarterly_inflow = (static_data.client_2_monthly_salary_after_tax ?? 0) * quarter_multiplier;
  const client_2_quarterly_outflow = (static_data.client_2_monthly_expense_budget ?? 0) * quarter_multiplier;
  const total_monthly_expense = static_data.monthly_expense_budget
    + (client.payload.marital_status === "Married"
      ? static_data.client_2_monthly_expense_budget ?? 0
      : 0);
  const insurance_deductible = static_data.insurance_deductible_total ?? 0;
  const calculated_reserve_target = (6 * total_monthly_expense) + insurance_deductible;

  set_field_value("client1_quarterly_inflow", client_1_quarterly_inflow);
  set_field_value("client1_quarterly_outflow", client_1_quarterly_outflow);
  set_field_value("client2_quarterly_inflow", client_2_quarterly_inflow);
  set_field_value("client2_quarterly_outflow", client_2_quarterly_outflow);
  set_static_readonly_field("insurance_deductible", insurance_deductible, static_data.insurance_deductible_total !== undefined);
  selected_profile_reserve_target = static_data.private_reserve_target > 0
    ? static_data.private_reserve_target
    : calculated_reserve_target;
}

function prefill_account_structure(client: ClientSummary): void {
  const client_1_retirement_accounts = get_client_1_retirement_accounts(client);
  const client_2_retirement_accounts = get_client_2_retirement_accounts(client);
  const non_retirement_accounts = client.payload.account_structure.non_retirement_accounts;

  client_1_retirement_accounts.forEach((account) => {
    const field = client_1_retirement_field_map[account] ?? account_field_map[account];
    const input = field ? get_log_input(field) : null;

    if (!input) {
      return;
    }

    set_field_value(field, parse_currency(input.dataset.lastValue ?? "0"));
  });

  client_2_retirement_accounts.forEach((account) => {
    const field = client_2_retirement_field_map[account];
    const input = field ? get_log_input(field) : null;

    if (!input) {
      return;
    }

    set_field_value(field, parse_currency(input.dataset.lastValue ?? "0"));
  });

  non_retirement_accounts.forEach((account) => {
    const field = non_retirement_field_map[account] ?? account_field_map[account];
    const input = field ? get_log_input(field) : null;

    if (!input) {
      return;
    }

    set_field_value(field, parse_currency(input.dataset.lastValue ?? "0"));
  });
}

function prefill_trust_details(client: ClientSummary): void {
  if (!client.payload.trust_details.has_trust) {
    set_dynamic_field_enabled("trust_property_value", false);
    set_dynamic_field_enabled("zillow_home_value", false, false);
    return;
  }

  const input = get_log_input("trust_property_value");

  set_dynamic_field_enabled("trust_property_value", true);
  set_dynamic_field_enabled("zillow_home_value", true, false);
  set_field_value("trust_property_value", parse_currency(input?.dataset.lastValue ?? "0"));
}

function prefill_liability_structure(liabilities: Liability[]): void {
  liabilities.forEach((liability) => {
    const field = liability_field_map[liability.liability_type] ?? "other_liability_balance";

    set_field_value(field, liability.balance);
  });
}

function get_log_input(field: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`[data-log-field="${field}"]`);
}

function get_selected_client(): ClientSummary | undefined {
  const client_select = document.getElementById("monthly-log-client");

  if (!(client_select instanceof HTMLSelectElement)) {
    return undefined;
  }

  return available_clients.find((client) => client.id === client_select.value)
    ?? get_client_by_id(client_select.value);
}

function update_household_visibility(is_married: boolean): void {
  const client_1_inflow_label = document.querySelector("[data-client1-inflow-label]");
  const client_1_outflow_label = document.querySelector("[data-client1-outflow-label]");
  const retirement_section_title = document.getElementById("client1-retirement-section-title");

  if (client_1_inflow_label) {
    client_1_inflow_label.textContent = is_married
      ? "Quarterly inflow (Client 1)"
      : "Quarterly inflow";
  }

  if (client_1_outflow_label) {
    client_1_outflow_label.textContent = is_married
      ? "Quarterly expense / outflow (Client 1)"
      : "Quarterly expense / outflow";
  }

  if (retirement_section_title) {
    retirement_section_title.textContent = is_married
      ? "TCC - Client 1 Retirement"
      : "TCC — Retirement";
  }

  document.querySelectorAll<HTMLElement>(".married-quarterly-field").forEach((field) => {
    field.classList.toggle("is-hidden", !is_married);
  });

  document.querySelectorAll<HTMLInputElement>(".married-quarterly-input").forEach((input) => {
    input.disabled = !is_married;
  });

  const client_2_section = document.getElementById("client2-retirement-section");

  client_2_section?.classList.toggle("is-hidden", !is_married);
  document.getElementById("single-retirement-summary-row")?.classList.toggle("is-hidden", is_married);
  document.getElementById("client1-retirement-summary-row")?.classList.toggle("is-hidden", !is_married);
  document.getElementById("client2-retirement-summary-row")?.classList.toggle("is-hidden", !is_married);
  client_2_retirement_fields.forEach((field) => {
    const input = get_log_input(field);

    if (input) {
      input.disabled = !is_married;
      if (!is_married) {
        input.value = "";
        update_field_completion(input);
      }
    }
  });
}

function set_text(id: string, value: string): void {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function reset_profile_field_state(): void {
  selected_profile_reserve_target = null;
  set_static_readonly_field("insurance_deductible", 0, false);

  [
    ...client_1_retirement_fields,
    ...client_2_retirement_fields,
    ...non_retirement_fields,
    "trust_property_value",
    "zillow_home_value",
    ...liability_fields,
  ].forEach((field) => set_dynamic_field_enabled(field, true, field !== "zillow_home_value"));
}

function set_static_readonly_field(field: string, value: number, is_readonly: boolean): void {
  const input = get_log_input(field);

  if (!input) {
    return;
  }

  input.readOnly = is_readonly;
  input.value = is_readonly || value > 0 ? format_currency(value) : "";
  update_field_completion(input);
}

function configure_dynamic_balance_fields(client: ClientSummary | undefined): void {
  if (!client) {
    return;
  }

  const client_1_retirement_accounts = get_client_1_retirement_accounts(client);
  const client_2_retirement_accounts = get_client_2_retirement_accounts(client);
  const non_retirement_accounts = client.payload.account_structure.non_retirement_accounts;
  const liabilities = client.payload.liabilities.map((liability) => liability.liability_type);

  configure_field_group(client_1_retirement_fields, get_fields_for_accounts(client_1_retirement_accounts, client_1_retirement_field_map));

  if (client.payload.marital_status === "Married") {
    configure_field_group(client_2_retirement_fields, get_fields_for_accounts(client_2_retirement_accounts, client_2_retirement_field_map));
  }

  configure_field_group(non_retirement_fields, get_fields_for_accounts(non_retirement_accounts, non_retirement_field_map));
  configure_field_group(liability_fields, get_fields_for_accounts(liabilities, liability_field_map));
}

function configure_field_group(all_fields: string[], active_fields: string[]): void {
  if (active_fields.length === 0) {
    all_fields.forEach((field) => set_dynamic_field_enabled(field, true));
    return;
  }

  all_fields.forEach((field) => {
    set_dynamic_field_enabled(field, active_fields.includes(field));
  });
}

function set_dynamic_field_enabled(field: string, is_enabled: boolean, is_required = true): void {
  const input = get_log_input(field);
  const field_container = input?.closest<HTMLElement>(".form-field");

  if (!input) {
    return;
  }

  input.disabled = !is_enabled;
  input.toggleAttribute("data-required-log", is_enabled && is_required);

  if (!is_enabled) {
    input.value = "";
    input.classList.remove("is-incomplete");
    field_container?.classList.remove("is-incomplete");
  }

  field_container?.classList.toggle("is-hidden", !is_enabled);
}

function get_fields_for_accounts(accounts: string[], field_map: Record<string, string>): string[] {
  return accounts
    .map((account) => field_map[account])
    .filter((field): field is string => Boolean(field));
}

function get_client_1_retirement_accounts(client: ClientSummary): string[] {
  return client.payload.account_structure.client_1_retirement_accounts?.length
    ? client.payload.account_structure.client_1_retirement_accounts
    : client.payload.account_structure.retirement_accounts;
}

function get_client_2_retirement_accounts(client: ClientSummary): string[] {
  return client.payload.account_structure.client_2_retirement_accounts ?? [];
}

function get_error_message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
