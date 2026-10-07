(() => {
  const page = document.body.dataset.adminPage || "dashboard";
  const title = document.body.dataset.adminTitle || "Dashboard";
  const shell = document.querySelector("[data-admin-shell]");
  const template = document.querySelector("#admin-page-content");

  if (!shell || !template) {
    return;
  }

  const navigation = [
    {
      group: "Overview",
      items: [["dashboard", "Dashboard", "index.html", "▦"]],
    },
    {
      group: "Catalogue",
      items: [
        ["products", "Products", "products.html", "□"],
        ["categories", "Categories", "categories.html", "◇"],
        ["subcategories", "Sub Categories", "subcategories.html", "◈"],
        ["combos", "Combo Products", "combos.html", "⊞"],
        ["inventory", "Inventory", "inventory.html", "▤"],
      ],
    },
    {
      group: "Marketing",
      items: [
        ["offers", "Offers", "offers.html", "%"],
        ["coupons", "Coupons", "coupons.html", "✂"],
      ],
    },
    {
      group: "Content",
      items: [
        ["blog", "Blog", "blog.html", "✎"],
        ["enquiries", "Enquiries", "enquiries.html", "✉"],
      ],
    },
  ];

  const navigationMarkup = navigation
    .map(
      ({ group, items }) => `
        <div class="space-y-2">
          <p class="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a89387]">${group}</p>
          <div class="space-y-1">
            ${items
              .map(([key, label, href, icon]) => {
                const active = page === key;
                const activeClasses = active
                  ? "bg-[#6e1f15] text-white shadow-[0_8px_18px_rgba(90,22,15,0.18)]"
                  : "text-[#594b45] hover:bg-[#f5eee8]";
                const iconClasses = active
                  ? "bg-white/15 text-[#f5c56b]"
                  : "bg-[#f5eee8] text-[#8e6c55]";

                return [
                  '<a href="',
                  href,
                  '" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ',
                  activeClasses,
                  '">',
                  '<span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base ',
                  iconClasses,
                  '">',
                  icon,
                  "</span><span>",
                  label,
                  "</span></a>",
                ].join("");
              })
              .join("")}
          </div>
        </div>`,
    )
    .join("");

  shell.innerHTML = `
    <div id="admin-overlay" class="fixed inset-0 z-30 hidden bg-[#24120f]/40 lg:hidden"></div>

    <aside id="admin-sidebar" class="fixed inset-y-0 left-0 z-40 flex w-[260px] -translate-x-full flex-col border-r border-[#e8e1da] bg-white transition-transform duration-200 lg:translate-x-0">
      <div class="flex h-[76px] items-center gap-3 border-b border-[#eee8e2] px-5">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-[#5a160f] text-lg font-bold text-[#f5c56b]">N</div>
        <div>
          <p class="text-[15px] font-bold tracking-tight text-[#32110d]">Nellai Specialz</p>
          <p class="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b88932]">Store admin</p>
        </div>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto p-4" aria-label="Admin navigation">
        ${navigationMarkup}
      </nav>

      <div class="border-t border-[#eee8e2] p-4">
        <a href="../index.html" class="flex items-center gap-3 rounded-xl border border-[#e8e1da] px-3 py-3 text-sm font-semibold text-[#594b45] transition hover:bg-[#f8f6f3]">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-[#f5eee8] text-[#8e6c55]">↗</span>
          <span>View storefront</span>
        </a>
        <div class="mt-3 flex items-center gap-3 rounded-xl bg-[#f8f6f3] p-3">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-[#5a160f] text-xs font-bold text-[#f5c56b]">AU</span>
          <div class="min-w-0"><p class="truncate text-xs font-bold text-[#32110d]">Admin User</p><p class="truncate text-[11px] text-[#736962]">Store manager</p></div>
        </div>
      </div>
    </aside>

    <div class="min-h-screen bg-[#f7f6f3] lg:pl-[260px]">
      <header class="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-4 border-b border-[#e8e1da] bg-white/95 px-4 backdrop-blur sm:px-8">
        <div class="flex min-w-0 items-center gap-3">
          <button id="admin-menu" type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#e8e1da] text-lg text-[#5a160f] lg:hidden" aria-label="Open admin navigation">☰</button>
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b88932]">Store management</p>
            <h1 class="truncate text-xl font-semibold tracking-tight text-[#251a16] sm:text-2xl">${title}</h1>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <div class="hidden text-right sm:block"><p class="text-sm font-semibold text-[#251a16]">Admin User</p><p class="text-xs text-[#736962]">Store manager</p></div>
          <span class="grid h-10 w-10 place-items-center rounded-full bg-[#5a160f] text-xs font-bold text-[#f5c56b]">AU</span>
        </div>
      </header>

      <div class="px-4 pt-3 sm:px-8">
        <div class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <span class="text-base">⚠</span>
          <span><strong>Demo UI</strong> — This admin panel is a frontend prototype. Data shown is sample data and changes are not persisted.</span>
        </div>
      </div>

      <main class="min-h-[calc(100vh-76px)] p-4 sm:p-8">
        <div class="mx-auto max-w-[1400px]">
          <div data-admin-content></div>
        </div>
      </main>
    </div>`;

  document
    .querySelector("[data-admin-content]")
    .appendChild(template.content.cloneNode(true));

  const sidebar = document.querySelector("#admin-sidebar");
  const overlay = document.querySelector("#admin-overlay");
  const menuButton = document.querySelector("#admin-menu");

  const toggleSidebar = (open) => {
    sidebar.classList.toggle("-translate-x-full", !open);
    overlay.classList.toggle("hidden", !open);
  };

  menuButton?.addEventListener("click", () => toggleSidebar(true));
  overlay?.addEventListener("click", () => toggleSidebar(false));

  /* ─── Reusable Modal System ─── */
  window.AdminModal = {
    open(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      requestAnimationFrame(() => {
        modal
          .querySelector("[data-modal-box]")
          ?.classList.remove("scale-95", "opacity-0");
        modal
          .querySelector("[data-modal-box]")
          ?.classList.add("scale-100", "opacity-100");
      });
    },
    close(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      const box = modal.querySelector("[data-modal-box]");
      box?.classList.add("scale-95", "opacity-0");
      box?.classList.remove("scale-100", "opacity-100");
      setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }, 200);
    },
  };

  /* ─── Toast Notification System ─── */
  window.AdminToast = {
    show(message, type = "success") {
      const colors = {
        success: "bg-emerald-600",
        error: "bg-red-600",
        info: "bg-[#5a160f]",
      };
      const toast = document.createElement("div");
      toast.className = `fixed bottom-6 right-6 z-[100] ${colors[type] || colors.info} text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transform translate-y-4 opacity-0 transition-all duration-300`;
      toast.textContent = message;
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove("translate-y-4", "opacity-0");
      });
      setTimeout(() => {
        toast.classList.add("translate-y-4", "opacity-0");
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    },
  };

  /* ─── Confirm Delete utility ─── */
  window.AdminConfirm = {
    show(message, onConfirm) {
      const existing = document.getElementById("admin-confirm-dialog");
      if (existing) existing.remove();

      const dialog = document.createElement("div");
      dialog.id = "admin-confirm-dialog";
      dialog.className =
        "fixed inset-0 z-[90] flex items-center justify-center bg-[#24120f]/50 p-4";
      dialog.innerHTML = `
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" data-modal-box>
          <h3 class="text-lg font-bold text-[#32110d]">Confirm</h3>
          <p class="mt-2 text-sm text-[#7e5a43]">${message}</p>
          <div class="mt-5 flex gap-3 justify-end">
            <button id="confirm-cancel" class="rounded-xl border border-[#e8e1da] px-4 py-2.5 text-sm font-semibold text-[#594b45] hover:bg-[#f8f6f3]">Cancel</button>
            <button id="confirm-ok" class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
          </div>
        </div>`;
      document.body.appendChild(dialog);
      document.getElementById("confirm-cancel").onclick = () => dialog.remove();
      document.getElementById("confirm-ok").onclick = () => {
        dialog.remove();
        if (onConfirm) onConfirm();
      };
    },
  };
})();
