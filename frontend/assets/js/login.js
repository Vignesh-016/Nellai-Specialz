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
        await NellaiApi.request("customer-auth/me.php", { method: "GET", credentials: "include" });
        location.replace(window.NellaiCustomerSession.getSafeRedirect());
      } catch (error) {
        showError(form, error.message || "Unable to sign in. Please try again.");
        if (error.code === "EMAIL_NOT_VERIFIED") {
          const link = document.createElement("a"); link.href = `verify-otp.html?email=${encodeURIComponent(email)}`; link.textContent = " Verify Email"; link.className = "ml-1 font-semibold underline";
          form.querySelector("[data-auth-error]").appendChild(link);
        }
      } finally { button.disabled = false; }
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
