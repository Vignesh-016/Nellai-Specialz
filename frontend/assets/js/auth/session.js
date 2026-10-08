(() => {
  const AUTH_FILES = new Set([
    "login.html",
    "register.html",
    "verify-otp.html",
    "forgot-password.html",
    "reset-password.html",
  ]);

  const request = (path, options = {}) =>
    window.NellaiApi.request(path, { ...options, credentials: "include" });

  const currentFile = () => location.pathname.split("/").pop().toLowerCase();
  const isAuthPage = () => AUTH_FILES.has(currentFile());
  const homePath = () => "/frontend/index.html";

  function safeRedirect(raw, fallback = homePath()) {
    if (!raw || typeof raw !== "string") return fallback;
    let value = raw;
    try { value = decodeURIComponent(value); } catch (_) { return fallback; }
    value = value.trim();
    if (value === "/index.html" || value === "index.html") return "/frontend/index.html";
    if (!value || value.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(value)) return fallback;
    try {
      const url = new URL(value, location.origin);
      if (url.origin !== location.origin) return fallback;
      const file = url.pathname.split("/").pop().toLowerCase();
      if (AUTH_FILES.has(file)) return fallback;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch (_) {
      return fallback;
    }
  }

  const getSafeRedirect = () => safeRedirect(new URLSearchParams(location.search).get("redirect"));

  async function getCurrentCustomer() {
    try {
      return await request("customer-auth/me.php", { method: "GET" });
    } catch (error) {
      console.warn("[Customer Session] Check failed:", error);
      return null;
    }
  }

  async function requireCustomer() {
    if (isAuthPage()) return null;
    let customer;
    try {
      customer = await getCurrentCustomer();
    } catch (_) {
      return null;
    }
    if (customer) return customer;
    const target = `${location.pathname}${location.search}${location.hash}`;
    const login = `/frontend/login.html?redirect=${encodeURIComponent(safeRedirect(target))}`;
    console.log("[AUTH REDIRECT]", { source: "session.js", pathname: location.pathname, search: location.search, target });
    if (!isAuthPage()) location.replace(login);
    return null;
  }

  window.NellaiCustomerSession = {
    getCurrentCustomer,
    isAuthPage,
    getSafeRedirect,
    safeRedirect,
    async isCustomerLoggedIn() { return Boolean(await getCurrentCustomer()); },
    requireCustomer,
    async logoutCustomer() {
      await request("customer-auth/logout.php", { method: "POST" });
      return true;
    },
  };
})();
