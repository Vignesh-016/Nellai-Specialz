/* Account menu and account path handling. */
(function () {
  function ensureAccountModal() {
    if (document.getElementById("accountModal")) return;
    const base = window.location.pathname.includes("/pages/") ? "../" : "./";
    const modal = document.createElement("div");
    modal.id = "accountModal";
    modal.className = "fixed inset-0 z-[70] hidden items-start justify-end bg-[#321307]/35 p-4 sm:p-6";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `<div class="mt-14 w-full max-w-xs rounded-2xl border border-[#E7DDD1] bg-white p-5 shadow-2xl" role="dialog" aria-modal="true"><div class="flex items-center justify-between"><h2 class="font-serif text-2xl font-semibold text-[#321307]">Welcome</h2><button type="button" data-close-account class="grid h-9 w-9 place-items-center rounded-full text-lg text-[#4d190e]">×</button></div><div class="mt-5 grid gap-2"><a href="${base}login.html" class="rounded-lg bg-[#4d190e] px-4 py-3 text-center text-sm font-semibold text-white">Sign In</a><a href="${base}register.html" class="rounded-lg border border-[#D9B86C] px-4 py-3 text-center text-sm font-semibold text-[#4d190e]">Create Account</a><a href="${base}profile.html" class="rounded-lg px-4 py-3 text-center text-sm font-semibold text-[#74685F]">View Profile</a></div></div>`;
    document.body.appendChild(modal);
  }

  function closeAccount() {
    const modal = document.getElementById("accountModal");
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureAccountModal();
    const modal = document.getElementById("accountModal");
    if (window.NellaiApi && modal) {
      window.NellaiApi.request('customer-auth/me.php', { method: 'GET', credentials: 'include' }).then((customer) => {
        const firstName = (customer.name || '').trim().split(/\s+/)[0] || 'Customer';
        modal.querySelector('[role="dialog"]').innerHTML = `<div class="flex items-center justify-between"><div><h2 class="font-serif text-2xl font-semibold text-[#321307]">Welcome, ${firstName}</h2><p class="mt-1 break-all text-xs text-[#74685F]">${customer.email || ''}</p></div><button type="button" data-close-account class="grid h-9 w-9 place-items-center rounded-full text-lg text-[#4d190e]">×</button></div><div class="mt-5 grid gap-2"><a href="profile.html" class="rounded-lg bg-[#4d190e] px-4 py-3 text-center text-sm font-semibold text-white">View Profile</a><a href="profile.html#orders" class="rounded-lg border border-[#D9B86C] px-4 py-3 text-center text-sm font-semibold text-[#4d190e]">My Orders</a><button type="button" data-customer-logout class="rounded-lg px-4 py-3 text-sm font-semibold text-[#74685F]">Logout</button></div>`;
        modal.querySelector('[data-close-account]')?.addEventListener('click', closeAccount);
        modal.querySelector('[data-customer-logout]')?.addEventListener('click', async () => { await window.NellaiApi.request('customer-auth/logout.php', { method: 'POST', credentials: 'include' }); location.href = 'index.html'; });
      }).catch(() => {});
    }
    document.querySelectorAll('[data-open-account], [aria-label="Account"]').forEach((button) => button.addEventListener("click", (event) => {
      event.preventDefault();
      modal?.classList.remove("hidden");
      modal?.classList.add("flex");
    }));
    modal?.querySelector("[data-close-account]")?.addEventListener("click", closeAccount);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAccount(); });
  });

  window.NellaiAccount = { close: closeAccount };
})();
