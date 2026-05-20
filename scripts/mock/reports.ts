export type ReportStatus = "Ready" | "Review" | "Queued";
export type ReportType = "SACS" | "TCC";

export interface MockReport {
  id: string;
  client: string;
  advisor: string;
  report_type: ReportType;
  generated_date: string;
  status: ReportStatus;
}

export const mock_reports: MockReport[] = [
  {
    advisor: "Maya Chen",
    client: "Anderson Family Trust",
    generated_date: "May 15, 2026",
    id: "report-001",
    report_type: "SACS",
    status: "Ready",
  },
  {
    advisor: "Daniel Brooks",
    client: "Northstar Holdings",
    generated_date: "May 12, 2026",
    id: "report-002",
    report_type: "TCC",
    status: "Review",
  },
  {
    advisor: "Elena Park",
    client: "Riverbend Capital",
    generated_date: "May 7, 2026",
    id: "report-003",
    report_type: "SACS",
    status: "Ready",
  },
  {
    advisor: "Priya Nair",
    client: "Crescent Advisory Group",
    generated_date: "May 2, 2026",
    id: "report-004",
    report_type: "TCC",
    status: "Queued",
  },
];
