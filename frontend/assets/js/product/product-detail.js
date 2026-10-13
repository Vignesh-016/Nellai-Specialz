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
  document.querySelector('.product-static-rating')?.remove();
  document.querySelector('.font-tamil')?.remove();
  document.getElementById('productTrustFeatures')?.remove();
  document.getElementById('productTamilSubtitle')?.remove();

  const whyPoints = String(p.why_nellai_specialz || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const descriptionButton = document.getElementById('productDescriptionTabButton');
  const descriptionPanel = document.getElementById('productDescriptionTabPanel');
  const whyButton = document.getElementById('productWhyTabButton');
  const whyPanel = document.getElementById('productWhyTabPanel');
  const whyGrid = document.getElementById('productWhyNellaiGrid');
  if (descriptionButton && descriptionPanel && whyButton && whyPanel && whyGrid) {
    const selectTab = (tab) => {
      const isWhy = tab === 'why';
      descriptionPanel.hidden = isWhy;
      whyPanel.hidden = !isWhy;
      descriptionButton.setAttribute('aria-selected', String(!isWhy));
      whyButton.setAttribute('aria-selected', String(isWhy));
      descriptionButton.className = `tab-btn shrink-0 pb-3 px-4 focus:outline-none cursor-pointer ${!isWhy ? 'active border-b-2 border-[#8C1C13] text-[#8C1C13]' : 'text-[#806B58] hover:text-[#8C1C13]'}`;
      whyButton.className = `tab-btn shrink-0 pb-3 px-4 focus:outline-none cursor-pointer ${isWhy ? 'active border-b-2 border-[#8C1C13] text-[#8C1C13]' : 'text-[#806B58] hover:text-[#8C1C13]'}`;
    };
    if (whyPoints.length) {
      whyGrid.replaceChildren(...whyPoints.map((point) => {
        const item = document.createElement('div');
        item.className = 'flex items-start gap-3 rounded-xl border border-[#EADBC1] bg-[#FFFBF5] px-4 py-3 text-sm leading-relaxed text-[#321307]';
        const mark = document.createElement('span');
        mark.className = 'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#8C1C13] text-xs font-bold text-[#FFF8EF]';
        mark.textContent = '✓';
        const text = document.createElement('span');
        text.textContent = point;
        item.append(mark, text);
        return item;
      }));
      whyButton.hidden = false;
      whyButton.addEventListener('click', () => selectTab('why'));
      descriptionButton.addEventListener('click', () => selectTab('description'));
      selectTab('description');
    } else {
      whyButton.hidden = true;
      whyPanel.hidden = true;
    }
  }
  return p;
};
