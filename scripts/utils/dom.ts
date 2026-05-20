export function query_required<T extends Element>(
  selector: string,
  scope: ParentNode = document,
): T {
  const element = scope.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}

export function format_currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function parse_currency(value: string): number {
  const normalized_value = value.replace(/[^0-9.-]/g, "");
  const parsed_value = Number(normalized_value);

  return Number.isFinite(parsed_value) ? parsed_value : 0;
}

export function set_button_loading(
  button: HTMLButtonElement,
  is_loading: boolean,
  loading_label = "Loading",
): void {
  if (is_loading) {
    button.dataset.originalText = button.textContent ?? "";
    button.textContent = loading_label;
    button.disabled = true;
    button.classList.add("is-loading");
    return;
  }

  button.textContent = button.dataset.originalText ?? button.textContent;
  button.disabled = false;
  button.classList.remove("is-loading");
  delete button.dataset.originalText;
}
