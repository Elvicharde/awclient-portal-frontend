type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastOptions {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

const toast_titles: Record<ToastVariant, string> = {
  success: "Success",
  error: "Error",
  info: "Notice",
  warning: "Review required",
};

const toast_icons: Record<ToastVariant, string> = {
  success: "✓",
  error: "×",
  info: "i",
  warning: "!",
};

export function show_toast({
  message,
  title,
  variant = "info",
  duration = 3200,
}: ToastOptions): void {
  let toast_root = document.getElementById("toast-root");

  if (!toast_root) {
    toast_root = document.createElement("div");
    toast_root.id = "toast-root";
    toast_root.className = "toast-root";
    document.body.append(toast_root);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${variant}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const icon = document.createElement("div");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = toast_icons[variant];

  const content = document.createElement("div");
  content.className = "toast-content";

  const title_element = document.createElement("strong");
  title_element.className = "toast-title";
  title_element.textContent = title ?? toast_titles[variant];

  const message_element = document.createElement("p");
  message_element.className = "toast-message";
  message_element.textContent = message;

  const close_button = document.createElement("button");
  close_button.className = "toast-close";
  close_button.type = "button";
  close_button.setAttribute("aria-label", "Dismiss notification");
  close_button.textContent = "×";

  content.append(title_element, message_element);
  toast.append(icon, content, close_button);
  toast_root.append(toast);

  const remove_toast = (): void => {
    if (toast.classList.contains("toast-exit")) {
      return;
    }

    toast.classList.add("toast-exit");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  };

  const dismiss_timer = window.setTimeout(remove_toast, duration);

  close_button.addEventListener("click", () => {
    window.clearTimeout(dismiss_timer);
    remove_toast();
  });
}
