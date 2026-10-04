/* Shared storefront interaction helpers. */
(function () {
  function lockScroll(lock) {
    document.body.classList.toggle("overflow-hidden", lock);
  }

  function closeDrawer(drawer, backdrop) {
    if (!drawer) return;
    drawer.classList.add("hidden");
    drawer.classList.add("translate-x-full");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.classList.add("hidden");
    lockScroll(false);
  }

  function initMobileNav() {
    const menu = document.getElementById("mobileMenuBtn");
    const close = document.getElementById("closeMobileNav");
    const drawer = document.getElementById("mobileDrawer") || document.getElementById("mobileMenuDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (!menu || !drawer) return;
    menu.addEventListener("click", () => {
      drawer.classList.remove("hidden");
      drawer.classList.remove("translate-x-full");
      drawer.setAttribute("aria-hidden", "false");
      backdrop?.classList.remove("hidden");
      lockScroll(true);
    });
    close?.addEventListener("click", () => closeDrawer(drawer, backdrop));
    drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeDrawer(drawer, backdrop)));
  }

  function initSearch() {
    const input = document.querySelector('input[type="search"]');
    if (!input) return;
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && input.value.trim()) {
        window.location.href = `${input.closest("form")?.action || "pages/shop.html"}?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initSearch();
  });

  window.NellaiShared = { lockScroll, closeDrawer };
})();
