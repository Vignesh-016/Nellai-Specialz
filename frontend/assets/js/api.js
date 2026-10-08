(() => {
  const API_BASE_URL = "https://backend.nellaispecialz.com";
  window.NellaiApi = {
    API_BASE_URL,
    async request(path, options = {}) {
      const headers = {
        Accept: "application/json",
        ...(options.headers || {}),
      };
      if (!(options.body instanceof FormData) && options.body !== undefined)
        headers["Content-Type"] = "application/json";
      const response = await fetch(
        `${API_BASE_URL}/api/${path.replace(/^\//, "")}`,
        { credentials: options.credentials || "omit", ...options, headers },
      );
      const result = await response.json().catch(() => ({}));
      if (response.status === 401)
        window.dispatchEvent(new CustomEvent("nellai:auth-required"));
      if (!response.ok || !result.success) { const error = new Error(result.message || "Request failed."); error.status = response.status; error.code = result.code || null; error.errors = result.errors || {}; throw error; }
      return result.data;
    },
  };
})();
