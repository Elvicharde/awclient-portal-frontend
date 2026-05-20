import { api_get } from "../api.js";
import type { ReportStatus, ReportSummary, ReportType } from "../types/report.js";

interface BackendReport {
  id?: number | string;
  client_id?: number | string;
  report_type?: string | null;
  quarter?: string | null;
  status?: string | null;
  generated_at?: string | null;
  pdf_url?: string | null;
}

export async function fetch_reports(): Promise<ReportSummary[]> {
  const response = await api_get<unknown>("/api/reports");
  const reports = get_items(response);

  return reports.map(normalize_report).filter((report): report is ReportSummary => report !== null);
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

function normalize_report(value: unknown): ReportSummary | null {
  if (!is_record(value)) {
    return null;
  }

  const report = value as BackendReport;
  const id = report.id === undefined ? "" : String(report.id);

  if (!id) {
    return null;
  }

  return {
    advisor: "Operations Team",
    client: report.client_id === undefined ? "Unknown client" : `Client ${report.client_id}`,
    generated_date: format_date(report.generated_at),
    id,
    pdf_url: report.pdf_url ?? undefined,
    report_type: normalize_report_type(report.report_type),
    status: normalize_report_status(report.status),
  };
}

function normalize_report_type(value: string | null | undefined): ReportType {
  const normalized_value = value?.toLowerCase();

  if (normalized_value === "sacs") {
    return "SACS";
  }

  if (normalized_value === "tcc") {
    return "TCC";
  }

  return "Combined";
}

function normalize_report_status(value: string | null | undefined): ReportStatus {
  const normalized_value = value?.toLowerCase();

  if (normalized_value === "generated" || normalized_value === "ready") {
    return "Ready";
  }

  if (normalized_value === "failed" || normalized_value === "review") {
    return "Review";
  }

  return "Queued";
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

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
