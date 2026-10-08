(function () {
  const formatRupees = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  let staleVariationKeys = new Set();
  let isPlacingOrder = false;
  let isSavingAddress = false;
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);

  function getCart() {
    return window.NellaiCart?.getItems?.() || [];
  }

  function showMessage(message, type = "error") {
    const target = document.getElementById("checkoutMessage");
    if (!target) return;
    target.className = `mt-4 rounded-xl border px-4 py-3 text-sm ${type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`;
    target.textContent = message;
  }

  function renderOrderSummary(cart) {
    const rows = document.getElementById("checkoutCartRows");
    const subtotalElement = document.getElementById("checkoutSubtotal");
    const totalElement = document.getElementById("checkoutTotal");
    if (!rows || !subtotalElement || !totalElement) return;

    rows.replaceChildren();
    let subtotal = 0;
    let hasUnavailablePrice = false;
    if (!cart.length) {
      rows.textContent = "Your cart is empty.";
      subtotalElement.textContent = formatRupees(0);
      totalElement.textContent = formatRupees(0);
      const placeOrderButton = document.getElementById("placeOrderBtn");
      if (placeOrderButton) placeOrderButton.disabled = true;
      return;
    }

    cart.forEach((item) => {
      const itemPrice = item.unit_price;
      const quantity = item.quantity;
      if (itemPrice === null) hasUnavailablePrice = true;
      else subtotal += itemPrice * quantity;

      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-4 rounded-xl border border-[#E7DDD1] bg-[#FFFCF7] p-3";
      row.innerHTML = `
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-[#32110D]">${escapeHtml(item.name)}</p>
          <p class="text-xs text-[#786153]">${escapeHtml(item.variation_name || item.weight)} × ${quantity}</p>
          <p class="text-xs text-[#786153]">${itemPrice === null ? "Price unavailable" : `${formatRupees(itemPrice)} each`}</p>
          ${staleVariationKeys.has(item.id) ? '<p class="mt-1 text-xs font-semibold text-red-700">Please reselect this product option.</p>' : ""}
        </div>
        <div class="text-right">
          <span class="font-semibold text-[#32110D]">${itemPrice === null ? "Price unavailable" : formatRupees(itemPrice * quantity)}</span>
          ${staleVariationKeys.has(item.id) ? '<button type="button" data-remove-stale-cart-item class="mt-1 block text-xs font-semibold text-red-700 underline">Remove item</button>' : ""}
        </div>`;
      if (staleVariationKeys.has(item.id)) {
        row.querySelector("[data-remove-stale-cart-item]").addEventListener("click", () => {
          window.NellaiCart?.remove(item.id);
          staleVariationKeys.delete(item.id);
          renderOrderSummary(getCart());
          if (!staleVariationKeys.size) showMessage("");
        });
      }
      rows.appendChild(row);
    });

    subtotalElement.textContent = hasUnavailablePrice ? "Price unavailable" : formatRupees(subtotal);
    totalElement.textContent = hasUnavailablePrice ? "Price unavailable" : formatRupees(subtotal);
    const placeOrderButton = document.getElementById("placeOrderBtn");
    if (placeOrderButton) {
      placeOrderButton.disabled = hasUnavailablePrice || cart.length === 0 || staleVariationKeys.size > 0;
      placeOrderButton.title = hasUnavailablePrice ? "A product price is unavailable." : "";
    }
  }

  async function validateCartVariations(cart) {
    const products = new Map();
    const stale = new Set();
    for (const item of cart) {
      let product = products.get(item.product_id);
      if (!products.has(item.product_id)) {
        try {
          product = await window.NellaiApi.request(
            `products/get.php?id=${encodeURIComponent(item.product_id)}`,
            { method: "GET", credentials: "include" },
          );
        } catch (error) {
          if (error.status !== 404) throw error;
          product = null;
        }
        products.set(item.product_id, product);
      }
      if (!product) {
        stale.add(item.id);
        continue;
      }
      const activeVariations = (product.variations || []).filter((variation) =>
        String(variation.status || "ACTIVE").toUpperCase() === "ACTIVE",
      );
      const valid = item.variation_id === null
        ? activeVariations.length === 0
        : activeVariations.some((variation) =>
          Number(variation.id) === item.variation_id
          && Number(variation.product_id) === item.product_id,
        );
      if (!valid) stale.add(item.id);
    }
    staleVariationKeys = stale;
    return stale.size === 0;
  }

  async function ensureCustomer() {
    try {
      const customer = await window.NellaiCustomerSession.getCurrentCustomer();
      if (customer) return customer;
    } catch (error) {
      showMessage(error.message || "Unable to verify your customer session.");
      return null;
    }
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    location.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
    return null;
  }

  function addressFormMarkup() {
    return `
      <div id="newAddressPanel" class="mt-5 rounded-2xl border border-dashed border-[#B88932]/40 bg-[#FFF9F1] p-5">
        <h3 class="font-serif text-2xl font-semibold text-[#32110D]">Add a delivery address</h3>
        <form id="newAddressForm" class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="text-sm font-semibold text-[#32110D]">Address label
            <input name="label" value="Home" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="text-sm font-semibold text-[#32110D]">Full name
            <input name="full_name" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="text-sm font-semibold text-[#32110D]">Phone
            <input name="phone" type="tel" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="text-sm font-semibold text-[#32110D]">Country
            <input name="country" value="India" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3">
          </label>
          <label class="text-sm font-semibold text-[#32110D] sm:col-span-2">Address line 1
            <input name="address_line1" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="text-sm font-semibold text-[#32110D] sm:col-span-2">Address line 2
            <input name="address_line2" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3">
          </label>
          <label class="text-sm font-semibold text-[#32110D]">City
            <input name="city" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="text-sm font-semibold text-[#32110D]">State
            <input name="state" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="text-sm font-semibold text-[#32110D]">Postal code
            <input name="postal_code" class="mt-2 h-11 w-full rounded-lg border border-[#E7DDD1] bg-white px-3" required>
          </label>
          <label class="flex items-center gap-2 self-end rounded-lg border border-[#E7DDD1] bg-white px-3 py-3 text-sm text-[#32110D]">
            <input type="checkbox" name="is_default" value="1" class="h-4 w-4 accent-[#4d190e]"> Set as default
          </label>
          <div class="flex gap-3 sm:col-span-2">
            <button type="submit" class="h-11 rounded-lg bg-[#4d190e] px-5 font-semibold text-white">Save address</button>
            <button type="button" id="cancelAddressButton" class="h-11 rounded-lg border px-5 font-semibold">Cancel</button>
          </div>
        </form>
      </div>`;
  }

  function bindAddressForm() {
    const form = document.getElementById("newAddressForm");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSavingAddress) return;
      isSavingAddress = true;
      const saveButton = form.querySelector('button[type="submit"]');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving address...";
      }
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.is_default = formData.has("is_default") ? 1 : 0;

      try {
        const result = await window.NellaiApi.request("customer/addresses/post.php", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify(payload),
        });
        showMessage("Address saved successfully.", "success");
        await loadAddresses(result.id);
      } catch (error) {
        showMessage(error.message || "Unable to save the address.");
      } finally {
        isSavingAddress = false;
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = "Save address";
        }
      }
    });
    document.getElementById("cancelAddressButton")?.addEventListener("click", () => {
      const wrapper = document.getElementById("newAddressWrapper");
      if (wrapper) wrapper.hidden = true;
      document.getElementById("addNewAddressButton")?.focus();
    });
  }

  async function loadAddresses(selectedId = null) {
    const container = document.getElementById("addressList");
    const formContainer = document.getElementById("addressFormContainer");
    if (!container || !formContainer) return;

    try {
      const addresses = await window.NellaiApi.request("customer/addresses/get.php", {
        method: "GET",
        credentials: "include",
      });
      if (!addresses.length) {
        container.innerHTML = '<p class="rounded-xl border border-dashed border-[#B88932]/40 bg-[#FFF9F1] p-4 text-sm text-[#806b58]">No saved addresses yet. Add your delivery address to continue.</p>';
        formContainer.innerHTML = addressFormMarkup();
        bindAddressForm();
        return;
      }

      const selected = addresses.find((address) => String(address.id) === String(selectedId))
        || addresses.find((address) => Number(address.is_default) === 1)
        || addresses[0];
      container.innerHTML = addresses.map((address) => {
        const checked = String(address.id) === String(selected.id);
        const addressLine1 = address.address_line1 ?? address.address_line_1 ?? "";
        const postalCode = address.postal_code ?? address.pincode ?? "";
        return `
          <label class="flex cursor-pointer gap-3 rounded-2xl border border-[#E7DDD1] bg-[#FFFCF7] p-4 ${checked ? "border-[#B88932] ring-2 ring-[#B88932]/15" : ""}">
            <input type="radio" name="selected-address" value="${Number(address.id)}" ${checked ? "checked" : ""} class="mt-1 h-4 w-4 accent-[#4d190e]">
            <span class="min-w-0 flex-1">
              <span class="flex items-center gap-2 text-sm font-semibold text-[#32110D]">${escapeHtml(address.label || "Home")}
                ${Number(address.is_default) ? '<span class="rounded-full bg-[#E7F3EA] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#1E7A4B]">Default</span>' : ""}
              </span>
              <span class="mt-2 block text-sm text-[#4f3d35]">${escapeHtml(address.full_name)}<br>${escapeHtml(addressLine1)}${address.address_line2 ? `, ${escapeHtml(address.address_line2)}` : ""}<br>${escapeHtml(address.city)}, ${escapeHtml(address.state)} - ${escapeHtml(postalCode)}<br>${escapeHtml(address.phone)}</span>
            </span>
          </label>`;
      }).join("");
      formContainer.innerHTML = `
        <button id="addNewAddressButton" type="button" class="mt-5 rounded-lg border border-[#B88932]/50 px-4 py-2.5 text-sm font-semibold text-[#4d190e]">+ Add New Address</button>
        <div id="newAddressWrapper" hidden>${addressFormMarkup()}</div>`;
      document.getElementById("addNewAddressButton")?.addEventListener("click", () => {
        const wrapper = document.getElementById("newAddressWrapper");
        if (wrapper) wrapper.hidden = false;
      });
      bindAddressForm();
    } catch (error) {
      container.textContent = error.message || "Unable to load saved addresses.";
      formContainer.innerHTML = addressFormMarkup();
      bindAddressForm();
    }
  }

  async function placeOrder() {
    if (isPlacingOrder) return;
    const cart = getCart();
    if (!cart.length) {
      showMessage("Your cart is empty.");
      return;
    }
    if (cart.some((item) => item.unit_price === null)) {
      showMessage("A product price is unavailable. Remove it from your cart or refresh the product before checkout.");
      return;
    }

    isPlacingOrder = true;
    const button = document.getElementById("placeOrderBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "Checking order...";
    }
    let orderSubmitted = false;
    try {
      if (!(await validateCartVariations(cart))) {
        renderOrderSummary(cart);
        showMessage("Please reselect this product option. Remove the marked item and add it again from the product page.");
        return;
      }

      const selectedAddress = document.querySelector('input[name="selected-address"]:checked');
      if (!selectedAddress) {
        showMessage("Please select a delivery address before placing the order.");
        return;
      }

      if (button) button.textContent = "Placing order...";

      const result = await window.NellaiApi.request("customer-orders/post.php", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          address_id: Number(selectedAddress.value),
          payment_method: "COD",
          items: cart.map((item) => ({
            product_id: item.product_id,
            variation_id: item.variation_id,
            quantity: item.quantity,
          })),
        }),
      });

      window.NellaiCart?.clear();
      window.NellaiCart?.updateCount();
      window.NellaiCart?.render();
      showMessage(`Order placed successfully. Order #${result.order_number || result.order_id}.`, "success");
      orderSubmitted = true;
      setTimeout(() => {
        location.href = "profile.html#orders";
      }, 900);
    } catch (error) {
      showMessage(error.message || "We could not place your order right now.");
    } finally {
      isPlacingOrder = false;
      if (button && !orderSubmitted) {
        button.disabled = staleVariationKeys.size > 0 || cart.some((item) => item.unit_price === null);
        button.textContent = "Place order";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const customer = await ensureCustomer();
    if (!customer) return;
    const name = document.getElementById("customerName");
    if (name) name.textContent = customer.name || customer.email || "Customer";

    const cart = getCart();
    renderOrderSummary(cart);
    try {
      await validateCartVariations(cart);
      renderOrderSummary(cart);
      if (staleVariationKeys.size) {
        showMessage("Please reselect this product option. Remove the marked item and add it again from the product page.");
      }
    } catch (error) {
      const button = document.getElementById("placeOrderBtn");
      if (button) button.disabled = true;
      showMessage(error.message || "Unable to verify the selected product variations. Please refresh and try again.");
      return;
    }
    await loadAddresses();
    document.getElementById("placeOrderBtn")?.addEventListener("click", placeOrder);
    document.getElementById("continueShoppingBtn")?.addEventListener("click", () => {
      location.href = "pages/shop.html";
    });
  });

  window.NellaiCheckout = {
    start: () => {
      if (!getCart().length) return;
      location.href = "checkout.html";
    },
    renderOrderSummary,
    placeOrder,
    loadAddresses,
  };
})();
