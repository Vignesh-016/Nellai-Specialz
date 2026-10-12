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
    initSearch();
  });

  window.NellaiShared = { lockScroll, closeDrawer };
})();
