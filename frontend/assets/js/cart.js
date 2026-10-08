(function () {
  const CART_KEY = "nellai_cart";
  const PLACEHOLDER = "assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
  const pageBase = () => (location.pathname.includes("/pages/") ? "../" : "./");
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);

  function productImage(value) {
    if (!value || typeof value !== "string") return `${pageBase()}${PLACEHOLDER}`;
    if (/^https?:\/\//i.test(value)) return value;
    if (/^(?:\.{1,2}\/|\/)assets\//i.test(value)) return value;
    return `https://backend.nellaispecialz.com/${value.replace(/^\/+/, "")}`;
  }

  function normalizeItem(item) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const productId = Number(item.product_id);
    const variationId = item.variation_id == null || item.variation_id === ""
      ? null
      : Number(item.variation_id);
    const quantity = Math.floor(Number(item.quantity));
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const rawPrice = item.unit_price ?? item.selling_price ?? item.sale_price ?? item.offer_price ?? item.price;
    let price = rawPrice === null || rawPrice === "" || rawPrice === undefined
      ? null
      : Number(rawPrice);
    if (variationId !== null && (price === null || !Number.isFinite(price) || price <= 0)) {
      price = null;
    }

    if (!Number.isSafeInteger(productId) || productId < 1
      || (variationId !== null && (!Number.isSafeInteger(variationId) || variationId < 1))
      || !Number.isSafeInteger(quantity) || quantity < 1 || !name
      || (price !== null && (!Number.isFinite(price) || price <= 0))
      || (variationId === null && price === null)) {
      return null;
    }

    return {
      id: `${productId}:${variationId || 0}`,
      product_id: productId,
      variation_id: variationId,
      name,
      image: typeof item.image === "string" ? item.image : "",
      variation_name: typeof item.variation_name === "string" ? item.variation_name : "",
      weight: typeof item.weight === "string" ? item.weight : "",
      unit_price: price,
      quantity,
    };
  }

  function getCart() {
    let stored;
    let invalidStorage = false;
    try {
      stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch {
      stored = [];
      invalidStorage = true;
    }
    const parsed = Array.isArray(stored) ? stored : [];
    if (!Array.isArray(stored)) invalidStorage = true;
    const normalized = parsed.map(normalizeItem).filter(Boolean);
    if (invalidStorage || JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      localStorage.setItem(CART_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent("nellai:cart-updated"));
    }
    return normalized;
  }

  function setCart(cart) {
    const normalized = cart.map(normalizeItem).filter(Boolean);
    localStorage.setItem(CART_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("nellai:cart-updated"));
  }

  const cartCount = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = (cart) => cart.reduce(
    (sum, item) => sum + (item.unit_price === null ? 0 : item.unit_price * item.quantity),
    0,
  );

  function formatRupees(value) {
    return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  }

  function updateCartBadge() {
    const count = cartCount(getCart());
    document.querySelectorAll("[data-cart-count]").forEach((element) => {
      element.textContent = String(count);
      element.hidden = count === 0;
    });
  }

  function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "pointer-events-none fixed bottom-6 right-6 z-[80] flex flex-col gap-2";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto rounded-xl border border-[#B88932]/40 bg-[#32110D] px-4 py-3 text-sm text-[#FBF5E9] shadow-2xl";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  function redirectToLogin() {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    if (window.NellaiCustomerSession?.isAuthPage()) return;
    const safeTarget = window.NellaiCustomerSession?.safeRedirect(redirect) || redirect;
    location.replace(`${pageBase()}login.html?redirect=${encodeURIComponent(safeTarget)}`);
  }

  async function addToCart(item) {
    if (!window.NellaiApi) {
      showToast("Cart is unavailable. Please refresh and try again.");
      return;
    }

    try {
      await window.NellaiApi.request("customer-auth/me.php", {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      if (error.status === 401) {
        redirectToLogin();
        return;
      }
      showToast(error.message || "Unable to verify your customer session.");
      return;
    }

    const entry = normalizeItem({
      ...item,
      product_id: item.product_id ?? item.id,
      unit_price: item.unit_price ?? item.selling_price ?? item.sale_price ?? item.offer_price ?? item.price,
      quantity: item.quantity ?? 1,
    });
    if (!entry) {
      showToast("This product is missing a valid database ID or price.");
      return;
    }

    try {
      const cart = getCart();
      const existing = cart.find((currentItem) => currentItem.id === entry.id);
      if (existing) existing.quantity += entry.quantity;
      else cart.push(entry);
      setCart(cart);
      updateCartBadge();
      renderCartModal();
      showToast(`${entry.name} added to cart.`);
      openCart();
    } catch (error) {
      showToast(error.message || "Unable to save your cart.");
    }
  }

  function changeQty(id, delta) {
    const cart = getCart().map((item) => item.id === id
      ? { ...item, quantity: Math.max(1, item.quantity + delta) }
      : item);
    setCart(cart);
    updateCartBadge();
    renderCartModal();
  }

  function removeItem(id) {
    setCart(getCart().filter((item) => item.id !== id));
    updateCartBadge();
    renderCartModal();
  }

  function lockScroll(lock) {
    document.body.classList.toggle("overflow-hidden", lock);
  }

  function mountCartModal() {
    if (document.getElementById("cartModal")) return;

    const modal = document.createElement("div");
    modal.id = "cartModal";
    modal.className = "fixed inset-0 z-[75] hidden items-center justify-center bg-black/50 p-4 backdrop-blur-sm";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("role", "dialog");
    modal.innerHTML = `
      <div class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#B88932]/30 bg-[#FBF5E9] shadow-2xl">
        <div class="flex items-center justify-between border-b border-[#4d190e]/15 bg-white/80 px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#4d190e] text-lg font-bold text-[#D9B86C] shadow-sm">🛒</div>
            <div>
              <h2 class="font-serif text-xl font-bold text-[#32110D]">Your cart</h2>
              <p class="text-[11px] font-semibold text-[#B88932]">Fresh picks from Nellai Specialz</p>
            </div>
          </div>
          <button type="button" id="closeCartModalBtn" class="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-[#32110D] transition hover:bg-[#4d190e]/10" aria-label="Close cart">×</button>
        </div>
        <div class="flex-1 space-y-6 overflow-y-auto p-6">
          <div id="modalCartList" class="space-y-4"></div>
          <div id="modalCartEmpty" class="py-10 text-center">
            <div class="mb-3 flex justify-center text-[#B88932] text-4xl">🛍️</div>
            <p class="font-serif text-xl font-bold text-[#32110D]">Your cart is empty</p>
            <p class="mt-1 text-xs text-[#75675D]">Add a few favourites and continue to checkout.</p>
          </div>
        </div>
        <div id="modalCartSummary" hidden class="border-t border-[#4d190e]/15 bg-white/95 p-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span class="text-xs text-[#75675D]">Subtotal</span>
              <div class="font-serif text-2xl font-bold text-[#4d190e]" id="modalCartTotal">₹0</div>
            </div>
            <button type="button" id="btnProceedToCheckout" class="w-full rounded-xl bg-[#4d190e] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#fff6df] transition hover:bg-[#702217] sm:w-auto">Proceed to checkout</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    document.getElementById("closeCartModalBtn")?.addEventListener("click", closeCart);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeCart();
    });
    document.getElementById("modalCartList")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-qty-delta]");
      if (button) {
        changeQty(button.dataset.id, Number(button.dataset.qtyDelta));
        return;
      }
      const removeButton = event.target.closest("[data-remove-item]");
      if (removeButton) removeItem(removeButton.dataset.removeItem);
    });
    document.getElementById("btnProceedToCheckout")?.addEventListener("click", async () => {
      try {
        await window.NellaiApi.request("customer-auth/me.php", {
          method: "GET",
          credentials: "include",
        });
        closeCart();
        location.href = `${pageBase()}checkout.html`;
      } catch (error) {
        if (error.status === 401) redirectToLogin();
        else showToast(error.message || "Unable to verify your customer session.");
      }
    });
  }

  function renderCartModal() {
    mountCartModal();
    const list = document.getElementById("modalCartList");
    const empty = document.getElementById("modalCartEmpty");
    const summary = document.getElementById("modalCartSummary");
    const total = document.getElementById("modalCartTotal");
    if (!list || !empty || !summary || !total) return;

    const items = getCart();
    list.replaceChildren();
    empty.hidden = items.length > 0;
    summary.hidden = items.length === 0;
    let subtotal = 0;

    items.forEach((item) => {
      const quantity = item.quantity;
      if (item.unit_price !== null) subtotal += item.unit_price * quantity;
      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-4 rounded-2xl border border-[#B88932]/20 bg-white p-3 shadow-sm";
      const label = item.variation_name || item.weight;
      row.innerHTML = `
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#B88932]/20 bg-[#F7F1E5]">
            <img src="${escapeHtml(productImage(item.image))}" alt="" class="h-full w-full object-cover" onerror="this.onerror=null;this.src='${escapeHtml(pageBase() + PLACEHOLDER)}';">
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="truncate font-serif text-sm font-bold text-[#32110D]">${escapeHtml(item.name)}</h4>
            <p class="text-[11px] text-[#786153]">${escapeHtml(label)}</p>
            <p class="mt-0.5 text-xs font-bold text-[#4d190e]">${item.unit_price === null ? "Price unavailable" : formatRupees(item.unit_price)}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 rounded-lg border border-[#B88932]/20 bg-[#F7F1E5] p-1">
            <button type="button" class="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-[#32110D] hover:bg-white" data-qty-delta="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="w-5 text-center text-xs font-bold text-[#32110D]">${quantity}</span>
            <button type="button" class="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-[#32110D] hover:bg-white" data-qty-delta="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="p-1 text-sm font-bold text-gray-400 transition hover:text-red-600" data-remove-item="${item.id}" aria-label="Remove item">✕</button>
        </div>`;
      list.appendChild(row);
    });
    total.textContent = formatRupees(subtotal);
    const checkoutButton = document.getElementById("btnProceedToCheckout");
    if (checkoutButton) {
      checkoutButton.disabled = items.some((item) => item.unit_price === null);
      checkoutButton.title = checkoutButton.disabled ? "A product price is unavailable." : "";
    }
  }

  function openCart() {
    mountCartModal();
    const modal = document.getElementById("cartModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    renderCartModal();
    lockScroll(true);
  }

  function closeCart() {
    const modal = document.getElementById("cartModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      modal.setAttribute("aria-hidden", "true");
    }
    lockScroll(false);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
  });
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", openCart));
    updateCartBadge();
    mountCartModal();
  });

  window.NellaiCart = {
    add: addToCart,
    open: openCart,
    close: closeCart,
    render: renderCartModal,
    updateCount: updateCartBadge,
    getItems: getCart,
    remove: removeItem,
    total: cartTotal,
    clear: () => setCart([]),
  };
  window.NellaiStore = {
    getCart,
    addToCart,
    openCart,
    closeCart,
    formatRupees,
    updateCartBadge,
    renderCartDrawer: renderCartModal,
    showToast,
    cartTotal,
  };
})();
