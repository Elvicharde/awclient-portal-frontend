export function initialize_monthly_logs_page() {
    const client_select = document.getElementById("monthly-log-client");
    const month_select = document.getElementById("monthly-log-month");
    [client_select, month_select].forEach((control) => {
        if (control instanceof HTMLSelectElement) {
            control.addEventListener("change", () => {
                console.log("Monthly logs selection changed");
            });
        }
    });
    console.log("Monthly logs page initialized");
}
