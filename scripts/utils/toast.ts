type ToastVariant = "success" | "error" | "info";

interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export function show_toast({
  message,
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
  toast.textContent = message;
  toast_root.append(toast);

  window.setTimeout(() => {
    toast.classList.add("toast-exit");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, duration);
}
