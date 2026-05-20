import { mock_reports } from "./mock/reports.js";
import { fetch_reports } from "./services/report_service.js";
import type { ReportSummary } from "./types/report.js";
import { set_button_loading } from "./utils/dom.js";
import { show_toast } from "./utils/toast.js";

type ReportSortKey = "client" | "report_type" | "generated_date" | "status";

let reports: ReportSummary[] = [...mock_reports];
let sort_key: ReportSortKey = "generated_date";
let sort_direction: "asc" | "desc" = "desc";

export function initialize_reports_page(): void {
  const table_body = document.getElementById("reports-table-body");

  if (!(table_body instanceof HTMLTableSectionElement)) {
    return;
  }

  show_reports_loading();
  initialize_report_filters();
  initialize_report_sorting();
  initialize_report_actions();
  void load_reports_page_data();

  console.log("Reports page initialized");
}

async function load_reports_page_data(): Promise<void> {
  try {
    reports = await fetch_reports();
  } catch (error) {
    reports = [...mock_reports];
    show_toast({
      message: get_error_message(error, "Backend reports unavailable. Showing mock reports."),
      variant: "error",
    });
  }

  render_reports();
  update_report_stats();
}

function initialize_report_filters(): void {
  const type_filter = document.getElementById("report-type-filter");

  type_filter?.addEventListener("change", render_reports);
}

function initialize_report_sorting(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-sort]").forEach((button) => {
    button.addEventListener("click", () => {
      const next_sort_key = button.dataset.sort as ReportSortKey;

      if (sort_key === next_sort_key) {
        sort_direction = sort_direction === "asc" ? "desc" : "asc";
      } else {
        sort_key = next_sort_key;
        sort_direction = "asc";
      }

      render_reports();
      update_sort_buttons(button);
    });
  });
}

function initialize_report_actions(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    if (target.matches("[data-download-report]")) {
      set_button_loading(target, true, "Preparing");

      window.setTimeout(() => {
        set_button_loading(target, false);
        show_toast({ message: "Download prepared", variant: "info" });
      }, 700);
    }
  });
}

function render_reports(): void {
  const table_body = document.getElementById("reports-table-body");
  const empty_state = document.getElementById("reports-empty-state");

  if (!(table_body instanceof HTMLTableSectionElement) || !(empty_state instanceof HTMLElement)) {
    return;
  }

  const visible_reports = get_visible_reports();
  table_body.innerHTML = visible_reports.map(render_report_row).join("");
  empty_state.classList.toggle("hidden", visible_reports.length > 0);
}

function get_visible_reports(): ReportSummary[] {
  const type_filter = document.getElementById("report-type-filter");
  const selected_type = type_filter instanceof HTMLSelectElement ? type_filter.value : "all";

  return reports
    .filter((report) => selected_type === "all" || report.report_type === selected_type)
    .sort((first_report, second_report) => {
      const first_value = first_report[sort_key];
      const second_value = second_report[sort_key];
      const direction = sort_direction === "asc" ? 1 : -1;

      return first_value.localeCompare(second_value) * direction;
    });
}

function render_report_row(report: ReportSummary): string {
  return `
    <tr>
      <td>
        <strong>${report.client}</strong>
        <span class="table-subtext">Advisor: ${report.advisor}</span>
      </td>
      <td>${report.report_type}</td>
      <td>${report.generated_date}</td>
      <td>${render_report_badge(report.status)}</td>
      <td>
        <button class="action-button" type="button" data-download-report>
          Download
        </button>
      </td>
    </tr>
  `;
}

function render_report_badge(status: ReportSummary["status"]): string {
  const badge_class = status === "Ready"
    ? "badge-success"
    : status === "Review"
      ? "badge-warning"
      : "badge-neutral";

  return `<span class="badge ${badge_class}">${status}</span>`;
}

function update_report_stats(): void {
  set_text("total-report-stat", String(reports.length));
  set_text("ready-report-stat", String(reports.filter((report) => report.status === "Ready").length));
  set_text("monthly-report-stat", String(reports.length));
}

function update_sort_buttons(active_button: HTMLButtonElement): void {
  document.querySelectorAll<HTMLButtonElement>("[data-sort]").forEach((button) => {
    const is_active = button === active_button;

    button.classList.toggle("is-active", is_active);
    button.classList.toggle("sort-asc", is_active && sort_direction === "asc");
  });
}

function set_text(id: string, value: string): void {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function show_reports_loading(): void {
  const table_body = document.getElementById("reports-table-body");
  const empty_state = document.getElementById("reports-empty-state");

  if (table_body instanceof HTMLTableSectionElement) {
    table_body.innerHTML = `
      <tr>
        <td colspan="5">
          <span class="table-subtext">Loading reports...</span>
        </td>
      </tr>
    `;
  }

  empty_state?.classList.add("hidden");
}

function get_error_message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
