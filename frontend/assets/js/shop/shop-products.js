(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const fallbackImage = "../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
  const activeVariations = (product) => (product.variations || []).filter(
    (variation) => String(variation.status || "ACTIVE").toUpperCase() === "ACTIVE",
  );
  const formatPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0
    ? `\u20B9${Number(value).toLocaleString("en-IN")}`
    : "Price unavailable";
  const oneKgVariation = (variations) => variations.find((variation) => {
    const weight = Number(variation.weight);
    const unit = String(variation.weight_unit || "").trim().toLowerCase();
    return (weight === 1 && unit === "kg")
      || (weight === 1000 && unit === "g")
      || /^1\s*kg$/i.test(String(variation.variation_name || ""));
  });

  window.getProductDisplayPrice = (product) => {
    const prices = activeVariations(product)
      .map((variation) => Number(variation.selling_price ?? variation.price ?? variation.sale_price))
      .filter((price) => Number.isFinite(price) && price > 0);
    if (prices.length) return formatPrice(Math.max(...prices));
    return formatPrice(product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price);
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
      const active = products.filter((product) => String(product.status || "").toUpperCase() === "ACTIVE");
      if (!active.length) {
        grid.textContent = "No products available.";
        return;
      }
      grid.innerHTML = active.map((product) => {
        const gallery = Array.isArray(product.images) ? product.images : [];
        const source = [product.main_image, product.image, ...gallery.map((image) => image.image_url || image.image_path || image)].find(Boolean);
        const image = window.resolveBackendImageUrl?.(source) || fallbackImage;
        const oneKg = oneKgVariation(activeVariations(product));
        const oneKgBadge = oneKg ? `1 KG • ${formatPrice(oneKg.selling_price ?? oneKg.price ?? oneKg.sale_price)}` : "";
        const slug = encodeURIComponent(product.slug || "");
        return `<article class="product-card group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EADBC1] bg-white shadow-md shadow-[#321307]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"><a href="product-detail.html?slug=${slug}"><div class="product-card-img-wrap relative aspect-square overflow-hidden bg-[#FFFBF5]"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105" style="object-position:center top;" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}';"></div><div class="flex flex-1 flex-col justify-between p-5 text-center"><div><h3 class="font-serif text-xl font-bold text-[#321307] transition-colors group-hover:text-[#8C1C13]">${escapeHtml(product.name)}</h3>${oneKgBadge ? `<span class="mt-2 inline-flex rounded-full border border-[#D9B86C] bg-[#FFF8EF] px-2.5 py-1 text-[10px] font-bold text-[#8C1C13]">${escapeHtml(oneKgBadge)}</span>` : ""}${product.short_description ? `<p class="mt-2 line-clamp-2 text-xs leading-relaxed text-[#806B58]">${escapeHtml(product.short_description)}</p>` : ""}<p class="mt-3 font-sans text-lg font-bold tabular-nums text-[#8C1C13]">${window.getProductDisplayPrice(product)}</p></div></div></a></article>`;
      }).join("");
    } catch (error) {
      console.error("[Shop] Products API failed:", error);
      grid.textContent = error.message || "Products could not be loaded. Please refresh and try again.";
    }
  };
})();
