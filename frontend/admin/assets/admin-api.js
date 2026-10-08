(() => {
  const base = "https://backend.nellaispecialz.com/api/";
  window.AdminApi = window.AdminApi || {
    async request(path, options = {}) {
      const headers = { Accept: "application/json", ...(options.headers || {}) };
      if (!(options.body instanceof FormData) && options.body !== undefined) headers["Content-Type"] = "application/json";
      const response = await fetch(base + path.replace(/^\//, ""), { cache: "no-store", credentials: "include", ...options, headers });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) { location.replace(`login.html?reason=session-expired&redirect=${encodeURIComponent(location.pathname.split('/').pop() || 'index.html')}`); throw new Error("Session expired."); }
      if (!response.ok || !result.success) {
        const error = new Error(result.message || "Request failed.");
        error.status = response.status;
        error.errors = result.errors || {};
        error.response = result;
        throw error;
      }
      return result.data;
    },
  };
})();
