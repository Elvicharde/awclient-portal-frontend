export type ClientStatus = "Active" | "Pending" | "Draft";

export interface MockClient {
  id: string;
  name: string;
  status: ClientStatus;
  advisor: string;
  last_updated: string;
  note: string;
}

export const mock_clients: MockClient[] = [
  {
    advisor: "Maya Chen",
    id: "anderson-family-trust",
    last_updated: "May 14, 2026",
    name: "Anderson Family Trust",
    note: "Portfolio review due",
    status: "Active",
  },
  {
    advisor: "Daniel Brooks",
    id: "northstar-holdings",
    last_updated: "May 10, 2026",
    name: "Northstar Holdings",
    note: "Awaiting monthly log",
    status: "Pending",
  },
  {
    advisor: "Elena Park",
    id: "riverbend-capital",
    last_updated: "May 8, 2026",
    name: "Riverbend Capital",
    note: "Reports current",
    status: "Active",
  },
  {
    advisor: "Priya Nair",
    id: "crescent-advisory-group",
    last_updated: "May 3, 2026",
    name: "Crescent Advisory Group",
    note: "New intake",
    status: "Draft",
  },
];
