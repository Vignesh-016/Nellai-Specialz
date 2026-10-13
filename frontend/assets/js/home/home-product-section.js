window.initHomeProducts = async () => {
  const grid = document.querySelector("[data-home-products]");
  if (!grid) return;
  grid.hidden = false;
  grid.textContent = "Loading products…";
  if (!window.NellaiApi) {
    grid.textContent = "Products could not be loaded. Please refresh and try again.";
    return;
  }
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const image = (value) => window.resolveBackendImageUrl?.(value) || "";
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
  try {
    const all = await window.NellaiApi.request("products/get.php?limit=100");
    const active = all.filter((product) => String(product.status || "").toUpperCase() === "ACTIVE");
    const featured = active.filter((product) => Number(product.featured) === 1);
    const seen = new Set();
    const products = (featured.length ? featured : active)
      .filter((product) => !seen.has(product.id) && seen.add(product.id))
      .slice(0, 4);
    if (!products.length) {
      grid.textContent = "No products available.";
      return;
    }
    grid.innerHTML = products.map((product) => {
      const variations = activeVariations(product);
      const prices = variations.map((variation) => Number(variation.selling_price ?? variation.price ?? variation.sale_price))
        .filter((price) => Number.isFinite(price) && price > 0);
      const fallbackPrice = Number(product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price);
      const displayedPrice = prices.length ? Math.max(...prices) : fallbackPrice;
      const oneKg = oneKgVariation(variations);
      const oneKgBadge = oneKg ? `1 KG • ${formatPrice(oneKg.selling_price ?? oneKg.price ?? oneKg.sale_price)}` : "";
      const source = image([product.main_image, product.image, ...(product.images || []).map((item) => item.image_url || item.image_path || item)].find(Boolean))
        || "assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
      const href = `pages/product-detail.html?slug=${encodeURIComponent(product.slug || "")}`;
      return `<div class="group relative flex h-full flex-col justify-between"><a href="${href}" class="relative z-10 mx-auto mb-3 block w-[90%] overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-105"><img src="${source}" alt="${esc(product.name)}" class="h-[240px] w-full rounded-xl object-cover object-top shadow-xs sm:h-[280px] lg:h-[340px]" style="object-position:center top;"></a><div class="flex flex-1 flex-col justify-between rounded-2xl border border-[#EADBC1] bg-[#FFFBF5] p-4 text-center shadow-xs transition-all group-hover:border-[#8C1C13]/40 group-hover:shadow-md"><div><a href="${href}" class="block font-serif text-xl font-bold text-[#32110D] transition hover:text-[#8C1C13]">${esc(product.name)}</a>${oneKgBadge ? `<span class="mt-2 inline-flex rounded-full border border-[#D9B86C] bg-[#FFF8EF] px-2.5 py-1 text-[10px] font-bold text-[#8C1C13]">${esc(oneKgBadge)}</span>` : ""}</div><div class="mt-4 border-t border-[#EADBC1] pt-3"><div class="mb-2.5 flex items-baseline justify-between"><span class="text-[11px] font-semibold text-[#5C3A21]">Price</span><strong class="font-sans text-xl font-bold tabular-nums text-[#32110D]">${formatPrice(displayedPrice)}</strong></div><a href="${href}" class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C1C13] py-2.5 text-xs font-bold text-[#FFF8EF] transition-all duration-200 hover:bg-[#7A120A]">View Product →</a></div></div></div>`;
    }).join("");
  } catch (error) {
    console.error("[Home] Products API failed:", error);
    grid.textContent = error.message || "Products could not be loaded. Please refresh and try again.";
  }
};
