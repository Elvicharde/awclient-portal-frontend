export function initialize_reports_page() {
    const download_buttons = document.querySelectorAll(".data-table .action-button");
    download_buttons.forEach((button) => {
        button.addEventListener("click", () => {
            console.log("Report download placeholder clicked");
        });
    });
    console.log("Reports page initialized");
}
