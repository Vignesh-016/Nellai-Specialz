(() => {
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  const fallbackImage = "../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";

  window.normalizeStorefrontImage = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${window.NellaiApi?.API_BASE_URL || "https://backend.nellaispecialz.com"}/${String(path).replace(/^\/+/, "")}`;
  };

  window.getProductDisplayPrice = (product) => {
    const prices = (product.variations || [])
      .filter((variation) => String(variation.status || "ACTIVE").toLowerCase() === "active")
      .map((variation) => Number(variation.selling_price ?? variation.price ?? variation.sale_price))
      .filter((price) => Number.isFinite(price) && price > 0);
    if (prices.length) {
      const minimum = Math.min(...prices);
      const maximum = Math.max(...prices);
      return minimum === maximum
        ? `₹${minimum.toLocaleString("en-IN")}`
        : `₹${minimum.toLocaleString("en-IN")} – ₹${maximum.toLocaleString("en-IN")}`;
    }
    const price = Number(product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price);
    return Number.isFinite(price) && price > 0
      ? `₹${price.toLocaleString("en-IN")}`
      : "Price unavailable";
  };

  window.loadShopProducts = async (categoryId = null) => {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    grid.hidden = false;
    grid.textContent = "Loading products…";
    if (!window.NellaiApi) {
      grid.textContent = "Products could not be loaded. Please refresh and try again.";
      return;
    }

    try {
      const query = `products/get.php?limit=100${categoryId ? `&category_id=${encodeURIComponent(categoryId)}` : ""}`;
      const products = await window.NellaiApi.request(query);
      const active = products.filter((product) => String(product.status || "").toLowerCase() === "active");
      if (!active.length) {
        grid.textContent = "No products available.";
        return;
      }

      grid.innerHTML = active.map((product) => {
        const gallery = Array.isArray(product.images) ? product.images : [];
        const rawImage = [
          product.main_image,
          product.image,
          ...gallery.map((image) => image.image_url || image.image_path || image),
        ].find(Boolean);
        const image = window.normalizeStorefrontImage(rawImage) || fallbackImage;
        const variation = (product.variations || []).find(
          (item) => String(item.status || "ACTIVE").toLowerCase() === "active",
        );
        const weight = variation?.weight
          || variation?.variation_name
          || [product.weight, product.weight_unit].filter(Boolean).join(" ");
        const slug = encodeURIComponent(product.slug || "");
        return `
          <article class="product-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EADBC1] bg-white shadow-md shadow-[#321307]/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <a href="product-detail.html?slug=${slug}">
              <div class="product-card-img-wrap relative aspect-square overflow-hidden bg-[#FFFBF5]">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}';">
              </div>
              <div class="flex flex-1 flex-col justify-between p-5 text-left">
                <div>
                  <h3 class="font-serif text-xl font-bold text-[#321307] group-hover:text-[#8C1C13] transition-colors">${escapeHtml(product.name)}</h3>
                  ${product.short_description ? `<p class="mt-1 line-clamp-2 text-xs leading-relaxed text-[#806B58]">${escapeHtml(product.short_description)}</p>` : ""}
                  ${weight ? `<p class="mt-2 text-xs text-[#806B58]">${escapeHtml(weight)}</p>` : ""}
                  <p class="mt-3 font-serif text-lg font-bold text-[#8C1C13]">${window.getProductDisplayPrice(product)}</p>
                </div>
              </div>
            </a>
          </article>`;
      }).join("");
    } catch (error) {
      console.error("[Shop] Products API failed:", error);
      grid.textContent = error.message || "Products could not be loaded. Please refresh and try again.";
    }
  };
})();
