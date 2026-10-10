window.initHomeProducts = async () => {
  const grid = document.querySelector("[data-home-products]");
  if (!grid) return;
  grid.hidden = false;
  grid.textContent = "Loading products…";
  if (!window.NellaiApi) {
    grid.textContent = "Products could not be loaded. Please refresh and try again.";
    return;
  }
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const image = (s) =>
    !s
      ? ""
      : /^https?:\/\//i.test(s)
        ? s
        : `https://backend.nellaispecialz.com/${String(s).replace(/^\//, "")}`;
  try {
    const all = await window.NellaiApi.request("products/get.php?limit=100");
    const active = all.filter(
      (p) => String(p.status || "").toLowerCase() === "active",
    );
    const featured = active.filter((p) => Number(p.featured) === 1);
    const seen = new Set();
    const products = (featured.length ? featured : active)
      .filter((p) => !seen.has(p.id) && seen.add(p.id))
      .slice(0, 4);
    if (!products.length) {
      grid.textContent = "No products available.";
      return;
    }
    grid.innerHTML = products
      .map((p) => {
        const vars = (p.variations || []).filter(
          (v) => String(v.status || "ACTIVE").toLowerCase() === "active",
        );
        const prices = vars
          .map((v) => Number(v.selling_price ?? v.price ?? v.sale_price))
          .filter((v) => Number.isFinite(v) && v > 0);
        const fallbackPrice = Number(p.selling_price ?? p.sale_price ?? p.offer_price);
        const minPrice = prices.length ? Math.min(...prices) : fallbackPrice;
        const maxPrice = prices.length ? Math.max(...prices) : fallbackPrice;
        const formatPrice = (value) => Number.isFinite(value) && value > 0
          ? `₹${value.toLocaleString("en-IN")}`
          : "Price unavailable";
        const priceLabel = Number.isFinite(minPrice) && minPrice > 0
          ? (minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`)
          : "Price unavailable";
        const v = vars[0];
        const weight = vars.length > 1
          ? `${vars.length} Sizes`
          : (v?.weight || v?.variation_name || [p.weight, p.weight_unit].filter(Boolean).join(" "));
        const src =
          image(
            [
              p.main_image,
              p.image,
              ...(p.images || []).map((x) => x.image_url || x.image_path || x),
            ].find(Boolean),
          ) || "assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
        const href = `pages/product-detail.html?slug=${encodeURIComponent(p.slug || "")}`;
        const badge = p.badge || p.ingredient_type || "";
        return `<div class="group flex flex-col justify-between relative h-full"><a href="${href}" class="block relative z-10 mx-auto w-[90%] mb-3 overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-105"><img src="${src}" alt="${esc(p.name)}" class="h-[240px] sm:h-[280px] lg:h-[340px] w-full object-cover object-top rounded-xl shadow-xs" style="object-position: center top;">${badge ? `<span class="absolute top-3 left-3 z-20 rounded-full bg-[#8C1C13] px-2.5 py-0.5 text-[10px] font-bold text-[#FFF8EF] shadow-xs">${esc(badge)}</span>` : ""}</a><div class="p-4 rounded-2xl border border-[#EADBC1] bg-[#FFFBF5] shadow-xs flex-1 flex flex-col justify-between group-hover:border-[#8C1C13]/40 group-hover:shadow-md transition-all"><div class="flex items-center justify-between gap-2"><a href="${href}" class="font-serif text-xl font-bold text-[#32110D] hover:text-[#8C1C13] transition">${esc(p.name)}</a>${weight ? `<span class="font-sans tabular-nums text-[10px] font-bold text-[#8C1C13] bg-[#8C1C13]/10 px-2 py-0.5 rounded-md">${esc(weight)}</span>` : ""}</div><div class="mt-4 pt-3 border-t border-[#EADBC1]"><div class="flex items-baseline justify-between mb-2.5"><span class="text-[11px] font-semibold text-[#5C3A21]">Price</span><strong class="font-sans tabular-nums text-xl font-bold text-[#32110D]">${priceLabel}</strong></div><a href="${href}" class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C1C13] py-2.5 text-xs font-bold text-[#FFF8EF] shadow-xs transition-all duration-200 hover:bg-[#7A120A]">View Product →</a></div></div></div>`;
      })
      .join("");
  } catch (e) {
    console.error("[Home] Products API failed:", e);
    grid.textContent = e.message || "Products could not be loaded. Please refresh and try again.";
  }
};
