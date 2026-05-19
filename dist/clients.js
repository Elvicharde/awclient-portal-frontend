export function initialize_clients_page() {
    const search_input = document.getElementById("client-search");
    const table_body = document.getElementById("clients-table-body");
    const empty_state = document.getElementById("clients-empty-state");
    if (search_input instanceof HTMLInputElement &&
        table_body instanceof HTMLTableSectionElement &&
        empty_state instanceof HTMLElement) {
        search_input.addEventListener("input", () => {
            filter_client_rows(search_input.value, table_body, empty_state);
        });
    }
    console.log("Clients page initialized");
}
function filter_client_rows(search_term, table_body, empty_state) {
    const normalized_search = search_term.trim().toLowerCase();
    const rows = Array.from(table_body.querySelectorAll("tr"));
    let visible_count = 0;
    rows.forEach((row) => {
        const row_text = row.textContent?.toLowerCase() ?? "";
        const is_visible = row_text.includes(normalized_search);
        row.classList.toggle("hidden", !is_visible);
        if (is_visible) {
            visible_count += 1;
        }
    });
    empty_state.classList.toggle("hidden", visible_count > 0);
}
