window.renderProductVariations = (product) => {
  const box = document.getElementById("weightSelector");
  if (!box) return;

  const variations = (product.variations || []).filter(
    (variation) => String(variation.status || "ACTIVE").toLowerCase() === "active",
  );
  const price = document.getElementById("displayPrice");
  const mrp = document.getElementById("displayMRP");
  let selected = null;
  box.replaceChildren();

  const formatPrice = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0
      ? `₹${numeric.toLocaleString("en-IN")}`
      : "Price unavailable";
  };
  const choose = (variation) => {
    selected = variation;
    box.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.variationId === String(variation.id);
      button.classList.toggle("active", active);
      if (active) {
        button.className = "weight-opt active px-3.5 py-2.5 rounded-xl border-2 border-[#8C1C13] bg-[#8C1C13]/10 text-xs font-bold text-[#8C1C13] text-center transition cursor-pointer shadow-xs";
      } else {
        button.className = "weight-opt px-3.5 py-2.5 rounded-xl border border-[#EADBC1] bg-white text-xs font-semibold text-[#321307] hover:border-[#8C1C13] text-center transition cursor-pointer";
      }
    });
    if (price) price.textContent = formatPrice(variation.selling_price);
    if (mrp) mrp.textContent = Number(variation.strike_price) > 0
      ? `₹${Number(variation.strike_price).toLocaleString("en-IN")}`
      : "";
    document.dispatchEvent(new CustomEvent("product:variation", { detail: variation }));
  };
  const variationLabel = (variation) => {
    const weight = variation.weight == null ? "" : String(variation.weight).trim();
    const unit = String(variation.weight_unit || "").trim();
    return weight
      ? `${weight}${unit ? ` ${unit}` : ""}`
      : String(variation.variation_name || "");
  };

  variations.forEach((variation) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.variationId = String(variation.id);
    button.className = "weight-opt px-3.5 py-2.5 rounded-xl border border-[#EADBC1] bg-white text-xs font-semibold text-[#321307] text-center";
    const label = document.createElement("span");
    label.textContent = variationLabel(variation);
    const amount = document.createElement("span");
    amount.className = "block text-[11px] font-normal text-[#806B58]";
    amount.textContent = formatPrice(variation.selling_price);
    button.append(label, amount);
    button.addEventListener("click", () => choose(variation));
    box.appendChild(button);
  });

  if (variations[0]) {
    choose(variations[0]);
  } else {
    if (price) {
      price.textContent = formatPrice(
        product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price,
      );
    }
    if (mrp) mrp.textContent = "";
  }
  window.selectedProductVariation = () => selected;
};
