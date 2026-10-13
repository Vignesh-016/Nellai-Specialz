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
      const highestVariation = highestPricedVariation(product);
      const highestPrice = highestVariation
        ? highestVariation.selling_price ?? highestVariation.price ?? highestVariation.sale_price
        : product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price;
      const highestLabel = variationLabel(highestVariation);
      const source = image([product.main_image, product.image, ...(product.images || []).map((item) => item.image_url || item.image_path || item)].find(Boolean))
        || "assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
      const href = `pages/product-detail.html?slug=${encodeURIComponent(product.slug || "")}`;
      return `<div class="group relative flex h-full flex-col"><a href="${href}" class="relative z-10 mx-auto mb-3 block w-[90%] overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-105"><img src="${source}" alt="${esc(product.name)}" class="h-[240px] w-full rounded-xl object-cover object-top shadow-xs sm:h-[280px] lg:h-[340px]" style="object-position:center top;"></a><div class="flex flex-1 flex-col rounded-2xl border border-[#EADBC1] bg-[#FFFBF5] p-4 text-center shadow-xs transition-all group-hover:border-[#8C1C13]/40 group-hover:shadow-md"><a href="${href}" class="block font-serif text-xl font-bold text-[#32110D] transition hover:text-[#8C1C13]">${esc(product.name)}</a><div class="mt-auto flex items-end justify-between gap-4 border-t border-[#EADBC1] pt-3 text-left"><span class="min-w-0 text-sm font-semibold uppercase tracking-wide text-[#806B58]">${esc(highestLabel)}</span><strong class="shrink-0 font-sans text-xl font-bold tabular-nums text-[#8C1C13]">${formatPrice(highestPrice)}</strong></div><a href="${href}" class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C1C13] py-2.5 text-xs font-bold text-[#FFF8EF] transition-all duration-200 hover:bg-[#7A120A]">View Product →</a></div></div>`;
    }).join("");
  } catch (error) {
    console.error("[Home] Products API failed:", error);
    grid.textContent = error.message || "Products could not be loaded. Please refresh and try again.";
  }
};
