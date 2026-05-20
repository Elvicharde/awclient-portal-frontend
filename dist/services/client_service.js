import { api_get } from "../api.js";
export async function fetch_clients() {
    const response = await api_get("/api/clients");
    const clients = get_items(response);
    return clients.map(normalize_client).filter((client) => client !== null);
}
export async function fetch_client_by_id(id) {
    const response = await api_get(`/api/clients/${encodeURIComponent(id)}`);
    return normalize_client(response) ?? undefined;
}
function get_items(response) {
    if (Array.isArray(response)) {
        return response;
    }
    if (is_record(response) && Array.isArray(response.items)) {
        return response.items;
    }
    return [];
}
function normalize_client(value) {
    if (!is_record(value)) {
        return null;
    }
    const client = value;
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
function create_payload(client, marital_status) {
    const client_1 = {
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
            non_retirement_accounts: get_account_names(client.non_retirement_accounts_json),
            retirement_accounts: get_account_names(client.retirement_accounts_json),
        },
        client_1,
        client_2,
        liabilities: get_liabilities(client.liabilities_json),
        marital_status,
        static_financial_data: {
            client_2_monthly_expense_budget: client.client_2_monthly_expense_budget ?? undefined,
            client_2_monthly_salary_after_tax: client.client_2_monthly_salary_after_tax ?? undefined,
            monthly_expense_budget: client.client_1_monthly_expense_budget ?? 0,
            monthly_salary_after_tax: client.client_1_monthly_salary_after_tax ?? 0,
            private_reserve_target: client.private_reserve_target ?? 0,
        },
        trust_details: get_trust_details(client.trust_details_json),
    };
}
function normalize_marital_status(value) {
    return value?.toLowerCase() === "married" ? "Married" : "Single";
}
function get_account_names(value) {
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === "string");
    }
    if (!is_record(value)) {
        return [];
    }
    return Object.entries(value).flatMap(([key, nested_value]) => {
        if (Array.isArray(nested_value)) {
            return nested_value.filter((item) => typeof item === "string");
        }
        return nested_value ? [key] : [];
    });
}
function get_trust_details(value) {
    if (!is_record(value)) {
        return { has_trust: false };
    }
    return {
        city: get_string(value.city),
        has_trust: Boolean(value.has_trust),
        property_address: get_string(value.property_address),
        state: get_string(value.state),
        trust_name: get_string(value.trust_name),
        zip: get_string(value.zip),
    };
}
function get_liabilities(value) {
    if (!is_record(value)) {
        return [];
    }
    return Object.entries(value).map(([key, nested_value]) => ({
        balance: typeof nested_value === "number" ? nested_value : 0,
        interest_rate: 0,
        lender_name: key,
        liability_type: key,
        monthly_payment: 0,
    }));
}
function format_date(value) {
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
function get_string(value) {
    return typeof value === "string" ? value : undefined;
}
function is_record(value) {
    return typeof value === "object" && value !== null;
}
