import { API_BASE_URL } from "./api.js";
import { fetch_report_by_id } from "./services/report_service.js";
import type { GeneratedReport } from "./types/report.js";

export function initialize_report_preview_page(): void {
  const report_id = new URLSearchParams(window.location.search).get("id");

  initialize_preview_actions();

  if (!report_id) {
    show_error_state("Missing report id");
    set_actions_enabled(false);
    return;
  }

  void load_report_preview(report_id);

  console.log("Report preview page initialized");
}

async function load_report_preview(report_id: string): Promise<void> {
  show_loading_state();

  try {
    const report = await fetch_report_by_id(report_id);
    render_report_metadata(report);
    show_loaded_state();
  } catch (error) {
    show_error_state(get_error_message(error));
    set_actions_enabled(false);
  }
}

function initialize_preview_actions(): void {
  const download_button = document.getElementById("download-report-pdf");

  document.querySelectorAll<HTMLButtonElement>("[data-back-to-reports]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "/pages/reports.html";
    });
  });

  download_button?.addEventListener("click", () => {
    if (!(download_button instanceof HTMLButtonElement) || download_button.disabled) {
      return;
    }

    const pdf_url = download_button.dataset.pdfUrl;

    if (pdf_url) {
      window.open(resolve_pdf_url(pdf_url), "_blank", "noopener");
    }
  });
}

function render_report_metadata(report: GeneratedReport): void {
  const client_label = report.client_name
    ?? (report.client_id ? `Client ${report.client_id}` : "Not available");

  set_text("preview-client", client_label);
  set_text("preview-client-id", report.client_id ?? "Not available");
  set_text("preview-quarter", report.quarter ?? "Not available");
  set_text("preview-report-type", report.report_type);
  set_text("preview-generated-date", report.generated_date);
  set_text("preview-pdf-url", report.pdf_url ?? "PDF URL not available");
  render_status_badge(report.status);
  set_download_action(report.pdf_url);
}

function render_status_badge(status: GeneratedReport["status"]): void {
  const status_element = document.getElementById("preview-status");

  if (!status_element) {
    return;
  }

  const badge_class = status === "Ready"
    ? "badge-success"
    : status === "Review"
      ? "badge-warning"
      : "badge-neutral";

  status_element.className = `badge ${badge_class}`;
  status_element.textContent = status;
}

function set_download_action(pdf_url: string | undefined): void {
  const download_button = document.getElementById("download-report-pdf");

  if (!(download_button instanceof HTMLButtonElement)) {
    return;
  }

  download_button.disabled = !pdf_url;
  download_button.dataset.pdfUrl = pdf_url ?? "";
}

function set_actions_enabled(has_pdf_url: boolean): void {
  const download_button = document.getElementById("download-report-pdf");

  if (download_button instanceof HTMLButtonElement) {
    download_button.disabled = !has_pdf_url;
    download_button.dataset.pdfUrl = "";
  }
}

function show_loading_state(): void {
  set_state_visibility({ error: false, loaded: false, loading: true });
}

function show_loaded_state(): void {
  set_state_visibility({ error: false, loaded: true, loading: false });
}

function show_error_state(message: string): void {
  set_text("preview-error-message", message);
  set_state_visibility({ error: true, loaded: false, loading: false });
}

function set_state_visibility(state: { error: boolean; loaded: boolean; loading: boolean }): void {
  toggle_hidden("preview-loading", !state.loading);
  toggle_hidden("preview-error", !state.error);
  toggle_hidden("preview-loaded", !state.loaded);
}

function resolve_pdf_url(pdf_url: string): string {
  if (pdf_url.startsWith("http://") || pdf_url.startsWith("https://")) {
    return pdf_url;
  }

  return `${API_BASE_URL}${pdf_url}`;
}

function set_text(id: string, value: string): void {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function toggle_hidden(id: string, is_hidden: boolean): void {
  const element = document.getElementById(id);

  if (element) {
    element.classList.toggle("hidden", is_hidden);
  }
}

function get_error_message(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load report metadata";
}
