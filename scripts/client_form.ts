import { create_client, get_client_by_id, update_client } from "./mock/client_store.js";
import type { ClientPayload, ClientPerson, MaritalStatus } from "./types/client.js";
import { set_button_loading } from "./utils/dom.js";
import { show_toast } from "./utils/toast.js";
import { is_four_digits, looks_like_email } from "./utils/validation.js";

const retirement_accounts = new Set(["IRA", "Roth IRA", "401K", "Pension"]);

export function initialize_client_form_page(): void {
  const form_mode = initialize_mode();

  initialize_tabs();
  initialize_marital_status();
  initialize_age_fields();
  initialize_form_actions(form_mode);
  initialize_review_updates();
  update_spouse_section();
  update_all_ages();
  update_review_summary();

  console.log("Client form page initialized");
}

function initialize_mode(): { is_edit_mode: boolean; client_id: string | null } {
  const params = new URLSearchParams(window.location.search);
  const is_edit_mode = params.get("mode") === "edit";
  const client_id = params.get("id");
  const page_title = document.getElementById("page-title");
  const save_button = document.getElementById("save-client-form");

  if (page_title) {
    page_title.textContent = is_edit_mode ? "Edit Client" : "Add Client";
  }

  document.title = `${is_edit_mode ? "Edit" : "Add"} Client | AW Client Portal`;

  if (save_button) {
    save_button.textContent = is_edit_mode ? "Save Changes" : "Create Client";
  }

  if (is_edit_mode && client_id) {
    populate_edit_profile(client_id);
    set_identity_readonly();
  }

  console.log("Client form mode", {
    id: client_id,
    mode: is_edit_mode ? "edit" : "create",
  });

  return { client_id, is_edit_mode };
}

function initialize_tabs(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-tab-target]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target_id = tab.dataset.tabTarget;

      if (!target_id) {
        return;
      }

      document.querySelectorAll<HTMLButtonElement>("[data-tab-target]").forEach((button) => {
        const is_active = button === tab;
        button.classList.toggle("is-active", is_active);
        button.setAttribute("aria-selected", String(is_active));
      });

      document.querySelectorAll<HTMLElement>("[data-tab-panel]").forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === target_id);
      });
    });
  });
}

function initialize_marital_status(): void {
  const marital_status = document.getElementById("marital-status");

  marital_status?.addEventListener("change", () => {
    update_spouse_section();
    update_review_summary();
  });
}

function initialize_age_fields(): void {
  document.querySelectorAll<HTMLInputElement>("[data-age-source]").forEach((input) => {
    input.addEventListener("input", () => {
      update_age(input);
      update_review_summary();
    });
  });
}

function initialize_form_actions(form_mode: { is_edit_mode: boolean; client_id: string | null }): void {
  const cancel_button = document.getElementById("cancel-client-form");
  const save_button = document.getElementById("save-client-form");

  cancel_button?.addEventListener("click", () => {
    window.location.href = "/pages/clients.html";
  });

  if (save_button instanceof HTMLButtonElement) {
    save_button.addEventListener("click", () => {
      const payload = build_client_payload();
      const errors = validate_client_payload(payload);

      if (errors.length > 0) {
        show_toast({ message: errors[0], variant: "error" });
        return;
      }

      set_button_loading(save_button, true, form_mode.is_edit_mode ? "Saving" : "Creating");

      window.setTimeout(() => {
        if (form_mode.is_edit_mode && form_mode.client_id) {
          update_client(form_mode.client_id, payload);
        } else {
          create_client(payload);
        }

        set_button_loading(save_button, false);
        show_toast({
          message: form_mode.is_edit_mode ? "Client changes saved" : "Client created",
          variant: "success",
        });
        window.location.href = "/pages/clients.html";
      }, 700);
    });
  }
}

function initialize_review_updates(): void {
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "#client-form input, #client-form select, #client-form textarea",
  ).forEach((control) => {
    control.addEventListener("input", update_review_summary);
    control.addEventListener("change", update_review_summary);
  });
}

function populate_edit_profile(client_id: string): void {
  const client = get_client_by_id(client_id);

  if (!client) {
    show_toast({ message: "Mock client not found for edit mode", variant: "error" });
    return;
  }

  const payload = client.payload;

  set_person_values("client1", payload.client_1);
  set_control_value("marital_status", payload.marital_status);

  if (payload.client_2) {
    set_person_values("client2", payload.client_2);
  }

  set_control_checked("has-trust", payload.trust_details.has_trust);
  set_control_value("trust_name", payload.trust_details.trust_name ?? "");
  set_control_value("property_address", payload.trust_details.property_address ?? "");
  set_control_value("property_city", payload.trust_details.city ?? "");
  set_control_value("property_state", payload.trust_details.state ?? "");
  set_control_value("property_zip", payload.trust_details.zip ?? "");
  set_control_value("monthly_salary", String(payload.static_financial_data.monthly_salary_after_tax || ""));
  set_control_value("expense_budget", String(payload.static_financial_data.monthly_expense_budget || ""));
  set_control_value(
    "client2_monthly_salary",
    String(payload.static_financial_data.client_2_monthly_salary_after_tax || ""),
  );
  set_control_value(
    "client2_expense_budget",
    String(payload.static_financial_data.client_2_monthly_expense_budget || ""),
  );
  set_control_value("reserve_target", String(payload.static_financial_data.private_reserve_target || ""));
  set_control_value("financial_notes", payload.static_financial_data.notes ?? "");

  [...payload.account_structure.retirement_accounts, ...payload.account_structure.non_retirement_accounts]
    .forEach((account) => {
      const checkbox = document.querySelector<HTMLInputElement>(
        `input[name="accounts"][value="${account}"]`,
      );

      if (checkbox) {
        checkbox.checked = true;
      }
    });
}

