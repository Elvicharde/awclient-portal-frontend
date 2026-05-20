export type ReportStatus = "Ready" | "Review" | "Queued";
export type ReportType = "SACS" | "TCC" | "Combined";

export interface ReportSummary {
  id: string;
  client: string;
  advisor: string;
  report_type: ReportType;
  generated_date: string;
  status: ReportStatus;
  pdf_url?: string;
}

export interface GeneratedReport {
  id: string;
  client_id?: string;
  client_name?: string;
  quarter?: string;
  report_type: ReportType;
  status: ReportStatus;
  pdf_url?: string;
  generated_at?: string;
  generated_date: string;
}
