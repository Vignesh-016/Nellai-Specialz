(() => {
  const API_BASE_URL = "https://backend.nellaispecialz.com";
  const resolveBackendImageUrl = (path) => {
    const value = String(path ?? "").trim();
    if (!value || /^data:/i.test(value)) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, "")}`;
  };
  window.NellaiApi = {
    API_BASE_URL,
    resolveBackendImageUrl,
    async request(path, options = {}) {
      const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
      };
      if (!(options.body instanceof FormData) && options.body !== undefined)
        headers["Content-Type"] = "application/json";
      const response = await fetch(
        `${API_BASE_URL}/api/${path.replace(/^\//, "")}`,
        // Customer/admin session endpoints require cookies. Public endpoints
        // remain protected by the backend CORS allowlist and can ignore them.
        { credentials: options.credentials || "include", ...options, headers },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) { const error = new Error(result.message || "Request failed."); error.status = response.status; error.code = result.code || null; error.errors = result.errors || {}; throw error; }
      return result.data;
    },
  };
  // Storefront product, category, and gallery data use backend-relative paths.
  // Keep one resolver so those paths never become relative to the current page.
  window.resolveBackendImageUrl = resolveBackendImageUrl;
  window.normalizeStorefrontImage = resolveBackendImageUrl;
  window.normalizeStorefrontAsset = resolveBackendImageUrl;
})();