function set_identity_readonly(): void {
  ["client1-dob", "client1-ssn-last-four", "client2-dob", "client2-ssn-last-four"].forEach((id) => {
    const input = document.getElementById(id);

    if (input instanceof HTMLInputElement) {
      input.readOnly = true;
    }
  });
}

function update_spouse_section(): void {
  const marital_status = document.getElementById("marital-status");
  const spouse_section = document.getElementById("spouse-section");
  const badge = document.getElementById("spouse-status-badge");
  const is_married = marital_status instanceof HTMLSelectElement && marital_status.value === "Married";

  spouse_section?.classList.toggle("is-hidden", !is_married);
  document.querySelectorAll<HTMLElement>(".spouse-financial-field").forEach((field) => {
    field.classList.toggle("is-hidden", !is_married);
  });

  if (badge) {
    badge.textContent = is_married ? "Married household" : "Single client";
    badge.className = `badge ${is_married ? "badge-info" : "badge-neutral"}`;
  }

  document.querySelectorAll<HTMLInputElement>(".spouse-field").forEach((field) => {
    field.required = is_married && field.id !== "client2-middle-name";
    field.disabled = !is_married;
  });

  document.querySelectorAll<HTMLInputElement>(".spouse-financial-input").forEach((field) => {
    field.required = is_married;
    field.disabled = !is_married;
  });
}

function update_all_ages(): void {
  document.querySelectorAll<HTMLInputElement>("[data-age-source]").forEach(update_age);
}

function update_age(input: HTMLInputElement): void {
  const target_id = input.dataset.ageSource;
  const target = target_id ? document.getElementById(target_id) : null;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  target.value = input.value ? String(calculate_age(input.value)) : "";
}

