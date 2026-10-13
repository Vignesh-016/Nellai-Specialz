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
  const highestPricedVariation = (product) => activeVariations(product)
    .filter((variation) => Number.isFinite(Number(variation.selling_price ?? variation.price ?? variation.sale_price)))
    .reduce((highest, variation) => {
      const price = Number(variation.selling_price ?? variation.price ?? variation.sale_price);
      const highestPrice = Number(highest?.selling_price ?? highest?.price ?? highest?.sale_price);
      return !highest || price > highestPrice ? variation : highest;
    }, null);
  const variationLabel = (variation) => {
    if (!variation) return "";
    let weight = Number(variation.weight);
    let unit = String(variation.weight_unit || "").trim().toUpperCase();
    if (!Number.isFinite(weight) || !unit) {
      const match = String(variation.variation_name || "").trim().match(/^(\d+(?:\.\d+)?)\s*(G|KG)$/i);
      if (match) {
        weight = Number(match[1]);
        unit = match[2].toUpperCase();
      }
    }
    if (weight === 1000 && unit === "G") return "1 KG";
    return Number.isFinite(weight) && weight > 0 && unit ? `${weight} ${unit}` : "";
  };

  window.getProductDisplayPrice = (product) => {
    const variation = highestPricedVariation(product);
    return variation
      ? formatPrice(variation.selling_price ?? variation.price ?? variation.sale_price)
      : formatPrice(product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price);
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
        const highestVariation = highestPricedVariation(product);
        const highestPrice = highestVariation
          ? highestVariation.selling_price ?? highestVariation.price ?? highestVariation.sale_price
          : product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price;
        const highestLabel = variationLabel(highestVariation);
        const slug = encodeURIComponent(product.slug || "");
        return `<article class="product-card group flex h-full flex-col overflow-hidden rounded-2xl border border-[#EADBC1] bg-white shadow-md shadow-[#321307]/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"><a href="product-detail.html?slug=${slug}" class="flex flex-1 flex-col"><div class="product-card-img-wrap relative aspect-square overflow-hidden bg-[#FFFBF5]"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105" style="object-position:center top;" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}';"></div><div class="flex flex-1 flex-col p-5 text-center"><div><h3 class="font-serif text-xl font-bold text-[#321307] transition-colors group-hover:text-[#8C1C13]">${escapeHtml(product.name)}</h3>${product.short_description ? `<p class="mt-2 line-clamp-2 text-xs leading-relaxed text-[#806B58]">${escapeHtml(product.short_description)}</p>` : ""}</div><div class="mt-auto flex items-end justify-between gap-4 border-t border-[#EADBC1] pt-3 text-left"><span class="min-w-0 text-sm font-semibold uppercase tracking-wide text-[#806B58]">${escapeHtml(highestLabel)}</span><strong class="shrink-0 font-sans text-xl font-bold tabular-nums text-[#8C1C13]">${formatPrice(highestPrice)}</strong></div></div></a></article>`;
      }).join("");
    } catch (error) {
      console.error("[Shop] Products API failed:", error);
      grid.textContent = error.message || "Products could not be loaded. Please refresh and try again.";
    }
  };
})();
