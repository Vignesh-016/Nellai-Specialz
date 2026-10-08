(() => {
  const API = "https://backend.nellaispecialz.com/api/";
  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const esc = (v) =>
    String(v ?? "").replace(
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
  async function get(path) {
    const r = await fetch(API + path, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    const j = await r.json();
    if (!r.ok || !j.success)
      throw Error(j.message || "Unable to load catalogue");
    return j.data;
  }
  const card = (p) =>
    `<article class="product-card group bg-white rounded-2xl border border-[#B88932]/20 overflow-hidden shadow-xs flex flex-col"><a href="product-detail.html?slug=${encodeURIComponent(p.slug)}" class="block"><div class="aspect-square overflow-hidden"><img src="${esc(p.main_image || p.image || "../assets/images/products/classic-halwa.jpg")}" alt="${esc(p.name)}" class="w-full h-full object-cover" loading="lazy"></div><div class="p-4"><span class="text-[11px] font-bold uppercase text-[#B88932]">${esc(p.ingredient_type || "Traditional sweet")}</span><h3 class="mt-1 font-serif text-lg font-bold text-[#32110D]">${esc(p.name)}</h3><p class="text-xs text-[#786153]">${esc(p.weight || "")} ${esc(p.weight_unit || "")}</p><p class="mt-2 font-bold text-[#4d190e]">${money(p.offer_price || p.selling_price || p.price)} ${p.strike_price ? `<del class="ml-2 text-xs font-normal text-gray-500">${money(p.strike_price)}</del>` : ""}</p></div></a></article>`;
  async function shop() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    grid.innerHTML = `<p class="col-span-full py-12 text-center text-[#786153]">Loading products...</p>`;
    try {
      const products = await get("products/get.php?limit=100");
      grid.innerHTML = products.length
        ? products.map(card).join("")
        : `<p class="col-span-full py-12 text-center text-[#786153]">No products available.</p>`;
      document
        .querySelectorAll(
          "#shopSearchInput,#toggleFilterModal,#priceSlider,#sortSelect",
        )
        .forEach((x) => x.closest("div")?.classList.add("hidden"));
    } catch {
      grid.innerHTML = `<p class="col-span-full py-12 text-center text-red-700">Could not load products.</p>`;
    }
  }
  async function detail() {
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) return;
    try {
      const p = await get(`products/get.php?slug=${encodeURIComponent(slug)}`);
      document.title = `${p.name} | Nellai Specialz`;
      const h = document.querySelector("h1");
      if (h) h.textContent = p.name;
      const price = document.getElementById("displayPrice");
      if (price) price.textContent = money(p.offer_price || p.selling_price);
      const mrp = document.getElementById("displayMRP");
      if (mrp) {
        mrp.textContent = p.strike_price ? money(p.strike_price) : "";
      }
      const desc = document
        .querySelector("h1")
        ?.parentElement?.querySelector("p:last-of-type");
      if (desc && p.short_description) desc.textContent = p.short_description;
      const main = document.querySelector("main img");
      if (main && p.main_image) main.src = p.main_image;
      const vars = document.getElementById("weightSelector");
      if (vars && p.variations?.length)
        vars.innerHTML = p.variations
          .map(
            (v) =>
              `<button type="button" class="weight-opt px-3 py-2.5 rounded-xl border border-[#B88932]/30 text-xs font-semibold" data-price="${v.selling_price}">${esc(v.variation_name)}<span class="block">${money(v.selling_price)}</span></button>`,
          )
          .join("");
    } catch {
      const h = document.querySelector("h1");
      if (h) h.textContent = "Product not found";
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    shop();
    detail();
  });
})();
