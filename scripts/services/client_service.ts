import { api_get } from "../api.js";
import type {
  ClientPayload,
  ClientPerson,
  ClientSummary,
  MaritalStatus,
} from "../types/client.js";

interface BackendClient {
  id?: number | string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  date_of_birth?: string | null;
  ssn_last_four?: string | null;
  email?: string | null;
  phone?: string | null;
  marital_status?: string | null;
  spouse_first_name?: string | null;
  spouse_middle_name?: string | null;
  spouse_last_name?: string | null;
  spouse_date_of_birth?: string | null;
  spouse_ssn_last_four?: string | null;
  spouse_email?: string | null;
  spouse_phone?: string | null;
  client_1_monthly_salary_after_tax?: number | null;
  client_1_monthly_expense_budget?: number | null;
  client_2_monthly_salary_after_tax?: number | null;
  client_2_monthly_expense_budget?: number | null;
  private_reserve_target?: number | null;
  insurance_deductible_total?: number | null;
  retirement_accounts_json?: unknown;
  non_retirement_accounts_json?: unknown;
  trust_details_json?: unknown;
  liabilities_json?: unknown;
  created_at?: string | null;
}

export async function fetch_clients(): Promise<ClientSummary[]> {
  const response = await api_get<unknown>("/api/clients");
  const clients = get_items(response);

  return clients.map(normalize_client).filter((client): client is ClientSummary => client !== null);
}

export async function fetch_client_by_id(id: string): Promise<ClientSummary | undefined> {
  const response = await api_get<unknown>(`/api/clients/${encodeURIComponent(id)}`);
  return normalize_client(response) ?? undefined;
}

function get_items(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (is_record(response) && Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

function normalize_client(value: unknown): ClientSummary | null {
  if (!is_record(value)) {
    return null;
  }

  const client = value as BackendClient;
  const id = client.id === undefined ? "" : String(client.id);
  const first_name = client.first_name ?? "";
  const last_name = client.last_name ?? "";
  const marital_status = normalize_marital_status(client.marital_status);
  const payload = create_payload(client, marital_status);

  if (!id || !first_name || !last_name) {
    return null;
  }

  return {
    advisor: "Operations Team",
    id,
    last_updated: format_date(client.created_at),
    name: `${first_name} ${last_name}`.trim(),
    note: marital_status === "Married" ? "Married household" : "Single client",
    payload,
    status: "Active",
  };
}

function create_payload(client: BackendClient, marital_status: MaritalStatus): ClientPayload {
  const client_1: ClientPerson = {
    date_of_birth: client.date_of_birth ?? "",
    email: client.email ?? "",
    first_name: client.first_name ?? "",
    last_name: client.last_name ?? "",
    middle_name: client.middle_name ?? undefined,
    phone: client.phone ?? "",
    ssn_last_four: client.ssn_last_four ?? "",
  };
  const client_2 = marital_status === "Married"
    ? {
        date_of_birth: client.spouse_date_of_birth ?? "",
        email: client.spouse_email ?? "",
        first_name: client.spouse_first_name ?? "",
        last_name: client.spouse_last_name ?? "",
        middle_name: client.spouse_middle_name ?? undefined,
        phone: client.spouse_phone ?? "",
        ssn_last_four: client.spouse_ssn_last_four ?? "",
      }
    : null;

  return {
    account_structure: {
      client_1_retirement_accounts: get_retirement_account_names(client.retirement_accounts_json, "client_1"),
      client_2_retirement_accounts: get_retirement_account_names(client.retirement_accounts_json, "client_2"),
      non_retirement_accounts: get_account_names(client.non_retirement_accounts_json),
      retirement_accounts: get_account_names(client.retirement_accounts_json),
    },
    client_1,
    client_2,
    liabilities: get_liabilities(client.liabilities_json),
    marital_status,
    static_financial_data: {
      client_2_monthly_expense_budget: parse_optional_number(client.client_2_monthly_expense_budget),
      client_2_monthly_salary_after_tax: parse_optional_number(client.client_2_monthly_salary_after_tax),
      insurance_deductible_total: parse_optional_number(client.insurance_deductible_total),
      monthly_expense_budget: parse_number(client.client_1_monthly_expense_budget),
      monthly_salary_after_tax: parse_number(client.client_1_monthly_salary_after_tax),
      private_reserve_target: parse_number(client.private_reserve_target),
    },
    trust_details: get_trust_details(client.trust_details_json),
  };
}

function normalize_marital_status(value: string | null | undefined): MaritalStatus {
  return value?.toLowerCase() === "married" ? "Married" : "Single";
}

function get_account_names(value: unknown): string[] {
  const normalized_value = normalize_json_value(value);

  if (Array.isArray(normalized_value)) {
    return normalized_value.filter((item): item is string => typeof item === "string");
  }

  if (!is_record(normalized_value)) {
    return [];
  }

  return Object.entries(normalized_value).flatMap(([key, nested_value]) => {
    if (Array.isArray(nested_value)) {
      return nested_value.filter((item): item is string => typeof item === "string");
    }

    return nested_value ? [key] : [];
  });
}

function get_retirement_account_names(value: unknown, owner_key: "client_1" | "client_2"): string[] {
  const normalized_value = normalize_json_value(value);

  if (!is_record(normalized_value)) {
    return owner_key === "client_1" ? get_account_names(normalized_value) : [];
  }

  const owner_accounts = normalized_value[owner_key];

  if (Array.isArray(owner_accounts)) {
    return owner_accounts.filter((item): item is string => typeof item === "string");
  }

  if (owner_key === "client_1" && !("client_1" in normalized_value) && !("client_2" in normalized_value)) {
    return get_account_names(normalized_value);
  }

  return [];
}

function normalize_json_value(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return parse_powershell_object_string(value);
  }
}

function parse_powershell_object_string(value: string): Record<string, boolean> | null {
  const trimmed_value = value.trim();

  if (!trimmed_value.startsWith("@{") || !trimmed_value.endsWith("}")) {
    return null;
  }

  return trimmed_value
    .slice(2, -1)
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, boolean>>((result, entry) => {
      const [key, raw_value] = entry.split("=").map((part) => part.trim());

      if (key) {
        result[key] = raw_value?.toLowerCase() !== "false";
      }

      return result;
    }, {});
}

function get_trust_details(value: unknown): ClientPayload["trust_details"] {
  const normalized_value = normalize_json_value(value);

  if (!is_record(normalized_value)) {
    return { has_trust: false };
  }

  return {
    city: get_string(normalized_value.city),
    has_trust: Boolean(normalized_value.has_trust),
    property_address: get_string(normalized_value.property_address),
    state: get_string(normalized_value.state),
    trust_name: get_string(normalized_value.trust_name),
    zip: get_string(normalized_value.zip),
  };
}

function get_liabilities(value: unknown): ClientPayload["liabilities"] {
  const normalized_value = normalize_json_value(value);

  if (!is_record(normalized_value)) {
    return [];
  }

  return Object.entries(normalized_value).map(([key, nested_value]) => ({
    balance: parse_number(nested_value),
    interest_rate: 0,
    lender_name: key,
    liability_type: key,
    monthly_payment: 0,
  }));
}

function parse_number(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed_value = Number(value.replace(/[^0-9.-]/g, ""));

    return Number.isFinite(parsed_value) ? parsed_value : 0;
  }

  return 0;
}

function parse_optional_number(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return parse_number(value);
}

function format_date(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function get_string(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
