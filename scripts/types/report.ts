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
