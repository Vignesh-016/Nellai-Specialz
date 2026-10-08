(() => {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-contact-form]").forEach((form) => {
      const status = form.querySelector("[data-form-status]");
      const submit = form.querySelector('[type="submit"]');

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!form.reportValidity() || submit?.disabled) return;

        const data = new FormData(form);
        const payload = Object.fromEntries(data.entries());
        for (const field of ["name", "email", "phone", "subject", "message"]) {
          if (typeof payload[field] === "string") payload[field] = payload[field].trim();
        }
        if (!payload.name || !payload.email || !payload.subject || !payload.message) {
          if (status) {
            status.textContent = "Please complete the required fields.";
            status.className = "mt-4 text-sm text-red-700";
          }
          return;
        }
        payload.type = "CONTACT";

        if (submit) {
          submit.disabled = true;
          submit.textContent = "Sending...";
        }
        if (status) {
          status.textContent = "";
          status.className = "mt-4 text-sm";
        }

        try {
          await window.NellaiApi.request("enquiries/post.php", {
            method: "POST",
            credentials: "omit",
            body: JSON.stringify(payload),
          });
          if (status) {
            status.textContent = "Thanks for contacting Nellai Specialz. We’ll get back to you shortly.";
            status.className = "mt-4 text-sm text-emerald-700";
          }
          form.reset();
        } catch (error) {
          if (status) {
            const fieldErrors = Object.entries(error.errors || {})
              .map(([field, message]) => `${field}: ${message}`)
              .join(" ");
            status.textContent = fieldErrors || error.message || "Unable to submit your enquiry right now.";
            status.className = "mt-4 text-sm text-red-700";
          }
        } finally {
          if (submit) {
            submit.disabled = false;
            submit.textContent = "Send Message";
          }
        }
      });
    });
  });
})();
