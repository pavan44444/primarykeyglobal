/* ==========================================================================
   PRIMARY KEY — SHARED SIDEBAR SCRIPT
   Injects the sidebar, wires up the theme toggle, and handles active-link
   highlighting + the mobile menu. Include this once per page, right before
   </body>, after including assets/theme.css and assets/sidebar.css.

   CONFIG (optional, set BEFORE this script tag if needed):
     window.PK_ROOT  — relative path back to the project root.
                        Defaults to "../" (correct for any page that lives
                        one folder below the root, e.g. Dashboard/dashboard.html).
                        A root-level page would set window.PK_ROOT = "./";
   ========================================================================== */

(function () {
    const ROOT = window.PK_ROOT || "../";

    const NAV_ITEMS = [
        { label: "Dashboard", icon: "🏠", href: `${ROOT}dashboard/dashboard.html`, match: "Dashboard" },
   //     { label: "Interview Experiences", icon: "💼", href: `${ROOT}InterviewExperience/view-experiences.html`, match: "InterviewExperience" },
        { label: "tutorials", icon: "🧠", href: `${ROOT}Quizzes/tutorials.html`, match: "tutorials" },
      //  { label: "Campus Companies", icon: "🏢", href: `${ROOT}Companies/companies.html`, match: "Companies" },
        { label: "Leaderboard", icon: "🏆", href: `${ROOT}leaderboard/leaderboard.html`, match: "leaderboard" },
        //  { label: "Streak", icon: "📈", href: `${ROOT}streak/streak.html`, match: "streak" },
   //     { label: "Preparation Kit", icon: "📚", href: `${ROOT}preperationkit/preperationkit.html`, match: "preperationkit" },
       // { label: "Announcements", icon: "📢", href: `${ROOT}announcements/announcements.html`, match: "announcements" },
         { label: "profile", icon: "🙎🏻‍♂️", href: `${ROOT}profile/profile.html`, match: "profile" }
    ];

    const currentPath = window.location.pathname;

    // ---- Brand font: inject Google Font once per page load ----
    // Dela Gothic One — bold, angular, Japanese-style display font that
    // reads cleanly in English. Swap the family name below (and the URL)
    // for "RocknRoll One" if you want a more slanted/edgy alternative.
    function injectBrandFont() {
        if (document.getElementById("pkBrandFontLink")) return; // avoid duplicates

        const preconnect1 = document.createElement("link");
        preconnect1.rel = "preconnect";
        preconnect1.href = "https://fonts.googleapis.com";
        document.head.appendChild(preconnect1);

        const preconnect2 = document.createElement("link");
        preconnect2.rel = "preconnect";
        preconnect2.href = "https://fonts.gstatic.com";
        preconnect2.crossOrigin = "anonymous";
        document.head.appendChild(preconnect2);

        const fontLink = document.createElement("link");
        fontLink.id = "pkBrandFontLink";
        fontLink.rel = "stylesheet";
        fontLink.href = "https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap";
        document.head.appendChild(fontLink);

        const style = document.createElement("style");
        style.id = "pkBrandFontStyle";
        style.textContent = `
            .pk-sidebar-brand-text {
                font-family: 'Dela Gothic One', 'Inter', sans-serif;
                font-weight: 400; /* Dela Gothic One only ships one weight */
                letter-spacing: 0.5px;
                text-transform: uppercase;
                font-size: 15px;
                line-height: 1.3;
                
            }
        `;
        document.head.appendChild(style);
    }

    function buildNavHTML() {
        return NAV_ITEMS.map(item => {
            const isActive = currentPath.includes(`/${item.match}/`);
            return `
                <a href="${item.href}" class="pk-nav-item${isActive ? " active" : ""}">
                    <span class="pk-nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                </a>`;
        }).join("");
    }

  function buildSidebarHTML() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const isLight = savedTheme === "light";

    return `
        <div class="pk-sidebar-overlay" id="pkOverlay"></div>

        <button
            class="pk-sidebar-trigger"
            id="pkTrigger"
            aria-label="Open menu"
        >
            ☰
        </button>

        <aside class="pk-sidebar" id="pkSidebar">

            <a href="${ROOT}Dashboard/dashboard.html" class="pk-sidebar-brand">
                <img
                    src="${ROOT}assets/primary-key-logo.svg"
                    alt="PrimaryKey"
                    class="pk-sidebar-logo"
                />
            </a>

            <nav class="pk-sidebar-nav">
                ${buildNavHTML()}
            </nav>

            <div class="pk-sidebar-footer">

                <button class="pk-theme-toggle" id="pkThemeToggle" type="button">
                    <span class="pk-footer-icon">◐</span>

                    <span id="pkThemeLabel">
                        ${isLight ? "Light mode" : "Dark mode"}
                    </span>

                    <span class="pk-toggle-track">
                        <span class="pk-toggle-thumb"></span>
                    </span>
                </button>

                <button
                    class="pk-nav-item pk-logout"
                    id="pkLogout"
                    type="button"
                >
                    <span class="pk-nav-icon">⎋</span>
                    <span>Sign out</span>
                </button>

            </div>
        </aside>
    `;
}

    function mount() {
        injectBrandFont();

        const holder = document.createElement("div");
        holder.innerHTML = buildSidebarHTML();
        document.body.prepend(...holder.childNodes);
        document.body.classList.add("has-sidebar");

        const sidebar = document.getElementById("pkSidebar");
        const trigger = document.getElementById("pkTrigger");
        const overlay = document.getElementById("pkOverlay");
        const themeToggle = document.getElementById("pkThemeToggle");
        const themeLabel = document.getElementById("pkThemeLabel");
        const logoutBtn = document.getElementById("pkLogout");

        // Mobile open/close
        function openMenu() {
            sidebar.classList.add("pk-open");
            overlay.classList.add("pk-open");
        }
        function closeMenu() {
            sidebar.classList.remove("pk-open");
            overlay.classList.remove("pk-open");
        }
        trigger.addEventListener("click", openMenu);
        overlay.addEventListener("click", closeMenu);

        // Theme toggle
        themeToggle.addEventListener("click", function () {
            const current = document.documentElement.getAttribute("data-theme") || "dark";
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            themeLabel.textContent = next === "light" ? "Light mode" : "Dark mode";
        });

        // Logout
        logoutBtn.addEventListener("click", function () {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = `${ROOT}auth/registration.html`;
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount);
    } else {
        mount();
    }
})();