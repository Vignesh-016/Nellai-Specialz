/**
 * Site-wide UI: mobile navigation, search, account, cart drawer, shared cart state.
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
    renderCartDrawer();
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
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const list = document.getElementById("cartList");
    const empty = document.getElementById("cartEmpty");
    const summary = document.getElementById("cartSummary");
    if (!list || !empty || !summary) return;

    const cart = getCart();
    list.innerHTML = "";

    if (cart.length === 0) {
      empty.hidden = false;
      summary.hidden = true;
      return;
    }

    empty.hidden = true;
    summary.hidden = false;

    let pricedTotal = 0;
    let hasUnpriced = false;

    cart.forEach((item) => {
      if (typeof item.price === "number") {
        pricedTotal += item.price * item.quantity;
      } else {
        hasUnpriced = true;
      }

      const row = document.createElement("article");
      row.className = "flex gap-3 border-b border-brand-primary/10 py-4";
      row.innerHTML = `
        <div class="h-16 w-16 shrink-0 overflow-hidden border border-brand-primary/10 bg-brand-cream">
          ${item.image ? `<img src="${item.image}" alt="" class="h-full w-full object-cover">` : ""}
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-display text-lg leading-tight text-brand-dark">${item.name}</h3>
          <p class="mt-0.5 text-xs text-brand-muted">${item.weight || "Weight to be confirmed"}</p>
          <p class="mt-1 text-sm font-medium">${formatRupees(item.price)}</p>
          <div class="mt-2 flex items-center gap-2">
            <button type="button" class="inline-flex h-8 w-8 items-center justify-center border border-brand-primary/20" data-qty-delta="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="min-w-[1.5rem] text-center text-sm">${item.quantity}</span>
            <button type="button" class="inline-flex h-8 w-8 items-center justify-center border border-brand-primary/20" data-qty-delta="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
      `;
      list.appendChild(row);
    });

    const totalEl = document.getElementById("cartTotal");
    const noteEl = document.getElementById("cartNote");
    if (totalEl) {
      totalEl.textContent = hasUnpriced && pricedTotal === 0
        ? "To be confirmed"
        : formatRupees(pricedTotal) + (hasUnpriced ? " +" : "");
    }
    if (noteEl) {
      noteEl.hidden = !hasUnpriced;
    }
  }

  function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-2";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto border border-brand-gold/40 bg-brand-dark px-4 py-3 text-sm text-brand-cream shadow-heritage";
    toast.textContent = message;
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
    openDrawer(document.getElementById("cartDrawer"), document.getElementById("drawerBackdrop"));
  }

  function closeCart() {
    closeDrawer(document.getElementById("cartDrawer"), document.getElementById("drawerBackdrop"));
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
    const closeBtn = document.getElementById("closeCartDrawer");
    const backdrop = document.getElementById("drawerBackdrop");
    const list = document.getElementById("cartList");

    openBtns.forEach((btn) => btn.addEventListener("click", openCart));
    if (closeBtn) closeBtn.addEventListener("click", closeCart);
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        closeCart();
        closeDrawer(document.getElementById("mobileDrawer"), backdrop);
        closeSearch();
        closeAccount();
      });
    }
    if (list) {
      list.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-qty-delta]");
        if (!btn) return;
        changeQty(btn.getAttribute("data-id"), Number(btn.getAttribute("data-qty-delta")));
      });
    }
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
    if (input) {
      input.addEventListener("input", () => {
        window.dispatchEvent(new CustomEvent("nellai:search", { detail: input.value }));
      });
    }
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
    renderCartDrawer();
  });

  window.NellaiStore = {
    getCart,
    addToCart,
    formatRupees,
    updateCartBadge,
    renderCartDrawer,
    showToast
  };
})();
