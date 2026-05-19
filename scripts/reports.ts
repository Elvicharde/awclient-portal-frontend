export function initialize_reports_page(): void {
  const download_buttons = document.querySelectorAll<HTMLButtonElement>(
    ".data-table .action-button",
  );

  download_buttons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Report download placeholder clicked");
    });
  });

  console.log("Reports page initialized");
}
