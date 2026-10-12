window.loadProductDetail = async () => {
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) return null;
  const p = await NellaiApi.request(
    `products/get.php?slug=${encodeURIComponent(slug)}`,
  );
  document.title = `${p.name} | Nellai Specialz`;
  const badge = document.getElementById("productHighlightBadge");
  if (badge) {
    const text = String(p.highlight_badge || "").trim();
    badge.textContent = text;
    badge.hidden = !text;
  }
  const shipping = document.getElementById("productShippingDays");
  if (shipping && [10, 15, 20].includes(Number(p.shipping_days))) {
    shipping.querySelector("[data-shipping-days]").textContent = `${Number(p.shipping_days)} days`;
    shipping.hidden = false;
  }
  const h = document.querySelector("h1");
  if (h) h.textContent = p.name || "";
  const short = document.getElementById("productShortDescription");
  if (short) {
    short.textContent = p.short_description || "";
    short.hidden = !String(p.short_description || "").trim();
  }
  const description =
    document.querySelector("[data-product-description]") ||
    [...document.querySelectorAll("section p")].find((x) =>
      x.textContent.includes("world-renowned"),
    );
  if (description)
    description.textContent = p.description || p.short_description || "";
  const blocks = [...document.querySelectorAll("h3")];
  const ingredients = blocks.find((x) =>
    /Key Ingredients/i.test(x.textContent),
  )?.parentElement;
  const storage = blocks.find((x) =>
    /Storage & Shelf Life/i.test(x.textContent),
  )?.parentElement;
  const fill = (block, value) => {
    if (!block) return;
    const lines = String(value || "")
      .trim()
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
    block.style.display = lines.length ? "" : "none";
    const ul = block.querySelector("ul");
    if (ul) ul.innerHTML = lines.map((x) => `<li>${x}</li>`).join("");
  };
  const ingredientLines = String(p.key_ingredients || "").trim().split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const topIngredients = document.getElementById("productKeyIngredientsTop");
  if (topIngredients) {
    topIngredients.querySelector("ul").innerHTML = ingredientLines.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
    topIngredients.hidden = ingredientLines.length === 0;
  }
  document.getElementById("productKeyIngredientsLower")?.remove();
  fill(storage, p.storage_shelf_life);
  document.querySelectorAll('span').forEach(node => { if (/148 Verified|Save 20%/i.test(node.textContent)) node.remove(); });
  const rating = [...document.querySelectorAll('div,span')].find(node => /Verified Buyer Reviews/i.test(node.textContent)); if (rating) rating.remove();
  document.querySelector('.font-tamil')?.remove();
  document.getElementById('productTrustFeatures')?.remove();
  document.getElementById('productTamilSubtitle')?.remove();
  const reviewForm = document.getElementById('reviewForm'); reviewForm?.closest('.mt-10')?.remove();
  return p;
};