function calculate_age(date_value: string): number {
  const birth_date = new Date(`${date_value}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth_date.getFullYear();
  const month_delta = today.getMonth() - birth_date.getMonth();

  if (month_delta < 0 || (month_delta === 0 && today.getDate() < birth_date.getDate())) {
    age -= 1;
  }

  return age;
}

function update_review_summary(): void {
  const client_name = [
    get_input_value("client1-first-name"),
    get_input_value("client1-last-name"),
  ].filter(Boolean).join(" ");
  const marital_status = get_select_value("marital-status") || "Single";
  const selected_accounts = document.querySelectorAll<HTMLInputElement>(
    'input[name="accounts"]:checked',
  ).length;
  const has_trust = document.getElementById("has-trust");
  const trust_name = get_input_value("trust-name");
  const property_parts = [
    get_input_value("property-address"),
    get_input_value("property-city"),
    get_input_value("property-state"),
    get_input_value("property-zip"),
  ].filter(Boolean);

  set_text("review-household", client_name || "New client");
  set_text("review-marital-status", marital_status);
  set_text("review-accounts", `${selected_accounts} selected`);
  set_text(
    "review-trust",
    has_trust instanceof HTMLInputElement && has_trust.checked
      ? trust_name || "Trust selected"
      : "No trust selected",
  );
  set_text("review-property", property_parts.join(", ") || "No property address");
}

function build_client_payload(): ClientPayload {
  const marital_status = get_select_value("marital-status") as MaritalStatus || "Single";
  const selected_accounts = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="accounts"]:checked'),
  ).map((account) => account.value);

  return {
    account_structure: {
      non_retirement_accounts: selected_accounts.filter((account) => !retirement_accounts.has(account)),
      retirement_accounts: selected_accounts.filter((account) => retirement_accounts.has(account)),
    },
    client_1: build_person("client1"),
    client_2: marital_status === "Married" ? build_person("client2") : null,
    liabilities: [build_liability()],
    marital_status,
    static_financial_data: {
      client_2_monthly_expense_budget: marital_status === "Married"
        ? parse_number(get_input_value("client2-expense-budget"))
        : 0,
      client_2_monthly_salary_after_tax: marital_status === "Married"
        ? parse_number(get_input_value("client2-monthly-salary"))
        : 0,
      monthly_expense_budget: parse_number(get_input_value("expense-budget")),
      monthly_salary_after_tax: parse_number(get_input_value("monthly-salary")),
      notes: get_textarea_value("financial-notes"),
      private_reserve_target: parse_number(get_input_value("reserve-target")),
    },
    trust_details: {
      city: get_input_value("property-city"),
      has_trust: get_checkbox_checked("has-trust"),
      property_address: get_input_value("property-address"),
      state: get_input_value("property-state"),
      trust_name: get_input_value("trust-name"),
      zip: get_input_value("property-zip"),
    },
  };
}

function build_person(prefix: "client1" | "client2"): ClientPerson {
  return {
    age: parse_number(get_input_value(`${prefix}-age`)),
    date_of_birth: get_input_value(`${prefix}-dob`),
    email: get_input_value(`${prefix}-email`),
    first_name: get_input_value(`${prefix}-first-name`),
    last_name: get_input_value(`${prefix}-last-name`),
    middle_name: get_input_value(`${prefix}-middle-name`),
    phone: get_input_value(`${prefix}-phone`),
    ssn_last_four: get_input_value(`${prefix}-ssn-last-four`),
  };
}

function build_liability() {
  const type_select = document.querySelector<HTMLSelectElement>('[name="liability_type"]');
  const lender_input = document.querySelector<HTMLInputElement>('[name="liability_lender"]');
  const balance_input = document.querySelector<HTMLInputElement>('[name="liability_balance"]');
  const rate_input = document.querySelector<HTMLInputElement>('[name="liability_rate"]');
  const payment_input = document.querySelector<HTMLInputElement>('[name="liability_payment"]');

  return {
    balance: parse_number(balance_input?.value ?? ""),
    interest_rate: parse_number(rate_input?.value ?? ""),
    lender_name: lender_input?.value.trim() ?? "",
    liability_type: type_select?.value ?? "Mortgage",
    monthly_payment: parse_number(payment_input?.value ?? ""),
  };
}

function validate_client_payload(payload: ClientPayload): string[] {
  const errors: string[] = [];

  if (!payload.client_1.first_name) {
    errors.push("Client 1 first name is required");
  }

  if (!payload.client_1.last_name) {
    errors.push("Client 1 last name is required");
  }

  if (!payload.client_1.date_of_birth) {
    errors.push("Client 1 date of birth is required");
  }

  if (!is_four_digits(payload.client_1.ssn_last_four ?? "")) {
    errors.push("Client 1 SSN last four must be 4 digits");
  }

  if (!looks_like_email(payload.client_1.email ?? "")) {
    errors.push("Client 1 email must look like an email address");
  }

  if (payload.marital_status === "Married") {
    const spouse = payload.client_2;

    if (!spouse?.first_name) {
      errors.push("Client 2 first name is required for married clients");
    }

    if (!spouse?.last_name) {
      errors.push("Client 2 last name is required for married clients");
    }

    if (!spouse?.date_of_birth) {
      errors.push("Client 2 date of birth is required for married clients");
    }

    if (spouse && !is_four_digits(spouse.ssn_last_four ?? "")) {
      errors.push("Client 2 SSN last four must be 4 digits");
    }

    if (spouse && !looks_like_email(spouse.email ?? "")) {
      errors.push("Client 2 email must look like an email address");
    }

    if (!payload.static_financial_data.client_2_monthly_salary_after_tax) {
      errors.push("Client 2 monthly inflow is required for married clients");
    }

    if (!payload.static_financial_data.client_2_monthly_expense_budget) {
      errors.push("Client 2 monthly expense is required for married clients");
    }
  }

  return errors;
}

function parse_number(value: string): number {
  const parsed_value = Number(value.replace(/[^0-9.-]/g, ""));

  return Number.isFinite(parsed_value) ? parsed_value : 0;
}

function set_person_values(prefix: "client1" | "client2", person: ClientPerson): void {
  set_control_value(`${prefix}_first_name`, person.first_name);
  set_control_value(`${prefix}_middle_name`, person.middle_name ?? "");
  set_control_value(`${prefix}_last_name`, person.last_name);
  set_control_value(`${prefix}_dob`, person.date_of_birth);
  set_control_value(`${prefix}_ssn_last_four`, person.ssn_last_four ?? "");
  set_control_value(`${prefix}_email`, person.email ?? "");
  set_control_value(`${prefix}_phone`, person.phone ?? "");
}

function set_control_value(name: string, value: string): void {
  const control = document.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[name="${name}"]`,
  );

  if (control) {
    control.value = value;
  }
}

function set_control_checked(id: string, checked: boolean): void {
  const control = document.getElementById(id);

  if (control instanceof HTMLInputElement) {
    control.checked = checked;
  }
}

function get_input_value(id: string): string {
  const input = document.getElementById(id);

  return input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement
    ? input.value.trim()
    : "";
}

function get_textarea_value(id: string): string {
  const textarea = document.getElementById(id);

  return textarea instanceof HTMLTextAreaElement ? textarea.value.trim() : "";
}

function get_checkbox_checked(id: string): boolean {
  const checkbox = document.getElementById(id);

  return checkbox instanceof HTMLInputElement ? checkbox.checked : false;
}

function get_select_value(id: string): string {
  const select = document.getElementById(id);

  return select instanceof HTMLSelectElement ? select.value : "";
}

function set_text(id: string, value: string): void {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}
