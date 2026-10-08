(() => {
  const request = (path, options = {}) => window.NellaiApi.request(path, { ...options, credentials: "include" });

  async function getCurrentCustomer() {
    try {
      return await request("customer-auth/me.php", { method: "GET" });
    } catch (error) {
      if (error.status === 401) return null;
      throw error;
    }
  }

  window.NellaiCustomerSession = {
    getCurrentCustomer,
    async isCustomerLoggedIn() { return Boolean(await getCurrentCustomer()); },
    async requireCustomer() {
      const customer = await getCurrentCustomer();
      if (!customer) {
        const redirect = `${location.pathname}${location.search}${location.hash}`;
        location.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
        return null;
      }
      return customer;
    },
    async logoutCustomer() {
      await request("customer-auth/logout.php", { method: "POST" });
      return true;
    },
  };
})();
