function initTabSwitcher() {
    const tabs = document.querySelectorAll(".tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}

function initBottomNav() {
    const navItems = document.querySelectorAll(".nav-item");
    if (!navItems.length) return;

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            navItems.forEach((nav) => nav.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

function initInstallPrompt() {
    let deferredPrompt = null;
    const installBanner = document.getElementById("install-banner");
    const installBtn = document.getElementById("install-btn");
    const closeBtn = document.getElementById("close-install");

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/service-worker.js").catch(() => {});
        });
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        if (installBanner) installBanner.style.display = "block";
    });

    if (installBtn) {
        installBtn.addEventListener("click", async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (installBanner) installBanner.style.display = "none";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (installBanner) installBanner.style.display = "none";
        });
    }

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        if (installBanner) installBanner.style.display = "none";
    });
}

function initLottie() {
    if (!window.lottie) return;

    const targets = [
        { id: "lottie-loading", path: "lottie/antui_loading.json" },
        { id: "lottie-refresh-blue", path: "lottie/antui_refresh_blue.json" },
        { id: "lottie-refresh-white", path: "lottie/antui_refresh_white.json" },
    ];

    targets.forEach(({ id, path }) => {
        const container = document.getElementById(id);
        if (!container) return;
        window.lottie.loadAnimation({
            container,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path,
        });
    });
}

function init() {
    initTabSwitcher();
    initBottomNav();
    initInstallPrompt();
    initLottie();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
