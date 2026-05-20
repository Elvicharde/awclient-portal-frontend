const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const DEPLOYED_API_BASE_URL = "https://YOUR-RAILWAY-BACKEND-URL";
const DEFAULT_TIMEOUT_MS = 6000;

export const API_BASE_URL = get_api_base_url();

export async function api_get<T>(path: string, timeout_ms = DEFAULT_TIMEOUT_MS): Promise<T> {
  return api_request<T>("GET", path, undefined, timeout_ms);
}

export async function api_post<T>(
  path: string,
  body?: unknown,
  timeout_ms = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  return api_request<T>("POST", path, body, timeout_ms);
}

async function api_request<T>(
  method: "GET" | "POST",
  path: string,
  body: unknown,
  timeout_ms: number,
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeout_ms);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      method,
      signal: controller.signal,
    });

    const text = await response.text();
    const parsed_body = text ? parse_json(text) : null;

    if (!response.ok) {
      throw new Error(get_error_message(parsed_body, response.status));
    }

    return parsed_body as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Backend request timed out");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Backend request failed");
  } finally {
    window.clearTimeout(timeout);
  }
}

function get_api_base_url(): string {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "") {
    return LOCAL_API_BASE_URL;
  }

  return DEPLOYED_API_BASE_URL;
}

function parse_json(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Backend returned invalid JSON");
  }
}

function get_error_message(body: unknown, status: number): string {
  if (is_record(body) && typeof body.detail === "string") {
    return body.detail;
  }

  return `Backend request failed with status ${status}`;
}

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
