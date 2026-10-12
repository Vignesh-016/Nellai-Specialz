(() => {
  const showError = (form, message) => {
    let status = form.querySelector("[data-auth-error]");
    if (!status) { status = document.createElement("p"); status.dataset.authError = "true"; status.className = "text-sm text-red-700"; form.prepend(status); }
    status.textContent = message;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("customerLoginForm");
    window.NellaiCustomerSession?.getCurrentCustomer().then((customer) => {
      if (customer) location.replace(window.NellaiCustomerSession.getSafeRedirect());
    }).catch(() => {});
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      button.disabled = true;
      try {
        await NellaiApi.request("customer-auth/login.php", { method: "POST", credentials: "include", body: JSON.stringify({ email, password }) });
        location.replace(window.NellaiCustomerSession.getSafeRedirect());
      } catch (error) {
        showError(form, error.message || "Unable to sign in. Please try again.");
        if (error.code === "EMAIL_NOT_VERIFIED") {
          const link = document.createElement("a"); link.href = `verify-otp.html?email=${encodeURIComponent(email)}`; link.textContent = " Verify Email"; link.className = "ml-1 font-semibold underline";
          form.querySelector("[data-auth-error]").appendChild(link);
        }
      } finally { button.disabled = false; }
    });
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.querySelector("[data-toggle-password]");
    passwordToggle?.addEventListener("click", () => {
      const visible = passwordInput?.type === "text";
      if (passwordInput) passwordInput.type = visible ? "password" : "text";
      passwordToggle.setAttribute("aria-pressed", String(!visible));
      passwordToggle.setAttribute("aria-label", visible ? "Show password" : "Hide password");
      passwordToggle.innerHTML = visible
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.1 3.9M6.2 6.8C3.8 8.2 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5"/></svg>';
    });
    document.querySelector("[data-forgot-password]")?.addEventListener("click", async (event) => {
      event.preventDefault();
      const email = window.prompt("Enter your account email to receive an OTP:");
      if (!email) return;
      try {
        await NellaiApi.request("customer-auth/forgot-password.php", { method: "POST", credentials: "include", body: JSON.stringify({ email: email.trim() }) });
        location.replace(`verify-reset-otp.html?email=${encodeURIComponent(email.trim())}`);
      } catch (error) { showError(form, error.message || "We could not send the verification email."); }
    });
  });
})();
