export type MaritalStatus = "Single" | "Married";

export interface ClientPerson {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  age?: number;
  ssn_last_four?: string;
  email?: string;
  phone?: string;
}

export interface AccountStructure {
  retirement_accounts: string[];
  non_retirement_accounts: string[];
}

export interface TrustDetails {
  has_trust: boolean;
  trust_name?: string;
  property_address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Liability {
  liability_type: string;
  lender_name: string;
  balance: number;
  interest_rate: number;
  monthly_payment: number;
}

export interface StaticFinancialData {
  monthly_salary_after_tax: number;
  monthly_expense_budget: number;
  client_2_monthly_salary_after_tax?: number;
  client_2_monthly_expense_budget?: number;
  private_reserve_target: number;
  notes?: string;
}

export interface ClientPayload {
  client_1: ClientPerson;
  client_2?: ClientPerson | null;
  marital_status: MaritalStatus;
  account_structure: AccountStructure;
  trust_details: TrustDetails;
  liabilities: Liability[];
  static_financial_data: StaticFinancialData;
}

export interface ClientSummary {
  id: string;
  name: string;
  status: "Active" | "Pending" | "Draft";
  advisor: string;
  last_updated: string;
  note: string;
  payload: ClientPayload;
}
