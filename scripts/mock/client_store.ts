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

  return {
    account_structure: {
      non_retirement_accounts: ["Checking"],
      retirement_accounts: [],
    },
    client_1: {
      date_of_birth: "1970-01-01",
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      first_name,
      last_name: last_name_parts.join(" ") || "Client",
      phone: "",
      ssn_last_four: "",
    },
    client_2: null,
    liabilities: [],
    marital_status: "Single",
    static_financial_data: {
      monthly_expense_budget: 0,
      monthly_salary_after_tax: 0,
      private_reserve_target: 0,
    },
    trust_details: {
      has_trust: false,
    },
  };
}
