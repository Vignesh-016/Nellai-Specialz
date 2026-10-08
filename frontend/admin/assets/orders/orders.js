(() => {
  const api = window.AdminApi;
  if (!api) return;

  const orderStatuses = ["NEW", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
  const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
  const statusClass = {
    NEW: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-purple-50 text-purple-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    PACKED: "bg-indigo-50 text-indigo-700",
    SHIPPED: "bg-cyan-50 text-cyan-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
  };
  const paymentClass = {
    PENDING: "bg-amber-50 text-amber-700",
    PAID: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-red-50 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-600",
  };
  let orders = [];

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const statusLabel = (value) => String(value || "—").replaceAll("_", " ");

  function showError(message) {
    const empty = document.getElementById("orders-empty");
    if (empty) {
      empty.textContent = message;
      empty.classList.remove("hidden");
    }
    window.AdminToast?.show(message, "error");
  }

  function updateStats() {
    document.getElementById("stat-total").textContent = String(orders.length);
    document.getElementById("stat-pending").textContent = String(
      orders.filter((order) => ["NEW", "PENDING", "CONFIRMED"].includes(String(order.order_status).toUpperCase())).length,
    );
    document.getElementById("stat-delivered").textContent = String(
      orders.filter((order) => String(order.order_status).toUpperCase() === "DELIVERED").length,
    );
    document.getElementById("stat-cancelled").textContent = String(
      orders.filter((order) => String(order.order_status).toUpperCase() === "CANCELLED").length,
    );
  }

  function renderOrders() {
    updateStats();
    const search = (document.getElementById("order-search")?.value || "").trim().toLowerCase();
    const statusFilter = (document.getElementById("order-status-filter")?.value || "").toUpperCase();
    const paymentFilter = (document.getElementById("order-payment-filter")?.value || "").toUpperCase();
    const tbody = document.getElementById("orders-tbody");
    const empty = document.getElementById("orders-empty");
    if (!tbody || !empty) return;

    const filtered = orders.filter((order) => {
      const matchesSearch = !search || [
        order.order_number,
        order.id,
        order.customer_name,
        order.email,
        order.phone,
      ].some((value) => String(value || "").toLowerCase().includes(search));
      return matchesSearch
        && (!statusFilter || String(order.order_status).toUpperCase() === statusFilter)
        && (!paymentFilter || String(order.payment_status).toUpperCase() === paymentFilter);
    });

    if (!filtered.length) {
      tbody.replaceChildren();
      empty.textContent = orders.length ? "No orders match your filters." : "No orders yet.";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    tbody.innerHTML = filtered.map((order) => {
      const status = String(order.order_status || "").toUpperCase();
      const payment = String(order.payment_status || "").toUpperCase();
      return `
        <tr class="hover:bg-[#fffcf7] transition">
          <td class="p-3 font-semibold text-[#32110d]">#${escapeHtml(order.order_number || order.id)}</td>
          <td class="p-3">${escapeHtml(order.customer_name || "Customer")}</td>
          <td class="p-3 text-[#7e5a43]">${escapeHtml(order.phone || "")}</td>
          <td class="p-3 text-xs text-[#7e5a43]">${escapeHtml(order.created_at || "")}</td>
          <td class="p-3">${Number(order.item_count || 0)} item(s)</td>
          <td class="p-3 font-semibold">${money(order.total_amount)}</td>
          <td class="p-3"><span class="rounded-full ${paymentClass[payment] || "bg-gray-100 text-gray-600"} px-3 py-1 text-xs font-semibold">${escapeHtml(statusLabel(payment))}</span></td>
          <td class="p-3"><span class="rounded-full ${statusClass[status] || "bg-gray-100 text-gray-600"} px-3 py-1 text-xs font-semibold">${escapeHtml(statusLabel(status))}</span></td>
          <td class="p-3 text-xs text-[#7e5a43]">${escapeHtml(order.delivery_type || "—")}</td>
          <td class="p-3 text-right"><button type="button" data-view-order="${Number(order.id)}" title="View order" class="grid h-8 w-8 place-items-center rounded-lg border border-[#e8e1da] text-xs text-[#594b45] hover:bg-[#f5eee8]">View</button></td>
        </tr>`;
    }).join("");
  }

  async function loadOrders() {
    try {
      const result = await api.request("orders/get.php");
      orders = Array.isArray(result) ? result : [];
      renderOrders();
    } catch (error) {
      orders = [];
      renderOrders();
      showError(error.message || "Unable to load orders.");
    }
  }

  async function viewOrder(id) {
    try {
      const order = await api.request(`orders/get.php?id=${encodeURIComponent(id)}`);
      const body = document.getElementById("order-view-body");
      if (!body) return;
      const status = String(order.order_status || "").toUpperCase();
      const payment = String(order.payment_status || "").toUpperCase();
      const items = Array.isArray(order.items) ? order.items : [];
      body.innerHTML = `
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div><h3 class="text-2xl font-bold text-[#32110d]">#${escapeHtml(order.order_number || order.id)}</h3><p class="mt-1 text-xs text-[#7e5a43]">${escapeHtml(order.created_at || "")}</p></div>
          <div class="flex gap-2"><span class="rounded-full ${statusClass[status] || "bg-gray-100 text-gray-600"} px-3 py-1 text-xs font-semibold">${escapeHtml(statusLabel(status))}</span><span class="rounded-full ${paymentClass[payment] || "bg-gray-100 text-gray-600"} px-3 py-1 text-xs font-semibold">${escapeHtml(statusLabel(payment))}</span></div>
        </div>
        <section class="rounded-xl border border-[#eadbc6] bg-[#fffcf7] p-4">
          <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-[#9b6b2c]">Customer &amp; delivery</h4>
          <div class="grid gap-3 text-sm sm:grid-cols-2">
            <p><span class="text-[#7e5a43]">Name</span><br><strong>${escapeHtml(order.customer_name || "—")}</strong></p>
            <p><span class="text-[#7e5a43]">Email</span><br><strong>${escapeHtml(order.customer_email || order.email || "—")}</strong></p>
            <p><span class="text-[#7e5a43]">Phone</span><br><strong>${escapeHtml(order.customer_phone || order.phone || "—")}</strong></p>
            <p><span class="text-[#7e5a43]">Payment method</span><br><strong>${escapeHtml(order.payment_method || "—")}</strong></p>
            <p class="sm:col-span-2"><span class="text-[#7e5a43]">Shipping address</span><br><strong>${escapeHtml(order.shipping_address || "—")}</strong></p>
            ${order.paid_at ? `<p><span class="text-[#7e5a43]">Paid at</span><br><strong>${escapeHtml(order.paid_at)}</strong></p>` : ""}
          </div>
        </section>
        <section class="rounded-xl border border-[#eadbc6] bg-[#fffcf7] p-4">
          <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-[#9b6b2c]">Products</h4>
          <div class="overflow-x-auto"><table class="w-full text-sm">
            <thead class="text-left text-xs uppercase text-[#9b6b2c]"><tr><th class="pb-2">Product</th><th class="pb-2">Variation</th><th class="pb-2">Qty</th><th class="pb-2">Price</th><th class="pb-2 text-right">Line total</th></tr></thead>
            <tbody class="divide-y divide-[#eadbc6]">${items.map((item) => `<tr><td class="py-2 font-semibold">${escapeHtml(item.product_name_snapshot || "Product")}</td><td>${escapeHtml(item.variation_snapshot || "—")}</td><td>${Number(item.quantity || 0)}</td><td>${money(item.unit_price)}</td><td class="text-right">${money(item.line_total)}</td></tr>`).join("")}</tbody>
          </table></div>
        </section>
        <section class="rounded-xl border border-[#eadbc6] bg-[#fffcf7] p-4">
          <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-[#9b6b2c]">Order total</h4>
          <div class="flex justify-between text-sm"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
          <div class="mt-2 flex justify-between text-sm"><span>Delivery</span><span>${money(order.delivery_charge)}</span></div>
          <div class="mt-2 flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>${money(order.total_amount)}</span></div>
        </section>
        <section class="rounded-xl border border-[#eadbc6] bg-[#fffcf7] p-4">
          <label for="order-status-change" class="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9b6b2c]">Update order status</label>
          <div class="flex gap-3"><select id="order-status-change" class="flex-1 rounded-xl border border-[#eadbc6] bg-white px-4 py-3 text-sm">${orderStatuses.map((value) => `<option value="${value}" ${status === value ? "selected" : ""}>${escapeHtml(statusLabel(value))}</option>`).join("")}</select><button type="button" data-save-order-status="${Number(order.id)}" class="rounded-xl bg-[#54170f] px-5 py-3 text-sm font-semibold text-white">Update</button></div>
        </section>`;

      window.AdminModal?.open("order-view-modal");
      body.querySelector("[data-save-order-status]")?.addEventListener("click", () => updateOrderStatus(Number(order.id)));
    } catch (error) {
      showError(error.message || "Unable to load order details.");
    }
  }

  async function updateOrderStatus(id) {
    const select = document.getElementById("order-status-change");
    if (!select) return;
    const button = document.querySelector("[data-save-order-status]");
    if (button) button.disabled = true;
    try {
      await api.request(`orders/put.php?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ order_status: select.value }),
      });
      await loadOrders();
      await viewOrder(id);
      window.AdminToast?.show("Order status updated.");
    } catch (error) {
      window.AdminToast?.show(error.message || "Unable to update the order.", "error");
      if (button) button.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("order-search")?.addEventListener("input", renderOrders);
    document.getElementById("order-status-filter")?.addEventListener("change", renderOrders);
    document.getElementById("order-payment-filter")?.addEventListener("change", renderOrders);
    document.getElementById("orders-tbody")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-view-order]");
      if (button) viewOrder(Number(button.dataset.viewOrder));
    });
    document.getElementById("order-status-filter")?.querySelectorAll("option:not([value=''])")
      .forEach((option) => { option.value = option.value.toUpperCase(); });
    document.getElementById("order-payment-filter")?.querySelectorAll("option:not([value=''])")
      .forEach((option) => { option.value = option.value.toUpperCase(); });
    loadOrders();
  });

  window.AdminOrders = {
    load: loadOrders,
    detail: viewOrder,
    update: updateOrderStatus,
  };
})();
