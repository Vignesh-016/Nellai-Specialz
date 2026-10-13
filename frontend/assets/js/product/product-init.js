(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const activeVariations = (product) => (product.variations || []).filter(
    (variation) => String(variation.status || "ACTIVE").toUpperCase() === "ACTIVE",
  );
  const formatPrice = (value) => Number.isFinite(Number(value)) && Number(value) > 0
    ? `\u20B9${Number(value).toLocaleString("en-IN")}`
    : "Price unavailable";
  const productCardPrice = (product) => {
    const prices = activeVariations(product)
      .map((variation) => Number(variation.selling_price ?? variation.price ?? variation.sale_price))
      .filter((price) => Number.isFinite(price) && price > 0);
    return formatPrice(prices.length ? Math.max(...prices) : product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price);
  };
  const oneKgVariation = (variations) => variations.find((variation) => {
    const weight = Number(variation.weight);
    const unit = String(variation.weight_unit || "").trim().toLowerCase();
    return (weight === 1 && unit === "kg")
      || (weight === 1000 && unit === "g")
      || /^1\s*kg$/i.test(String(variation.variation_name || ""));
  });

  const renderRelatedProducts = async (currentProduct) => {
    const grid = document.getElementById("relatedProductsGrid");
    if (!grid || !window.NellaiApi) return;
    try {
      const products = await window.NellaiApi.request("products/get.php?limit=100");
      const related = products.filter((product) => String(product.status || "").toUpperCase() === "ACTIVE" && String(product.id) !== String(currentProduct.id)).slice(0, 3);
      const fallback = "../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
      grid.innerHTML = related.map((product) => {
        const rawImage = product.main_image || product.image || product.images?.[0]?.image_url || product.images?.[0]?.image_path;
        const image = window.resolveBackendImageUrl?.(rawImage) || fallback;
        const oneKg = oneKgVariation(activeVariations(product));
        const oneKgBadge = oneKg ? `1 KG • ${formatPrice(oneKg.selling_price ?? oneKg.price ?? oneKg.sale_price)}` : "";
        const href = `product-detail.html?slug=${encodeURIComponent(product.slug || "")}`;
        return `<article class="flex items-center gap-4 overflow-hidden rounded-2xl border border-[#EADBC1] bg-white p-4 text-center shadow-md shadow-[#321307]/5"><a href="${href}"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" class="h-20 w-20 rounded-xl bg-[#FFFBF5] object-cover" onerror="this.onerror=null;this.src='${fallback}'"></a><div class="min-w-0 flex-1"><h3 class="font-serif text-base font-bold text-[#321307]"><a href="${href}" class="hover:text-[#8C1C13]">${escapeHtml(product.name)}</a></h3>${oneKgBadge ? `<span class="mt-2 inline-flex rounded-full border border-[#D9B86C] bg-[#FFF8EF] px-2 py-1 text-[10px] font-bold text-[#8C1C13]">${escapeHtml(oneKgBadge)}</span>` : ""}<p class="mt-2 text-sm font-bold text-[#8C1C13]">${productCardPrice(product)}</p></div></article>`;
      }).join("");
      grid.hidden = false;
    } catch (error) {
      console.error("[Product Detail] Related products failed:", error);
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const main = document.querySelector("main");
    if (main) main.hidden = true;
    const notFound = () => {
      if (main) {
        main.hidden = false;
        main.innerHTML = '<section class="max-w-2xl mx-auto px-6 py-24 text-center"><h1 class="font-serif text-4xl font-bold text-[#32110D]">Product not found</h1><a href="shop.html" class="mt-6 inline-block rounded-xl bg-[#4d190e] px-6 py-3 text-white">Back to Shop</a></section>';
      }
    };
    try {
      const product = await window.loadProductDetail?.();
      if (!product) { notFound(); return; }
      window.renderProductGallery?.(product);
      window.renderProductVariations?.(product);
      renderRelatedProducts(product);
      if (main) main.hidden = false;
      const add = document.getElementById("btnAddToCart");
      if (add) add.onclick = () => {
        const variation = window.selectedProductVariation?.();
        if ((product.variations || []).length && !variation) return;
        const quantity = Number(document.getElementById("qtyCount")?.textContent || 1);
        const variationLabel = variation ? (variation.weight != null ? `${variation.weight}${variation.weight_unit ? ` ${variation.weight_unit}` : ""}` : variation.variation_name) : "";
        window.NellaiStore?.addToCart?.({ product_id: product.id, variation_id: variation ? Number(variation.id) : null, slug: product.slug, name: product.name, image: product.main_image || product.image || product.images?.[0]?.image_url || "", variation_name: variationLabel, weight: variation?.weight || variation?.variation_name || product.weight, weight_unit: variation?.weight_unit || product.weight_unit, quantity, unit_price: variation?.selling_price ?? product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price });
      };
    } catch (error) {
      console.error("[Product Detail]", error);
      notFound();
    }
  });
})();
