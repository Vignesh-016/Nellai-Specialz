window.loadProductDetail = async () => {
  const slug = new URLSearchParams(location.search).get("slug");
  if (!slug) return null;
  const p = await NellaiApi.request(
    `products/get.php?slug=${encodeURIComponent(slug)}`,
  );
  document.title = `${p.name} | Nellai Specialz`;
  const h = document.querySelector("h1");
  if (h) h.textContent = p.name || "";
  const short = document
    .querySelector("#displayPrice")
    ?.closest(".mt-4")?.nextElementSibling;
  if (short) short.textContent = p.short_description || "";
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
  fill(ingredients, p.key_ingredients);
  fill(storage, p.storage_shelf_life);
  document.querySelectorAll('span').forEach(node => { if (/148 Verified|Authentic Recipe|100% Pure Ghee|Save 20%/i.test(node.textContent)) node.remove(); });
  const rating = [...document.querySelectorAll('div,span')].find(node => /Verified Buyer Reviews/i.test(node.textContent)); if (rating) rating.remove();
  document.querySelector('.font-tamil')?.remove();
  document.getElementById('productTrustFeatures')?.remove();
  document.getElementById('productTamilSubtitle')?.remove();
  const reviewForm = document.getElementById('reviewForm'); reviewForm?.closest('.mt-10')?.remove();
  return p;
};
