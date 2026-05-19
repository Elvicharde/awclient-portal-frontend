export function initialize_sidebar() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar)
        return;
    // Find sidebar collapse button (desktop)
    const collapseBtn = sidebar.querySelector(".sidebar-collapse-btn");
    // Find navbar sidebar toggle (mobile)
    const navbar = document.getElementById("navbar");
    const navbarToggle = navbar?.querySelector(".navbar-sidebar-toggle");
    // Collapse/expand sidebar (desktop)
    if (collapseBtn) {
        collapseBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-collapsed");
        });
    }
    // Open sidebar overlay (mobile)
    if (navbarToggle) {
        navbarToggle.addEventListener("click", () => {
            sidebar.classList.add("sidebar-open");
        });
    }
    // Close sidebar overlay when clicking outside (mobile)
    document.addEventListener("click", (e) => {
        if (window.innerWidth > 900)
            return;
        if (!sidebar.classList.contains("sidebar-open"))
            return;
        if (!(e.target instanceof Element) ||
            sidebar.contains(e.target) ||
            (navbarToggle && navbarToggle.contains(e.target))) {
            return;
        }
        sidebar.classList.remove("sidebar-open");
    });
    // Highlight active nav link
    const page = document.body.dataset.page;
    if (page) {
        const activeLink = sidebar.querySelector(`.nav-link[data-nav="${page}"]`);
        if (activeLink) {
            activeLink.classList.add("active");
        }
    }
    console.log("Sidebar initialized");
}
