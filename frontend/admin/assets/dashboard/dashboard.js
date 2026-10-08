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
