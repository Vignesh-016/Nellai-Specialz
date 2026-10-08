(() => {
  const api = window.NellaiApi;
  if (!api) return;

  const initialize = () => {
    const modal = document.getElementById("bulkOrderModal");
    const content = modal?.querySelector(":scope > div");
    const form = document.getElementById("bulkOrderForm");
    const status = document.getElementById("bulkFormStatus");
    const comboBoxes = document.getElementById("bulkComboBoxes");
    const customWrapper = document.getElementById("customQtyWrapper");
    const customQuantity = document.getElementById("bulkCustomQty");
    const submitButton = document.getElementById("submitBulkOrderBtn");
    let isSubmitting = false;

    if (!modal || !form || !status || !comboBoxes || !customWrapper || !customQuantity) return;

    const setStatus = (text, kind = "error") => {
      status.textContent = text;
      status.className = kind === "success"
        ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800"
        : "rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700";
      status.classList.remove("hidden");
    };
    const syncCustomQuantity = () => {
      const customize = comboBoxes.value === "Customize";
      customWrapper.classList.toggle("hidden", !customize);
      customQuantity.required = customize;
      customQuantity.disabled = !customize;
      if (!customize) customQuantity.value = "";
    };
    const openModal = () => {
      modal.classList.remove("opacity-0", "pointer-events-none");
      modal.classList.add("opacity-100", "pointer-events-auto");
      content?.classList.remove("scale-95");
      content?.classList.add("scale-100");
      document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
      if (isSubmitting) return;
      modal.classList.remove("opacity-100", "pointer-events-auto");
      modal.classList.add("opacity-0", "pointer-events-none");
      content?.classList.remove("scale-100");
      content?.classList.add("scale-95");
      document.body.style.overflow = "";
    };
    const resetStatus = () => {
      status.textContent = "";
      status.className = "hidden rounded-xl p-3 text-center text-xs font-semibold";
    };

    syncCustomQuantity();
    comboBoxes.addEventListener("change", syncCustomQuantity);
    document.getElementById("openBulkOrderModalBtn")?.addEventListener("click", openModal);
    document.getElementById("closeBulkOrderModalBtn")?.addEventListener("click", closeModal);
    document.getElementById("cancelBulkOrderBtn")?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("pointer-events-auto")) closeModal();
    });
    document.addEventListener("click", (event) => {
      const target = event.target.closest("a[href*='contact-us.html'], [data-open-bulk-modal]");
      if (!target) return;
      const label = (target.textContent || "").toLowerCase();
      if (label.includes("corporate") || label.includes("bulk")) {
        event.preventDefault();
        openModal();
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting || !form.reportValidity()) return;

      const data = new FormData(form);
      const payload = {
        type: "BULK_ORDER",
        name: String(data.get("name") || "").trim(),
        company_name: String(data.get("company_name") || "").trim(),
        address: String(data.get("address") || "").trim(),
        employee_size: String(data.get("employee_size") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        combo_boxes_required: String(data.get("combo_boxes_required") || "").trim(),
        custom_quantity: comboBoxes.value === "Customize" ? Number(customQuantity.value) : null,
        website: String(data.get("website") || "").trim(),
      };
      if (["name", "company_name", "address", "employee_size", "phone", "combo_boxes_required"]
        .some((field) => !payload[field])) {
        setStatus("Please complete all required fields.");
        return;
      }
      if (comboBoxes.value === "Customize"
        && (!Number.isSafeInteger(payload.custom_quantity) || payload.custom_quantity < 1)) {
        setStatus("Enter a positive whole number for the custom quantity.");
        return;
      }

      isSubmitting = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }
      resetStatus();
      try {
        await api.request("enquiries/post.php", {
          method: "POST",
          credentials: "omit",
          body: JSON.stringify(payload),
        });
        setStatus("Thanks for your bulk order enquiry. Our team will contact you shortly.", "success");
        form.reset();
        syncCustomQuantity();
        setTimeout(() => {
          modal.classList.remove("opacity-100", "pointer-events-auto");
          modal.classList.add("opacity-0", "pointer-events-none");
          content?.classList.remove("scale-100");
          content?.classList.add("scale-95");
          document.body.style.overflow = "";
          resetStatus();
        }, 1800);
      } catch (error) {
        const validationMessages = Object.values(error.errors || {});
        setStatus(validationMessages.length ? validationMessages.join(" ") : error.message || "Unable to submit your bulk enquiry right now.");
      } finally {
        isSubmitting = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Submit Enquiry";
        }
      }
    });

    window.openBulkOrderModal = openModal;
    window.closeBulkOrderModal = closeModal;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
