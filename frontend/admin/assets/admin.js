(() => {
  const page = document.body.dataset.adminPage || "dashboard";
  const title = document.body.dataset.adminTitle || "Dashboard";
  const shell = document.querySelector("[data-admin-shell]");
  const template = document.querySelector("#admin-page-content");

  if (!shell || !template) return;

  const navigation = [
    ["dashboard", "Dashboard", "index.html", "▦"],
    ["products", "Products", "products.html", "▣"],
    ["categories", "Categories", "categories.html", "◈"],
    ["offers", "Offers", "offers.html", "%"],
    ["blog", "Blog", "blog.html", "✎"],
    ["enquiries", "Enquiries", "enquiries.html", "✉"],
  ];

  shell.innerHTML = `
    <div id="admin-overlay" class="fixed inset-0 z-30 hidden bg-black/40 lg:hidden"></div>
    <aside id="admin-sidebar" class="fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[#eadbc6] bg-[#fffaf2] transition-transform duration-200 lg:translate-x-0">
      <div class="flex h-20 items-center gap-3 border-b border-[#eadbc6] px-6">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-[#54170f] text-xl text-[#f5c56b]">✦</div>
        <div><p class="font-serif text-lg font-bold text-[#3a110d]">Nellai Specialz</p><p class="text-xs uppercase tracking-[0.18em] text-[#9b6b2c]">Admin panel</p></div>
      </div>
      <nav class="flex-1 space-y-1 p-4" aria-label="Admin navigation">
        ${navigation.map(([key, label, href, icon]) => `<a href="${href}" class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${page === key ? "bg-[#54170f] text-white shadow-sm" : "text-[#5f4031] hover:bg-[#f3e7d5]"}"><span class="grid h-7 w-7 place-items-center rounded-lg ${page === key ? "bg-white/15" : "bg-[#f3e7d5] text-[#9b6b2c]"}">${icon}</span>${label}</a>`).join("")}
      </nav>
      <a href="../frontend/index.html" class="m-4 flex items-center gap-3 rounded-xl border border-[#eadbc6] px-4 py-3 text-sm font-semibold text-[#5f4031] hover:bg-[#f3e7d5]">↗ View storefront</a>
    </aside>
    <div class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#eadbc6] bg-[#fffaf2]/95 px-4 backdrop-blur sm:px-8">
        <div class="flex items-center gap-4"><button id="admin-menu" class="rounded-lg border border-[#eadbc6] px-3 py-2 text-[#54170f] lg:hidden" aria-label="Open menu">☰</button><div><p class="text-xs uppercase tracking-[0.2em] text-[#9b6b2c]">Management</p><h1 class="font-serif text-2xl font-bold text-[#3a110d]">${title}</h1></div></div>
        <div class="flex items-center gap-3"><span class="hidden text-right sm:block"><span class="block text-sm font-semibold text-[#3a110d]">Admin User</span><span class="block text-xs text-[#9b6b2c]">Store manager</span></span><span class="grid h-10 w-10 place-items-center rounded-full bg-[#54170f] font-semibold text-[#f5c56b]">AU</span></div>
      </header>
      <main class="min-h-[calc(100vh-5rem)] bg-[#f8f1e7] p-4 sm:p-8"><div class="mx-auto max-w-7xl"><div data-admin-content></div></div></main>
    </div>`;

  document.querySelector("[data-admin-content]").appendChild(template.content.cloneNode(true));

  const sidebar = document.querySelector("#admin-sidebar");
  const overlay = document.querySelector("#admin-overlay");
  const toggle = (open) => { sidebar.classList.toggle("-translate-x-full", !open); overlay.classList.toggle("hidden", !open); };
  document.querySelector("#admin-menu")?.addEventListener("click", () => toggle(true));
  overlay?.addEventListener("click", () => toggle(false));
})();
