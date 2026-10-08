(() => {
  const api = window.AdminApi;
  if (!api) return;

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const statusClass = {
    NEW: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-purple-50 text-purple-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    PACKED: "bg-indigo-50 text-indigo-700",
    SHIPPED: "bg-cyan-50 text-cyan-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const body = document.getElementById("recent-orders-body");
    if (!body) return;
    body.hidden = false;
    body.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-sm text-[#7e5a43]">Loading orders…</td></tr>';

    try {
      const data = await api.request("dashboard/get.php");
      const total = document.getElementById("stat-orders");
      const pending = document.getElementById("stat-pending");
      if (total) total.textContent = String(data.orders ?? 0);
      if (pending) pending.textContent = String(data.pending_orders ?? 0);
      for (const [id, value] of [["stat-products", data.total_products], ["stat-active-products", data.active_products], ["stat-categories", data.categories], ["stat-low-stock", data.low_stock_products], ["stat-coupons", data.active_coupons], ["stat-enquiries", data.new_enquiries]]) {
        const node = document.getElementById(id); if (node) node.textContent = String(value ?? 0);
      }
      const lowStock = document.getElementById("low-stock-body");
      if (lowStock) lowStock.innerHTML = (data.low_stock_items || []).length ? data.low_stock_items.map((item) => `<div class="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-4"><div><p class="font-semibold text-[#32110d]">${escapeHtml(item.name)}</p><p class="text-xs text-[#7e5a43]">Stock alert</p></div><div class="text-right"><p class="text-lg font-bold text-red-600">${Number(item.stock_quantity || 0)}</p><span class="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">${Number(item.stock_quantity || 0) <= 0 ? 'Out of stock' : 'Low stock'}</span></div></div>`).join("") : '<p class="py-4 text-sm text-[#7e5a43]">No low-stock products.</p>';
      const enquiriesBody = document.getElementById("recent-enquiries-body");
      if (enquiriesBody) {
        const enquiries = Array.isArray(data.recent_enquiries) ? data.recent_enquiries : [];
        enquiriesBody.innerHTML = enquiries.length ? enquiries.map((item) => `<div class="flex flex-col gap-2 border-b border-[#f0e5d8] py-4 sm:flex-row sm:items-center sm:justify-between"><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-3"><h3 class="font-semibold text-[#32110d]">${escapeHtml(item.name || item.full_name || item.email || 'Customer')}</h3><span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">${escapeHtml(item.status || 'NEW')}</span></div><p class="mt-1 truncate text-sm text-[#7e5a43]">${escapeHtml(item.subject || item.message || item.enquiry_type || 'Enquiry')}</p></div><span class="shrink-0 text-xs text-[#9b6b2c]">${escapeHtml(item.created_at || '')}</span></div>`).join("") : '<p class="py-4 text-sm text-[#7e5a43]">No enquiries yet.</p>';
      }

      const orders = Array.isArray(data.recent_orders) ? data.recent_orders : [];
      if (!orders.length) {
        body.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-sm text-[#7e5a43]">No orders yet.</td></tr>';
        return;
      }
      body.innerHTML = orders.map((order) => {
        const status = String(order.order_status || "").toUpperCase();
        return `<tr>
          <td class="py-4 font-semibold">#${escapeHtml(order.order_number || order.id)}</td>
          <td class="py-4">${escapeHtml(order.customer_name || "Customer")}</td>
          <td class="py-4">${money(order.total_amount)}</td>
          <td class="py-4 text-xs text-[#7e5a43]">${escapeHtml(order.created_at || "")}</td>
          <td class="py-4"><span class="rounded-full ${statusClass[status] || "bg-gray-100 text-gray-600"} px-3 py-1 text-xs font-semibold">${escapeHtml(status.replaceAll("_", " "))}</span></td>
        </tr>`;
      }).join("");
    } catch (error) {
      body.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-sm text-red-700">${escapeHtml(error.message || "Unable to load orders.")}</td></tr>`;
    }
  });
})();
