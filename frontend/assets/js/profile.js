document.addEventListener("DOMContentLoaded", async () => {
  const panel = document.getElementById("profile");
  const menu = [...document.querySelectorAll("[data-view]")];
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const addressLine1 = (address) => address.address_line1 ?? address.address_line_1 ?? "";
  const postalCode = (address) => address.postal_code ?? address.pincode ?? "";
  let customer;
  let viewSequence = 0;

  customer = await window.NellaiCustomerSession.requireCustomer();
  if (!customer) return;

  function showError(error) {
    const status = panel.querySelector("[data-profile-message]");
    if (!status) return;
    status.hidden = false;
    status.textContent = error.message || "The request could not be completed.";
  }

  function showMessage(message) {
    const status = panel.querySelector("[data-profile-message]");
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.className = "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700";
  }

  function profileView() {
    const parts = (customer.name || "").trim().split(/\s+/);
    panel.innerHTML = `
      <h2 class="font-serif text-2xl font-bold text-[#321307]">Personal Details</h2>
      <p class="mt-2 text-sm text-[#806B58]">Keep your contact details up to date.</p>
      <p data-profile-message hidden class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></p>
      <form id="profile-form" class="mt-8 grid gap-5 sm:grid-cols-2">
        <label class="text-sm font-semibold text-[#321307]">First name<input id="profile-first" class="mt-2 h-12 w-full rounded-lg border border-[#EADBC1] bg-[#FFFBF5] px-4 text-[#321307] outline-none focus:border-[#8C1C13]" value="${escapeHtml(parts[0] || "")}" required></label>
        <label class="text-sm font-semibold text-[#321307]">Last name<input id="profile-last" class="mt-2 h-12 w-full rounded-lg border border-[#EADBC1] bg-[#FFFBF5] px-4 text-[#321307] outline-none focus:border-[#8C1C13]" value="${escapeHtml(parts.slice(1).join(" "))}"></label>
        <label class="text-sm font-semibold text-[#321307]">Email<input readonly class="mt-2 h-12 w-full rounded-lg border border-[#EADBC1] bg-[#FBF5E9] px-4 text-[#806B58] opacity-80" value="${escapeHtml(customer.email || "")}"></label>
        <label class="text-sm font-semibold text-[#321307]">Phone<input id="profile-phone" class="mt-2 h-12 w-full rounded-lg border border-[#EADBC1] bg-[#FFFBF5] px-4 text-[#321307] outline-none focus:border-[#8C1C13]" value="${escapeHtml(customer.phone || "")}"></label>
        <button class="rounded-full bg-[#8C1C13] px-8 py-3 font-bold text-[#FFF8EF] shadow-md shadow-[#8C1C13]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7A120A] sm:col-span-2 sm:w-fit cursor-pointer">Save changes</button>
      </form>`;
    panel.querySelector("#profile-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = event.currentTarget.querySelector("button");
      button.disabled = true;
      try {
        customer = await window.NellaiApi.request("customer/profile.php", {
          method: "PUT",
          credentials: "include",
          body: JSON.stringify({
            name: `${panel.querySelector("#profile-first").value.trim()} ${panel.querySelector("#profile-last").value.trim()}`.trim(),
            phone: panel.querySelector("#profile-phone").value.trim(),
          }),
        });
        showMessage("Profile details saved.");
      } catch (error) {
        showError(error);
      } finally {
        button.disabled = false;
      }
    });
  }

  async function ordersView(sequence) {
    panel.innerHTML = `
      <h2 class="font-serif text-2xl font-bold text-[#321307]">My Orders</h2>
      <p class="mt-2 text-sm text-[#806B58]">Track your purchases and order status.</p>
      <p data-profile-message hidden class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></p>
      <div data-orders-list class="mt-6 space-y-4">Loading orders…</div>`;
    try {
      const rows = await window.NellaiApi.request("customer-orders/get.php", { credentials: "include" });
      if (sequence !== viewSequence) return;
      const list = panel.querySelector("[data-orders-list]");
      if (!rows.length) {
        list.innerHTML = '<p class="rounded-xl border border-dashed border-[#D9B86C] bg-[#FFFBF5] p-6 text-sm text-[#806B58]">You haven\'t placed any orders yet.</p>';
        return;
      }
      list.innerHTML = rows.map((order) => `
        <article class="rounded-xl border border-[#EADBC1] bg-[#FFFBF5] p-5 shadow-xs">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <strong class="text-[#321307]">Order #${escapeHtml(order.order_number || order.id)}</strong>
              <p class="mt-1 text-sm text-[#806B58]">${escapeHtml(order.created_at || "")} · ${Number(order.item_count || 0)} item(s)</p>
            </div>
            <div class="text-right">
              <strong class="text-base text-[#8C1C13]">${money(order.total_amount)}</strong>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-[#806B58]">${escapeHtml(order.order_status || "")} · ${escapeHtml(order.payment_status || "")}</p>
            </div>
          </div>
          <p class="mt-2 text-sm text-[#806B58]">Payment: ${escapeHtml(order.payment_method || "—")}</p>
          <button type="button" data-order-detail="${Number(order.id)}" class="mt-4 rounded-full border border-[#8C1C13] px-5 py-2 text-xs font-bold text-[#8C1C13] transition hover:bg-[#8C1C13] hover:text-[#FFF8EF]">View Details</button>
        </article>`).join("");
      list.querySelectorAll("[data-order-detail]").forEach((button) => {
        button.addEventListener("click", () => showOrderDetails(Number(button.dataset.orderDetail)));
      });
    } catch (error) {
      if (sequence === viewSequence) showError(error);
    }
  }

  async function showOrderDetails(id) {
    try {
      const order = await window.NellaiApi.request(`customer-orders/get.php?id=${id}`, { credentials: "include" });
      document.getElementById("orderDetailModal")?.remove();
      const modal = document.createElement("div");
      modal.id = "orderDetailModal";
      modal.className = "fixed inset-0 z-[80] flex items-center justify-center bg-[#321307]/50 backdrop-blur-xs p-4";
      modal.innerHTML = `
        <section role="dialog" aria-modal="true" aria-labelledby="order-detail-title" class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#EADBC1] bg-[#FFFBF5] p-6 shadow-2xl sm:p-8">
          <div class="flex items-start justify-between gap-4">
            <div><h2 id="order-detail-title" class="font-serif text-2xl font-bold text-[#321307]">Order #${escapeHtml(order.order_number || order.id)}</h2><p class="mt-1 text-sm text-[#806B58]">${escapeHtml(order.created_at || "")}</p></div>
            <button type="button" data-close-order-details aria-label="Close" class="rounded-lg text-2xl text-[#8C1C13] hover:text-[#7A120A] cursor-pointer">×</button>
          </div>
          <div class="mt-5 space-y-4 text-sm text-[#321307]">
            <p><strong class="text-[#321307]">Order status:</strong> <span class="rounded-full bg-[#D9B86C]/20 px-3 py-1 text-xs font-bold text-[#8C1C13]">${escapeHtml(order.order_status)}</span></p>
            <p><strong>Payment:</strong> ${escapeHtml(order.payment_method || "—")} · ${escapeHtml(order.payment_status || "—")}</p>
            <div class="rounded-xl border border-[#EADBC1] bg-white p-4"><strong>Shipping address</strong><p class="mt-1 whitespace-pre-line text-sm text-[#806B58]">${escapeHtml(order.shipping_address || "")}</p></div>
            <div class="overflow-x-auto rounded-xl border border-[#EADBC1] bg-white p-4"><table class="w-full text-left text-sm"><thead><tr class="border-b border-[#EADBC1] text-[#806B58]"><th class="pb-2">Item</th><th>Variation</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead>
              <tbody>${(order.items || []).map((item) => `<tr class="border-t border-[#EADBC1]"><td class="py-2.5 font-medium text-[#321307]">${escapeHtml(item.product_name_snapshot || item.product_name || "")}</td><td class="text-[#806B58]">${escapeHtml(item.variation_snapshot || "—")}</td><td class="text-[#321307]">${Number(item.quantity || 0)}</td><td class="text-[#806B58]">${money(item.unit_price)}</td><td class="font-bold text-[#8C1C13]">${money(item.line_total)}</td></tr>`).join("")}</tbody>
            </table></div>
            <p class="border-t border-[#EADBC1] pt-4 text-right text-xl font-bold text-[#8C1C13]">Total: ${money(order.total_amount)}</p>
          </div>
        </section>`;
      modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target.closest("[data-close-order-details]")) modal.remove();
      });
      document.body.appendChild(modal);
    } catch (error) {
      showError(error);
    }
  }

  function addressForm(address = {}) {
    const editing = Boolean(address.id);
    const addressId = Number(address.id || 0);
    return `
      <form data-address-form="${addressId}" class="mt-4 grid gap-4 rounded-xl border border-[#EADBC1] bg-[#FFFBF5] p-5 sm:grid-cols-2 shadow-xs">
        <label class="text-sm font-semibold text-[#321307]">Label<input name="label" value="${escapeHtml(address.label || "Home")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="text-sm font-semibold text-[#321307]">Full name<input name="full_name" value="${escapeHtml(address.full_name || "")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="text-sm font-semibold text-[#321307]">Phone<input name="phone" value="${escapeHtml(address.phone || "")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="text-sm font-semibold text-[#321307]">Country<input name="country" value="${escapeHtml(address.country || "India")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]"></label>
        <label class="text-sm font-semibold text-[#321307] sm:col-span-2">Address line 1<input name="address_line1" value="${escapeHtml(addressLine1(address))}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="text-sm font-semibold text-[#321307] sm:col-span-2">Address line 2<input name="address_line2" value="${escapeHtml(address.address_line2 || "")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]"></label>
        <label class="text-sm font-semibold text-[#321307]">City<input name="city" value="${escapeHtml(address.city || "")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="text-sm font-semibold text-[#321307]">State<input name="state" value="${escapeHtml(address.state || "")}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="text-sm font-semibold text-[#321307]">Postal code<input name="postal_code" value="${escapeHtml(postalCode(address))}" class="mt-1.5 h-11 w-full rounded-lg border border-[#EADBC1] bg-white px-3 text-[#321307] outline-none focus:border-[#8C1C13]" required></label>
        <label class="flex items-center gap-2 self-end text-sm text-[#806B58]"><input type="checkbox" name="is_default" value="1" ${Number(address.is_default) ? "checked" : ""} class="accent-[#8C1C13]"> Set as default</label>
        <div class="flex gap-3 sm:col-span-2 mt-2"><button class="rounded-full bg-[#8C1C13] px-6 py-2.5 text-sm font-bold text-[#FFF8EF] shadow-xs hover:bg-[#7A120A]">${editing ? "Save address" : "Add address"}</button><button type="button" data-cancel-address class="rounded-full border border-[#EADBC1] bg-white px-6 py-2.5 text-sm font-semibold text-[#806B58] hover:bg-[#FFF8EF]">Cancel</button></div>
      </form>`;
  }

  async function addressesView(sequence) {
    panel.innerHTML = `
      <h2 class="font-serif text-2xl font-bold text-[#321307]">Saved Addresses</h2>
      <p class="mt-2 text-sm text-[#806B58]">Manage the delivery addresses used by checkout.</p>
      <p data-profile-message hidden class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></p>
      <div class="mt-6 flex justify-end"><button id="addAddressButton" type="button" class="rounded-full bg-[#8C1C13] px-6 py-2.5 text-sm font-bold text-[#FFF8EF] shadow-md shadow-[#8C1C13]/20 hover:bg-[#7A120A]">+ Add Address</button></div>
      <div id="addressFormSlot"></div>
      <div data-address-list class="mt-4 space-y-3">Loading addresses…</div>`;

    const list = panel.querySelector("[data-address-list]");
    const formSlot = panel.querySelector("#addressFormSlot");
    panel.querySelector("#addAddressButton").addEventListener("click", () => {
      formSlot.innerHTML = addressForm();
      bindAddressForm(formSlot.querySelector("form"));
    });

    try {
      const addresses = await window.NellaiApi.request("customer/addresses/get.php", { credentials: "include" });
      if (sequence !== viewSequence) return;
      if (!addresses.length) {
        list.innerHTML = '<p class="rounded-xl border border-dashed border-[#D9B86C] bg-[#FFFBF5] p-5 text-sm text-[#806B58]">No saved addresses yet. Add your first delivery address.</p>';
        return;
      }
      list.innerHTML = addresses.map((address) => `
        <article class="rounded-xl border border-[#EADBC1] bg-white p-5 shadow-xs">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2"><strong class="text-[#321307]">${escapeHtml(address.label || "Address")}</strong>${Number(address.is_default) ? '<span class="rounded-full border border-[#D9B86C] bg-[#FFFBF5] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#8C1C13]">Default</span>' : ""}</div>
              <p class="mt-2 text-sm leading-relaxed text-[#806B58]"><strong class="text-[#321307]">${escapeHtml(address.full_name)}</strong><br>${escapeHtml(address.phone)}<br>${escapeHtml(addressLine1(address))}${address.address_line2 ? `, ${escapeHtml(address.address_line2)}` : ""}<br>${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(postalCode(address))}<br>${escapeHtml(address.country || "India")}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" data-edit-address="${Number(address.id)}" class="rounded-full border border-[#EADBC1] bg-[#FFFBF5] px-4 py-1.5 text-xs font-bold text-[#321307] hover:bg-white">Edit</button>
              <button type="button" data-delete-address="${Number(address.id)}" class="rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">Delete</button>
              ${Number(address.is_default) ? "" : `<button type="button" data-default-address="${Number(address.id)}" class="rounded-full border border-[#8C1C13] px-4 py-1.5 text-xs font-bold text-[#8C1C13] hover:bg-[#8C1C13] hover:text-[#FFF8EF]">Set Default</button>`}
            </div>
          </div>
        </article>`).join("");

      list.querySelectorAll("[data-edit-address]").forEach((button) => {
        button.addEventListener("click", () => {
          const address = addresses.find((item) => Number(item.id) === Number(button.dataset.editAddress));
          if (!address) return;
          formSlot.innerHTML = addressForm(address);
          bindAddressForm(formSlot.querySelector("form"));
          formSlot.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
      list.querySelectorAll("[data-delete-address]").forEach((button) => {
        button.addEventListener("click", async () => {
          if (!window.confirm("Delete this saved address?")) return;
          try {
            await window.NellaiApi.request(`customer/addresses/delete.php?id=${button.dataset.deleteAddress}`, {
              method: "DELETE",
              credentials: "include",
            });
            await addressesView(sequence);
          } catch (error) {
            showError(error);
          }
        });
      });
      list.querySelectorAll("[data-default-address]").forEach((button) => {
        button.addEventListener("click", async () => {
          const address = addresses.find((item) => Number(item.id) === Number(button.dataset.defaultAddress));
          if (!address) return;
          try {
            await saveAddress(address.id, address, true);
            await addressesView(sequence);
          } catch (error) {
            showError(error);
          }
        });
      });
    } catch (error) {
      if (sequence === viewSequence) throw error;
    }
  }

  async function saveAddress(id, address, isDefault) {
    const response = await window.NellaiApi.request(`customer/addresses/put.php?id=${id}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({
        label: address.label,
        full_name: address.full_name,
        phone: address.phone,
        address_line1: addressLine1(address),
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
        postal_code: postalCode(address),
        country: address.country || "India",
        is_default: isDefault ? 1 : 0,
      }),
    });
    return response;
  }

  function bindAddressForm(form) {
    if (!form) return;
    const formSequence = viewSequence;
    form.querySelector("[data-cancel-address]")?.addEventListener("click", () => form.remove());
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.is_default = formData.has("is_default") ? 1 : 0;
      const id = Number(form.dataset.addressForm);
      const button = form.querySelector("button[type='submit'], button:not([type])");
      if (button) button.disabled = true;
      try {
        if (id) {
          await window.NellaiApi.request(`customer/addresses/put.php?id=${id}`, {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify(payload),
          });
        } else {
          await window.NellaiApi.request("customer/addresses/post.php", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(payload),
          });
        }
        if (formSequence !== viewSequence || location.hash.slice(1) !== "addresses") return;
        await addressesView(formSequence);
        showMessage("Address saved.");
      } catch (error) {
        if (button) button.disabled = false;
        showError(error);
      }
    });
  }

  async function show(view) {
    const sequence = ++viewSequence;
    menu.forEach((item) => {
      const active = item.dataset.view === view;
      item.classList.toggle("bg-[#8C1C13]", active);
      item.classList.toggle("text-[#FFF8EF]", active);
      item.classList.toggle("font-bold", active);
      item.classList.toggle("shadow-sm", active);
    });
    try {
      if (view === "profile") profileView();
      else if (view === "orders") await ordersView(sequence);
      else if (view === "addresses") await addressesView(sequence);
      else if (view === "logout") {
        await window.NellaiCustomerSession.logoutCustomer();
        location.replace("index.html");
      }
    } catch (error) {
      showError(error);
    }
  }

  menu.forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    const view = item.dataset.view;
    if (view === "logout") show(view);
    else if (location.hash.slice(1) === view) show(view);
    else location.hash = view;
  }));
  window.addEventListener("hashchange", () => show(location.hash.slice(1) || "profile"));
  show(location.hash.slice(1) || "profile");
});
