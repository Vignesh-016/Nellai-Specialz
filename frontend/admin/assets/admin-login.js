/* Admin login page behavior. Authentication is intentionally backend-owned. */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-admin-login-form]");
  const password = document.querySelector("[data-admin-password]");
  const toggle = document.querySelector("[data-toggle-admin-password]");
  toggle?.addEventListener("click", () => { password.type = password.type === "password" ? "text" : "password"; });
  form?.addEventListener("submit", (event) => event.preventDefault());
});
