/**
 * Site-wide UI: Centered Cart & Checkout Popup Modal, mobile navigation, search, account, shared cart state.
 */
(function () {
  const CART_KEY = "nellai_cart";

  function getCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("nellai:cart-updated"));
  }

  function cartCount(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  function formatRupees(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "Price to be confirmed";
    }
    return "₹" + value.toLocaleString("en-IN");
  }

  function updateCartBadge() {
    const cart = getCart();
    const count = cartCount(cart);
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find((entry) => entry.id === item.id);

    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        weight: item.weight || "",
        price: typeof item.price === "number" ? item.price : null,
        image: item.image || "",
        quantity: item.quantity || 1,
        placeholder: Boolean(item.placeholder)
      });
    }

    setCart(cart);
    updateCartBadge();
    renderCartModal();
    showToast(item.name + " added to cart");
    openCart();
  }

  function changeQty(id, delta) {
    const cart = getCart()
      .map((item) => {
        if (item.id !== id) return item;
        return { ...item, quantity: Math.max(0, (item.quantity || 1) + delta) };
      })
      .filter((item) => item.quantity > 0);

    setCart(cart);
    updateCartBadge();
    renderCartModal();
  }

  function removeItem(id) {
    const cart = getCart().filter((item) => item.id !== id);
    setCart(cart);
    updateCartBadge();
    renderCartModal();
  }

  function mountCartModal() {
    if (document.getElementById("cartModal")) return;

    const modal = document.createElement("div");
    modal.id = "cartModal";
    modal.className = "fixed inset-0 z-[75] hidden items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300";
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("role", "dialog");

    modal.innerHTML = `
    <div class="w-full max-w-2xl bg-[#FBF5E9] border border-[#B88932]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#5A160F]/15 px-6 py-4 bg-white/80">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#5A160F] text-[#D9B86C] flex items-center justify-center font-bold text-lg shadow">🛒</div>
          <div>
            <h2 class="font-serif text-xl font-bold text-[#32110D]">Your Shopping Cart &amp; Checkout</h2>
            <p class="text-[11px] text-[#B88932] font-semibold">நம்ம ஊர் அல்வா கார்ட்</p>
          </div>
        </div>
        <button type="button" id="closeCartModalBtn" class="h-10 w-10 text-xl font-bold text-[#32110D] hover:bg-[#5A160F]/10 rounded-full flex items-center justify-center transition" aria-label="Close cart">✕</button>
      </div>

      <!-- Modal Content Scroll Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        
        <!-- Cart Items Container -->
        <div id="modalCartList" class="space-y-4"></div>

        <!-- Empty State -->
        <div id="modalCartEmpty" class="text-center py-10">
          <div class="text-5xl mb-3">🛍️</div>
          <p class="font-serif text-xl font-bold text-[#32110D]">Your cart is currently empty</p>
          <p class="text-xs text-[#75675D] mt-1">Explore our authentic Tirunelveli sweets and add your favourites!</p>
        </div>

        <!-- Checkout Details Form -->
        <div id="modalCheckoutForm" hidden class="border-t border-[#5A160F]/15 pt-6 space-y-4 bg-white/70 p-5 rounded-2xl border border-[#B88932]/20">
          <h3 class="font-serif text-lg font-bold text-[#32110D] flex items-center gap-2">
            <span>📦</span> Quick Delivery Checkout Details
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-[#786153] mb-1">Your Name *</label>
              <input type="text" id="custName" placeholder="e.g. Ramesh Kumar" class="w-full bg-white border border-[#B88932]/30 rounded-xl px-3 py-2 text-xs text-[#32110D] focus:outline-none focus:border-[#5A160F]">
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-[#786153] mb-1">Phone Number *</label>
              <input type="tel" id="custPhone" placeholder="+91 70101 00590" class="w-full bg-white border border-[#B88932]/30 rounded-xl px-3 py-2 text-xs text-[#32110D] focus:outline-none focus:border-[#5A160F]">
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-[#786153] mb-1">Delivery Address &amp; Pincode *</label>
            <textarea id="custAddress" rows="2" placeholder="House/Flat No, Street, Landmark, City & Pincode" class="w-full bg-white border border-[#B88932]/30 rounded-xl px-3 py-2 text-xs text-[#32110D] focus:outline-none focus:border-[#5A160F]"></textarea>
          </div>
        </div>

      </div>

      <!-- Modal Footer / Checkout Action Bar -->
      <div id="modalCartSummary" hidden class="border-t border-[#5A160F]/15 p-5 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span class="text-xs text-[#75675D]">Subtotal Amount</span>
          <div class="flex items-baseline gap-2">
            <span id="modalCartTotal" class="font-serif text-2xl font-bold text-[#5A160F]">₹0</span>
            <span class="text-[10px] text-green-700 font-bold bg-green-100 px-2.5 py-0.5 rounded-full">Free Express Shipping</span>
          </div>
        </div>

        <button type="button" id="btnPlaceOrderWhatsApp" class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.242-1.111z"/></svg>
          Checkout &amp; Place Order
        </button>
      </div>

    </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeCartModalBtn")?.addEventListener("click", closeCart);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeCart();
    });

    document.getElementById("modalCartList")?.addEventListener("click", (event) => {
      const deltaBtn = event.target.closest("[data-qty-delta]");
      if (deltaBtn) {
        changeQty(deltaBtn.getAttribute("data-id"), Number(deltaBtn.getAttribute("data-qty-delta")));
        return;
      }
      const removeBtn = event.target.closest("[data-remove-item]");
      if (removeBtn) {
        removeItem(removeBtn.getAttribute("data-remove-item"));
      }
    });

    document.getElementById("btnPlaceOrderWhatsApp")?.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) return;

      const name = document.getElementById("custName")?.value || "Customer";
      const phone = document.getElementById("custPhone")?.value || "";
      const address = document.getElementById("custAddress")?.value || "";

      let itemListStr = cart.map(i => `• ${i.name} x ${i.quantity} = ₹${(i.price * i.quantity)}`).join('\n');
      let total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      let msg = `*New Order from Nellai Specialz Website*\n\n` +
                `*Customer:* ${name}\n` +
                `*Phone:* ${phone}\n` +
                `*Address:* ${address}\n\n` +
                `*Items Ordered:*\n${itemListStr}\n\n` +
                `*Total Amount:* ₹${total}\n\n` +
                `Please confirm my order. Thank you!`;

      let waUrl = `https://wa.me/917010100590?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    });
  }

  function renderCartModal() {
    mountCartModal();
    const list = document.getElementById("modalCartList");
    const empty = document.getElementById("modalCartEmpty");
    const checkoutForm = document.getElementById("modalCheckoutForm");
    const summary = document.getElementById("modalCartSummary");
    const totalEl = document.getElementById("modalCartTotal");

    if (!list || !empty || !summary) return;

    const cart = getCart();
    list.innerHTML = "";

    if (cart.length === 0) {
      empty.hidden = false;
      if (checkoutForm) checkoutForm.hidden = true;
      summary.hidden = true;
      return;
    }

    empty.hidden = true;
    if (checkoutForm) checkoutForm.hidden = false;
    summary.hidden = false;

    let total = 0;

    cart.forEach((item) => {
      const itemPrice = typeof item.price === "number" ? item.price : 0;
      total += itemPrice * item.quantity;

      const row = document.createElement("div");
      row.className = "flex items-center justify-between gap-4 p-3 bg-white rounded-2xl border border-[#B88932]/20 shadow-sm";
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#B88932]/20 bg-[#F7F1E5]">
            ${item.image ? `<img src="${item.image}" alt="" class="h-full w-full object-cover">` : '<div class="h-full w-full flex items-center justify-center text-xs">🍬</div>'}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-serif font-bold text-sm text-[#32110D] truncate">${item.name}</h4>
            <p class="text-[11px] text-[#786153]">${item.weight || ""}</p>
            <p class="text-xs font-bold text-[#5A160F] mt-0.5">${formatRupees(itemPrice)}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-[#F7F1E5] rounded-lg p-1 border border-[#B88932]/20">
            <button type="button" class="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#32110D] hover:bg-white rounded" data-qty-delta="-1" data-id="${item.id}">−</button>
            <span class="w-5 text-center text-xs font-bold text-[#32110D]">${item.quantity}</span>
            <button type="button" class="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#32110D] hover:bg-white rounded" data-qty-delta="1" data-id="${item.id}">+</button>
          </div>

          <button type="button" data-remove-item="${item.id}" class="text-gray-400 hover:text-red-600 p-1 text-sm font-bold" aria-label="Remove item">✕</button>
        </div>
      `;
      list.appendChild(row);
    });

    if (totalEl) {
      totalEl.textContent = formatRupees(total);
    }
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
    toast.className = "pointer-events-auto border border-[#B88932]/40 bg-[#32110D] px-4 py-3 text-sm text-[#FBF5E9] shadow-2xl rounded-xl flex items-center gap-2";
    toast.innerHTML = `<span>✓</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }

  function lockScroll(lock) {
    document.body.classList.toggle("overflow-hidden", lock);
  }

  function openDrawer(drawer, backdrop) {
    if (!drawer) return;
    drawer.classList.remove("translate-x-full");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.classList.remove("hidden");
    lockScroll(true);
  }

  function closeDrawer(drawer, backdrop) {
    if (!drawer) return;
    drawer.classList.add("translate-x-full");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.classList.add("hidden");
    if (!document.querySelector("[data-drawer]:not(.translate-x-full)")) {
      lockScroll(false);
    }
  }

  function openCart() {
    mountCartModal();
    const modal = document.getElementById("cartModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      modal.setAttribute("aria-hidden", "false");
      renderCartModal();
      lockScroll(true);
    }
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

  function initMobileNav() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const closeBtn = document.getElementById("closeMobileNav");
    const drawer = document.getElementById("mobileDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    if (!menuBtn || !drawer) return;

    menuBtn.addEventListener("click", () => openDrawer(drawer, backdrop));
    if (closeBtn) closeBtn.addEventListener("click", () => closeDrawer(drawer, backdrop));
    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeDrawer(drawer, backdrop));
    });
  }

  function initCartDrawer() {
    const openBtns = document.querySelectorAll("[data-open-cart]");
    openBtns.forEach((btn) => btn.addEventListener("click", openCart));
  }

  function initSearch() {
    const modal = document.getElementById("searchModal");
    const closeBtn = document.getElementById("closeSearchModal");
    const input = document.getElementById("searchInput");
    document.querySelectorAll("[data-open-search]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!modal) return;
        closeDrawer(document.getElementById("mobileDrawer"), document.getElementById("drawerBackdrop"));
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modal.setAttribute("aria-hidden", "false");
        input?.focus();
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", closeSearch);
  }

  function closeSearch() {
    const modal = document.getElementById("searchModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  }

  function initAccount() {
    const modal = document.getElementById("accountModal");
    const closeBtn = document.getElementById("closeAccountModal");
    document.querySelectorAll("[data-open-account]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!modal) return;
        closeDrawer(document.getElementById("mobileDrawer"), document.getElementById("drawerBackdrop"));
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        modal.setAttribute("aria-hidden", "false");
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", closeAccount);
  }

  function closeAccount() {
    const modal = document.getElementById("accountModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeCart();
    closeDrawer(document.getElementById("mobileDrawer"), document.getElementById("drawerBackdrop"));
    closeSearch();
    closeAccount();
  });

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initCartDrawer();
    initSearch();
    initAccount();
    updateCartBadge();
    mountCartModal();
  });

  window.NellaiStore = {
    getCart,
    addToCart,
    openCart,
    closeCart,
    formatRupees,
    updateCartBadge,
    renderCartDrawer: renderCartModal,
    showToast
  };
})();
