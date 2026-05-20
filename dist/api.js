const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const DEPLOYED_API_BASE_URL = "https://YOUR-RAILWAY-BACKEND-URL";
const DEFAULT_TIMEOUT_MS = 6000;
export const API_BASE_URL = get_api_base_url();
export async function api_get(path, timeout_ms = DEFAULT_TIMEOUT_MS) {
    return api_request("GET", path, undefined, timeout_ms);
}
export async function api_post(path, body, timeout_ms = DEFAULT_TIMEOUT_MS) {
    return api_request("POST", path, body, timeout_ms);
}
export async function api_put(path, body, timeout_ms = DEFAULT_TIMEOUT_MS) {
    return api_request("PUT", path, body, timeout_ms);
}
async function api_request(method, path, body, timeout_ms) {
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
        return parsed_body;
    }
    catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("Backend request timed out");
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Backend request failed");
    }
    finally {
        window.clearTimeout(timeout);
    }
}
function get_api_base_url() {
    const configured_api_url = (window.__APP_CONFIG__?.API_BASE_URL
        ?? window.AW_CLIENT_PORTAL_CONFIG?.API_BASE_URL)?.trim();
    if (configured_api_url) {
        return configured_api_url;
    }
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "") {
        return LOCAL_API_BASE_URL;
    }
    return DEPLOYED_API_BASE_URL;
}
function parse_json(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        throw new Error("Backend returned invalid JSON");
    }
}
function get_error_message(body, status) {
    if (is_record(body) && typeof body.detail === "string") {
        return body.detail;
    }
    return `Backend request failed with status ${status}`;
}
function is_record(value) {
    return typeof value === "object" && value !== null;
}
