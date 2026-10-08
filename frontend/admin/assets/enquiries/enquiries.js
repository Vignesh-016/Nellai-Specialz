(() => {
  const api = window.AdminApi;
  if (!api) return;

  const statuses = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  const statusLabels = {
    NEW: "New",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  };
  const state = { rows: [], filter: "ALL", activeDetail: null, loading: false };
  const el = (id) => document.getElementById(id);

  function setMessage(text, type = "error") {
    const node = el("enquiries-status");
    if (!node) return;
    if (!text) {
      node.textContent = "";
      node.className = "hidden";
      return;
    }
    node.textContent = text;
    node.className = type === "success"
      ? "rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      : "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700";
  }

  function value(node, text) {
    node.textContent = text == null || text === "" ? "—" : String(text);
    return node;
  }

  function formatDate(date) {
    if (!date) return "—";
    const parsed = new Date(String(date).replace(" ", "T"));
    return Number.isNaN(parsed.getTime()) ? String(date) : parsed.toLocaleString();
  }

  function getType(enquiry) {
    return String(enquiry.type || enquiry.enquiry_type || "CONTACT").toUpperCase() === "BULK_ORDER"
      ? "BULK_ORDER"
      : "CONTACT";
  }

  function filteredRows() {
    const search = (el("enquiry-search")?.value || "").trim().toLowerCase();
    const status = el("enquiry-status-filter")?.value || "";
    return state.rows.filter((enquiry) => {
      if (state.filter !== "ALL" && getType(enquiry) !== state.filter) return false;
      if (status && String(enquiry.status).toUpperCase() !== status) return false;
      if (!search) return true;
      return [
        enquiry.name,
        enquiry.email,
        enquiry.phone,
        enquiry.subject,
        enquiry.message,
        enquiry.company_name,
        enquiry.address,
        enquiry.employee_size,
        enquiry.combo_boxes_required,
      ].some((part) => String(part || "").toLowerCase().includes(search));
    });
  }

  function tableCell(row, text, className = "p-3") {
    const cell = document.createElement("td");
    cell.className = className;
    value(cell, text);
    row.appendChild(cell);
    return cell;
  }

  function addHeaderRow(type) {
    const head = el("enquiries-head");
    const row = document.createElement("tr");
    const labels = type === "CONTACT"
      ? ["Name", "Email", "Phone", "Subject", "Message preview", "Date", "Status", "Actions"]
      : ["Name", "Company", "Phone", "Employee size", "Combo boxes required", "Date", "Status", "Actions"];
    labels.forEach((label) => {
      const cell = document.createElement("th");
      cell.className = "p-3";
      cell.textContent = label;
      row.appendChild(cell);
    });
    head.replaceChildren(row);
  }

  function makeStatusSelect(enquiry) {
    const select = document.createElement("select");
    select.className = "rounded-lg border border-[#eadbc6] bg-[#fffaf2] px-2 py-1.5 text-xs font-semibold";
    select.setAttribute("aria-label", `Status for enquiry ${enquiry.id}`);
    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = statusLabels[status];
      option.selected = status === String(enquiry.status).toUpperCase();
      select.appendChild(option);
    });
    select.addEventListener("change", async () => {
      select.disabled = true;
      try {
        await api.request(`enquiries/put.php?id=${encodeURIComponent(enquiry.id)}`, {
          method: "PUT",
          body: JSON.stringify({ status: select.value }),
        });
        setMessage("Enquiry status updated.", "success");
        await load();
      } catch (error) {
        setMessage(error.message || "Unable to update enquiry status.");
        select.value = String(enquiry.status).toUpperCase();
      } finally {
        select.disabled = false;
      }
    });
    return select;
  }

  function addActions(row, enquiry) {
    const cell = document.createElement("td");
    cell.className = "p-3";
    const actions = document.createElement("div");
    actions.className = "flex justify-end gap-2";

    const view = document.createElement("button");
    view.type = "button";
    view.textContent = "View";
    view.className = "rounded-lg border border-[#e8e1da] px-3 py-1.5 text-xs font-semibold text-[#594b45]";
    view.addEventListener("click", () => openDetail(enquiry.id));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.className = "rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600";
    remove.addEventListener("click", () => confirmDelete(enquiry));

    actions.append(view, remove);
    cell.appendChild(actions);
    row.appendChild(cell);
  }

  function render() {
    const rows = filteredRows();
    const tbody = el("enquiries-body");
    const empty = el("enquiries-empty");
    const types = new Set(rows.map(getType));
    const type = state.filter !== "ALL"
      ? state.filter
      : types.size === 1
        ? [...types][0]
        : null;

    if (type) addHeaderRow(type);
    else {
      const head = el("enquiries-head");
      head.replaceChildren();
      const row = document.createElement("tr");
      ["Type", "Name", "Contact", "Subject / company", "Date", "Status", "Actions"].forEach((label) => {
        const cell = document.createElement("th");
        cell.className = "p-3";
        cell.textContent = label;
        row.appendChild(cell);
      });
      head.appendChild(row);
    }

    tbody.replaceChildren();
    rows.forEach((enquiry) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-[#fffcf7]";
      const enquiryType = getType(enquiry);
      if (!type) tableCell(row, enquiryType === "CONTACT" ? "Contact" : "Bulk order");
      tableCell(row, enquiry.name, "p-3 font-semibold text-[#32110d]");

      if (type === "CONTACT") {
        tableCell(row, enquiry.email);
        tableCell(row, enquiry.phone);
        tableCell(row, enquiry.subject);
        tableCell(row, String(enquiry.message || "").slice(0, 100));
      } else if (type === "BULK_ORDER") {
        tableCell(row, enquiry.company_name);
        tableCell(row, enquiry.phone);
        tableCell(row, enquiry.employee_size);
        const combo = enquiry.combo_boxes_required === "Customize" && enquiry.custom_quantity
          ? `Customize (${enquiry.custom_quantity})`
          : enquiry.combo_boxes_required;
        tableCell(row, combo);
      } else {
        tableCell(row, enquiry.email || enquiry.phone);
        tableCell(row, enquiry.subject || enquiry.company_name);
      }

      tableCell(row, formatDate(enquiry.created_at));
      const statusCell = document.createElement("td");
      statusCell.className = "p-3";
      statusCell.appendChild(makeStatusSelect(enquiry));
      row.appendChild(statusCell);
      addActions(row, enquiry);
      tbody.appendChild(row);
    });

    empty.classList.toggle("hidden", rows.length > 0);
    if (rows.length === 0) empty.textContent = "No enquiries match these filters.";
  }

  async function load() {
    if (state.loading) return;
    state.loading = true;
    setMessage("");
    try {
      state.rows = await api.request("enquiries/get.php");
      render();
    } catch (error) {
      setMessage(error.message || "Unable to load enquiries.");
    } finally {
      state.loading = false;
    }
  }

  function addDetailField(container, label, content) {
    if (content == null || content === "") return;
    const section = document.createElement("section");
    section.className = "rounded-xl border border-[#eadbc6] bg-[#fffcf7] p-4";
    const heading = document.createElement("h3");
    heading.className = "text-[10px] font-bold uppercase tracking-wider text-[#9b6b2c]";
    heading.textContent = label;
    const text = document.createElement("p");
    text.className = "mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#594b45]";
    text.textContent = String(content);
    section.append(heading, text);
    container.appendChild(section);
  }

  async function openDetail(id) {
    setMessage("");
    try {
      const enquiry = await api.request(`enquiries/get.php?id=${encodeURIComponent(id)}`);
      state.activeDetail = enquiry;
      const detail = el("enquiry-detail");
      detail.replaceChildren();
      const type = getType(enquiry);
      addDetailField(detail, "Name", enquiry.name);
      if (type === "CONTACT") {
        addDetailField(detail, "Email", enquiry.email);
        addDetailField(detail, "Phone", enquiry.phone);
        addDetailField(detail, "Subject", enquiry.subject);
        addDetailField(detail, "Message", enquiry.message);
      } else {
        addDetailField(detail, "Company name", enquiry.company_name);
        addDetailField(detail, "Address", enquiry.address);
        addDetailField(detail, "Employee size", enquiry.employee_size);
        addDetailField(detail, "Phone", enquiry.phone);
        addDetailField(detail, "Combo boxes required", enquiry.combo_boxes_required);
        if (enquiry.custom_quantity != null) addDetailField(detail, "Custom quantity", enquiry.custom_quantity);
      }
      addDetailField(detail, "Submitted", formatDate(enquiry.created_at));
      el("enquiry-detail-status").value = String(enquiry.status || "NEW").toUpperCase();
      el("enquiry-admin-notes").value = enquiry.admin_notes || "";
      window.AdminModal?.open("enquiry-view-modal");
    } catch (error) {
      setMessage(error.message || "Unable to load enquiry details.");
    }
  }

  async function saveDetail(event) {
    event.preventDefault();
    if (!state.activeDetail) return;
    const button = el("enquiry-save-button");
    button.disabled = true;
    try {
      await api.request(`enquiries/put.php?id=${encodeURIComponent(state.activeDetail.id)}`, {
        method: "PUT",
        body: JSON.stringify({
          status: el("enquiry-detail-status").value,
          admin_notes: el("enquiry-admin-notes").value,
        }),
      });
      window.AdminModal?.close("enquiry-view-modal");
      setMessage("Enquiry changes saved.", "success");
      await load();
    } catch (error) {
      setMessage(error.message || "Unable to save enquiry changes.");
    } finally {
      button.disabled = false;
    }
  }

  function confirmDelete(enquiry) {
    window.AdminConfirm?.show("Delete this enquiry? This action cannot be undone.", async () => {
      try {
        await api.request(`enquiries/delete.php?id=${encodeURIComponent(enquiry.id)}`, { method: "DELETE" });
        setMessage("Enquiry deleted.", "success");
        await load();
      } catch (error) {
        setMessage(error.message || "Unable to delete enquiry.");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-enquiry-type]").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.enquiryType;
        document.querySelectorAll("[data-enquiry-type]").forEach((tab) => {
          const active = tab === button;
          tab.classList.toggle("bg-[#54170f]", active);
          tab.classList.toggle("text-white", active);
          tab.classList.toggle("text-[#594b45]", !active);
        });
        render();
      });
    });
    el("enquiry-search")?.addEventListener("input", render);
    el("enquiry-status-filter")?.addEventListener("change", render);
    el("enquiries-refresh")?.addEventListener("click", load);
    el("enquiry-update-form")?.addEventListener("submit", saveDetail);
    document.querySelectorAll("[data-close-enquiry-modal]").forEach((button) => {
      button.addEventListener("click", () => window.AdminModal?.close("enquiry-view-modal"));
    });
    el("enquiry-view-modal")?.addEventListener("click", (event) => {
      if (event.target === el("enquiry-view-modal")) window.AdminModal?.close("enquiry-view-modal");
    });
    load();
  });

  window.AdminEnquiries = { load };
})();
