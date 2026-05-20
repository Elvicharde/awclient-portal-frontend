import { mock_clients } from "./clients.js";
import type { ClientPayload, ClientSummary } from "../types/client.js";

const clients: ClientSummary[] = mock_clients.map((client) => ({
  ...client,
  payload: create_payload_from_summary(client.name),
}));

export function get_clients(): ClientSummary[] {
  return [...clients];
}

export function get_client_by_id(id: string): ClientSummary | undefined {
  return clients.find((client) => client.id === id);
}

export function create_client(payload: ClientPayload): ClientSummary {
  const client: ClientSummary = {
    advisor: "Operations Team",
    id: `client-${Date.now()}`,
    last_updated: "May 20, 2026",
    name: get_client_name(payload),
    note: "Created from mock form",
    payload,
    status: "Draft",
  };

  clients.unshift(client);

  return client;
}

export function update_client(id: string, payload: ClientPayload): ClientSummary | undefined {
  const client = get_client_by_id(id);

  if (!client) {
    return undefined;
  }

  client.last_updated = "May 20, 2026";
  client.name = get_client_name(payload);
  client.note = "Updated from mock form";
  client.payload = payload;

  return client;
}

function get_client_name(payload: ClientPayload): string {
  return `${payload.client_1.first_name} ${payload.client_1.last_name}`.trim();
}

function create_payload_from_summary(name: string): ClientPayload {
  const [first_name = "", ...last_name_parts] = name.split(" ");
  const is_married_household = name === "Anderson Family Trust";

  return {
    account_structure: {
      non_retirement_accounts: ["Brokerage", "Checking", "Savings"],
      retirement_accounts: ["IRA", "Roth IRA", "401K"],
    },
    client_1: {
      date_of_birth: "1970-01-01",
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      first_name,
      last_name: last_name_parts.join(" ") || "Client",
      phone: "",
      ssn_last_four: "",
    },
    client_2: is_married_household
      ? {
          date_of_birth: "1972-04-12",
          email: `spouse.${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          first_name: "Jordan",
          last_name: last_name_parts.join(" ") || "Client",
          phone: "",
          ssn_last_four: "",
        }
      : null,
    liabilities: [
      {
        balance: 308000,
        interest_rate: 4.85,
        lender_name: "Primary mortgage lender",
        liability_type: "Mortgage",
        monthly_payment: 2450,
      },
      {
        balance: 6200,
        interest_rate: 18.4,
        lender_name: "Credit card issuer",
        liability_type: "Credit card",
        monthly_payment: 300,
      },
    ],
    marital_status: is_married_household ? "Married" : "Single",
    static_financial_data: {
      ...(is_married_household
        ? {
            client_2_monthly_expense_budget: 5200,
            client_2_monthly_salary_after_tax: 8000,
          }
        : {}),
      monthly_expense_budget: 9000,
      monthly_salary_after_tax: 15000,
      private_reserve_target: 54000,
    },
    trust_details: {
      has_trust: true,
      property_address: "100 Main Street",
      trust_name: `${name} Trust`,
    },
  };
}
