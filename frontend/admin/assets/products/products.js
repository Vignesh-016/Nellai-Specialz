(() => {
  const api = window.AdminApi;
  if (!api) return;

  const state = {
    items: [],
    editing: null,
    mainImage: null,
    currentMainImage: null,
    gallery: [],
    currentGallery: [],
    isSubmitting: false,
    previewUrls: [],
  };
  const el = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

  function message(text, type = "error") {
    const node = el("products-api-status");
    if (!node) return;
    if (!text) {
      node.className = "hidden";
      node.textContent = "";
      return;
    }
    node.textContent = text;
    node.className = type === "success"
      ? "px-4 py-3 text-sm text-emerald-700 bg-emerald-50"
      : "px-4 py-3 text-sm text-red-700 bg-red-50";
  }

  function revokePreviewUrls() {
    state.previewUrls.forEach((url) => URL.revokeObjectURL(url));
    state.previewUrls = [];
  }

  function imageUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (/^\/?assets\//i.test(path)) return `../${String(path).replace(/^\/+/, "")}`;
    return `https://backend.nellaispecialz.com/${String(path).replace(/^\/+/, "")}`;
  }

  function renderImages() {
    const preview = el("main-image-preview");
    const mainImage = el("main-image-img");
    const removeMainImage = el("remove-main-image");
    const mainImagePath = state.mainImage
      ? URL.createObjectURL(state.mainImage)
      : state.currentMainImage;
    if (state.mainImage) state.previewUrls.push(mainImagePath);
    if (mainImagePath) {
      mainImage.src = mainImagePath;
      preview.classList.remove("hidden");
    } else {
      mainImage.removeAttribute("src");
      preview.classList.add("hidden");
    }
    if (removeMainImage) removeMainImage.classList.toggle("hidden", !state.mainImage);

    const galleryArea = el("gallery-area");
    if (!galleryArea) return;
    galleryArea.replaceChildren();
    state.currentGallery.forEach((image, index) => {
      const tile = document.createElement("div");
      tile.className = "relative min-h-[100px] overflow-hidden rounded-xl border border-[#eadbc6] bg-[#f3e7d5]";
      const img = document.createElement("img");
      img.src = image.image_url;
      img.alt = `Saved gallery image ${index + 1}`;
      img.className = "h-full min-h-[100px] w-full object-cover";
      tile.appendChild(img);
      galleryArea.appendChild(tile);
    });
    state.gallery.forEach((file, index) => {
      const tile = document.createElement("div");
      tile.className = "relative min-h-[100px] overflow-hidden rounded-xl border border-[#eadbc6]";
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      state.previewUrls.push(url);
      img.src = url;
      img.alt = file.name;
      img.className = "h-full min-h-[100px] w-full object-cover";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.dataset.removeGallery = String(index);
      remove.setAttribute("aria-label", `Remove ${file.name}`);
      remove.className = "absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white";
      remove.textContent = "×";
      tile.append(img, remove);
      galleryArea.appendChild(tile);
    });
  }

  function hasVariationData(row) {
    return Boolean(
      row.querySelector('[data-field="weight"]').value.trim()
      || row.querySelector('[data-field="selling_price"]').value.trim()
    );
  }

  function syncInventoryFields() {
    const enabled = el("pf-manage-inventory").checked;
    const fields = el("inventory-fields");
    const variationRows = [...document.querySelectorAll("#variations-container .variation-row")];
    const hasVariations = variationRows.some(hasVariationData);
    fields.classList.toggle("hidden", !enabled);
    el("inventory-simple").classList.toggle("hidden", hasVariations);
    el("inventory-variation-note").classList.toggle("hidden", !enabled || !hasVariations);

    const stockQuantity = el("pf-stock-qty");
    const threshold = el("pf-low-threshold");
    const stockStatus = el("pf-stock-status");
    stockQuantity.disabled = !enabled || hasVariations;
    stockQuantity.required = enabled && !hasVariations;
    threshold.disabled = !enabled;
    threshold.required = enabled;
    stockStatus.disabled = true;
    document.querySelectorAll("#variations-container [data-field='stock_quantity']").forEach((input) => {
      input.disabled = !enabled;
      input.closest("[data-variation-stock]")?.classList.toggle("hidden", !enabled);
    });
    updateStockStatus();
  }

  function updateStockStatus() {
    const rows = [...document.querySelectorAll("#variations-container .variation-row")].filter(hasVariationData);
    const quantity = rows.length
      ? rows.reduce((sum, row) => sum + Number(row.querySelector('[data-field="stock_quantity"]').value || 0), 0)
      : Number(el("pf-stock-qty").value || 0);
    const threshold = Number(el("pf-low-threshold").value || 0);
    const status = quantity <= 0 ? "OUT_OF_STOCK" : quantity <= threshold ? "LOW_STOCK" : "IN_STOCK";
    const stockStatus = el("pf-stock-status");
    if (stockStatus) stockStatus.value = status;
  }

  function addVariationRow(variation = {}) {
    const container = el("variations-container");
    const row = document.createElement("div");
    row.className = "variation-row rounded-xl border border-[#eadbc6] bg-[#fffcf7] p-4";
    if (Number(variation.id) > 0) row.dataset.variationId = String(variation.id);
    row.innerHTML = `
      <div class="grid gap-3 sm:grid-cols-6">
        <input data-field="weight" class="rounded-lg border px-3 py-2" placeholder="Weight / variant" value="${escapeHtml(variation.weight || variation.variation_name || "")}">
        <input data-field="weight_unit" class="rounded-lg border px-3 py-2" placeholder="Unit" value="${escapeHtml(variation.weight_unit || "")}">
        <input data-field="selling_price" type="number" min="0" step="0.01" class="rounded-lg border px-3 py-2" placeholder="Price" value="${variation.selling_price ?? variation.price ?? ""}">
        <input data-field="strike_price" type="number" min="0" step="0.01" class="rounded-lg border px-3 py-2" placeholder="Strike price" value="${variation.strike_price ?? ""}">
        <input data-field="sku" class="rounded-lg border px-3 py-2" placeholder="SKU" value="${escapeHtml(variation.sku || "")}">
        <label data-variation-stock class="text-xs text-[#594b45]">Stock quantity
          <input data-field="stock_quantity" type="number" min="0" step="1" class="mt-1 w-full rounded-lg border px-3 py-2" placeholder="0" value="${variation.stock_quantity ?? 0}">
        </label>
      </div>
      <div class="mt-3 flex justify-between">
        <select data-field="status" class="rounded-lg border px-2 py-1">
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button type="button" data-remove-variation class="text-red-600">Remove variation</button>
      </div>`;
    row.querySelector('[data-field="status"]').value = String(variation.status || "ACTIVE").toUpperCase();
    container.appendChild(row);
    syncInventoryFields();
  }

  function collectVariations() {
    const variations = [];
    document.querySelectorAll("#variations-container .variation-row").forEach((row) => {
      const value = (name) => row.querySelector(`[data-field="${name}"]`).value.trim();
      const name = value("weight");
      const unit = value("weight_unit");
      const priceValue = value("selling_price");
      if (!name && !priceValue) return;
      const price = Number(priceValue);
      if (!name || !Number.isFinite(price) || price <= 0) {
        throw new Error("Each used variation needs a name and a valid selling price.");
      }

      const measuredWeight = name.match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l)$/i);
      const numericWeight = /^\d+(?:\.\d+)?$/.test(name) ? Number(name) : null;
      const displayName = numericWeight !== null && unit ? `${name}${unit}` : name;
      const variation = {
        variation_name: displayName,
        weight: measuredWeight ? Number(measuredWeight[1]) : numericWeight,
        weight_unit: unit || (measuredWeight ? measuredWeight[2].toLowerCase() : null),
        selling_price: price,
        strike_price: Number(value("strike_price") || 0) || null,
        sku: value("sku") || null,
        stock_quantity: Number(row.querySelector('[data-field="stock_quantity"]').value || 0),
        status: value("status").toUpperCase(),
      };
      if (row.dataset.variationId) variation.id = Number(row.dataset.variationId);
      variations.push(variation);
    });
    return variations;
  }

  function getVisibleProducts() {
    const search = (el("product-search")?.value || "").trim().toLowerCase();
    const category = el("product-category-filter")?.value || "";
    const status = (el("product-status-filter")?.value || "").toUpperCase();
    return state.items.filter((product) => {
      if (search && !`${product.name} ${product.slug}`.toLowerCase().includes(search)) return false;
      if (category && String(product.category_id) !== category) return false;
      if (status && String(product.status).toUpperCase() !== status) return false;
      return true;
    });
  }

  function render() {
    const body = el("products-tbody");
    const empty = el("products-empty");
    if (!body || !empty) return;
    const products = getVisibleProducts();
    empty.classList.toggle("hidden", products.length > 0);
    body.innerHTML = products.map((product) => {
      const variations = product.variations || [];
      const prices = variations
        .filter((variation) => String(variation.status || "ACTIVE").toUpperCase() === "ACTIVE")
        .map((variation) => Number(variation.selling_price))
        .filter((price) => Number.isFinite(price) && price > 0);
      const price = prices.length
        ? prices.length === 1
          ? `₹${prices[0].toLocaleString("en-IN")}`
          : `₹${Math.min(...prices).toLocaleString("en-IN")} – ₹${Math.max(...prices).toLocaleString("en-IN")}`
        : `₹${Number(product.selling_price || 0).toLocaleString("en-IN")}`;
      return `<tr>
        <td class="px-4 py-4 font-semibold">${escapeHtml(product.name)}</td>
        <td class="px-4 py-4">${escapeHtml(product.category_name || "")}</td>
        <td class="px-4 py-4">${escapeHtml(product.sub_category_name || "")}</td>
        <td class="px-4 py-4">${price}</td>
        <td class="px-4 py-4">${escapeHtml(product.stock_status || "—")}</td>
        <td class="px-4 py-4">${escapeHtml(product.status || "—")}</td>
        <td class="px-4 py-4 text-right">
          <button type="button" data-edit-product="${Number(product.id)}" class="mr-2">Edit</button>
          <button type="button" data-delete-product="${Number(product.id)}" class="text-red-600">Delete</button>
        </td>
      </tr>`;
    }).join("");
    body.querySelectorAll("[data-edit-product]").forEach((button) => {
      button.addEventListener("click", () => edit(Number(button.dataset.editProduct)));
    });
    body.querySelectorAll("[data-delete-product]").forEach((button) => {
      button.addEventListener("click", () => remove(Number(button.dataset.deleteProduct)));
    });
  }

  async function load() {
    try {
      state.items = await api.request("products/get.php?include_inactive=1");
      render();
    } catch (error) {
      message(error.message || "Unable to load products.");
    }
  }

  async function loadCategories() {
    const categories = await api.request("categories/get.php");
    const select = el("pf-category");
    select.innerHTML = '<option value="">Select category</option>' + categories
      .map((category) => `<option value="${Number(category.id)}">${escapeHtml(category.name)}</option>`)
      .join("");
    const filter = el("product-category-filter");
    if (filter) {
      const selected = filter.value;
      filter.innerHTML = '<option value="">All categories</option>' + categories
        .map((category) => `<option value="${Number(category.id)}">${escapeHtml(category.name)}</option>`)
        .join("");
      filter.value = selected;
    }
  }

  async function loadSubcategories() {
    const select = el("pf-subcategory");
    select.innerHTML = '<option value="">Select sub category</option>';
    if (!el("pf-category").value) return;
    const rows = await api.request(`sub-categories/get.php?category_id=${encodeURIComponent(el("pf-category").value)}`);
    select.innerHTML += rows
      .map((row) => `<option value="${Number(row.id)}">${escapeHtml(row.name)}</option>`)
      .join("");
  }

  function validateImage(file) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if ((file.type && !allowedTypes.includes(file.type)) || (!file.type && !allowedExtensions.includes(extension))) {
      throw new Error("Only JPG, PNG, and WebP images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Each image must be 5 MB or smaller.");
    }
  }

  async function uploadImages(productId) {
    if (!state.mainImage && !state.gallery.length) return;
    const data = new FormData();
    data.append("product_id", String(productId));
    if (state.mainImage) data.append("main_image", state.mainImage);
    state.gallery.forEach((file) => data.append("gallery_images[]", file));
    await api.request("products/upload-images.php", { method: "POST", body: data });
  }

  async function save(event) {
    event.preventDefault();
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    const button = el("pf-submit-btn");
    button.disabled = true;
    message("");

    try {
      const variations = collectVariations();
      const managedInventory = el("pf-manage-inventory").checked;
      const hasVariations = variations.length > 0;
      const variationStock = variations.reduce((sum, variation) => sum + variation.stock_quantity, 0);
      const stockQuantity = hasVariations ? variationStock : Number(el("pf-stock-qty").value || 0);
      const prices = variations
        .filter((variation) => variation.status === "ACTIVE")
        .map((variation) => variation.selling_price);
      const payload = {
        name: el("pf-name").value.trim(),
        slug: el("pf-slug").value.trim(),
        short_description: el("pf-short-desc").value.trim(),
        description: el("pf-description").value.trim(),
        key_ingredients: el("pf-key-ingredients").value.trim(),
        storage_shelf_life: el("pf-storage-shelf-life").value.trim(),
        category_id: Number(el("pf-category").value || 0),
        sub_category_id: el("pf-subcategory").value ? Number(el("pf-subcategory").value) : null,
        selling_price: prices.length ? Math.min(...prices) : Number(el("pf-product-price")?.value || 0),
        manage_inventory: managedInventory ? 1 : 0,
        stock_quantity: stockQuantity,
        low_stock_threshold: Number(el("pf-low-threshold").value || 0),
        status: el("pf-status").value.toUpperCase(),
        featured: el("pf-featured").checked ? 1 : 0,
        variations,
      };
      if (!payload.name || !payload.slug || !payload.category_id) {
        throw new Error("Name, slug, and category are required.");
      }
      if (managedInventory && !hasVariations && stockQuantity < 0) {
        throw new Error("Stock quantity cannot be negative.");
      }
      for (const file of [state.mainImage, ...state.gallery]) validateImage(file);

      const productId = state.editing;
      const result = await api.request(
        `products/${productId ? "put" : "post"}.php${productId ? `?id=${productId}` : ""}`,
        { method: productId ? "PUT" : "POST", body: JSON.stringify(payload) },
      );
      const savedProductId = productId || Number(result.id);
      state.editing = savedProductId;
      try {
        await uploadImages(savedProductId);
      } catch (error) {
        await load();
        throw new Error(`Product details were saved, but image upload failed: ${error.message}`);
      }

      window.AdminModal?.close("product-modal");
      await load();
      message("Product saved successfully.", "success");
    } catch (error) {
      message(error.message || "Unable to save the product.");
    } finally {
      state.isSubmitting = false;
      button.disabled = false;
    }
  }

  async function edit(id) {
    try {
      const product = state.items.find((item) => Number(item.id) === id)
        || await api.request(`products/get.php?id=${id}&include_inactive=1`);
      state.editing = Number(product.id);
      el("pf-name").value = product.name || "";
      el("pf-slug").value = product.slug || "";
      el("pf-short-desc").value = product.short_description || "";
      el("pf-description").value = product.description || "";
      el("pf-key-ingredients").value = product.key_ingredients || "";
      el("pf-storage-shelf-life").value = product.storage_shelf_life || "";
      await loadCategories();
      el("pf-category").value = product.category_id || "";
      await loadSubcategories();
      el("pf-subcategory").value = product.sub_category_id || "";
      el("pf-status").value = String(product.status || "ACTIVE").toLowerCase();
      el("pf-featured").checked = Number(product.featured) === 1;
      el("pf-manage-inventory").checked = Number(product.manage_inventory) === 1;
      el("pf-stock-qty").value = product.stock_quantity ?? 0;
      el("pf-low-threshold").value = product.low_stock_threshold ?? 5;
      state.mainImage = null;
      state.currentMainImage = imageUrl(product.main_image || product.image);
      state.gallery = [];
      state.currentGallery = product.images || [];
      revokePreviewUrls();
      el("variations-container").replaceChildren();
      (product.variations || []).forEach(addVariationRow);
      renderImages();
      syncInventoryFields();
      window.AdminModal?.open("product-modal");
    } catch (error) {
      message(error.message || "Unable to load this product for editing.");
    }
  }

  async function add() {
    state.editing = null;
    state.mainImage = null;
    state.currentMainImage = null;
    state.gallery = [];
    state.currentGallery = [];
    revokePreviewUrls();
    el("product-form").reset();
    el("pf-status").value = "ACTIVE";
    el("pf-manage-inventory").checked = true;
    el("pf-low-threshold").value = 5;
    el("variations-container").replaceChildren();
    addVariationRow();
    renderImages();
    syncInventoryFields();
    message("");
    window.AdminModal?.open("product-modal");
    try {
      await loadCategories();
    } catch (error) {
      message(error.message || "Unable to load product categories.");
    }
  }

  async function remove(id) {
    const product = state.items.find((item) => Number(item.id) === id);
    if (!product || !window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.request(`products/delete.php?id=${id}`, { method: "DELETE" });
      await load();
      message("Product deleted.", "success");
    } catch (error) {
      message(error.message || "Unable to delete the product.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = el("product-form");
    form?.removeAttribute("onsubmit");
    form?.addEventListener("submit", save);
    el("addVariationBtn")?.addEventListener("click", () => addVariationRow());
    el("variations-container")?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-variation]");
      if (removeButton) {
        removeButton.closest(".variation-row").remove();
        syncInventoryFields();
      }
    });
    el("variations-container")?.addEventListener("input", syncInventoryFields);
    el("pf-manage-inventory")?.addEventListener("change", syncInventoryFields);
    el("pf-stock-qty")?.addEventListener("input", updateStockStatus);
    el("pf-low-threshold")?.addEventListener("input", updateStockStatus);
    el("pf-category")?.addEventListener("change", () => loadSubcategories().catch((error) => message(error.message)));
    el("product-search")?.addEventListener("input", render);
    el("product-category-filter")?.addEventListener("change", render);
    el("product-status-filter")?.addEventListener("change", render);
    el("main-image-input")?.addEventListener("change", (event) => {
      const file = event.target.files[0] || null;
      try {
        validateImage(file);
        state.mainImage = file;
        revokePreviewUrls();
        renderImages();
        message("");
      } catch (error) {
        event.target.value = "";
        message(error.message);
      }
    });
    el("gallery-input")?.addEventListener("change", (event) => {
      const files = [...event.target.files];
      try {
        files.forEach(validateImage);
        state.gallery.push(...files);
        revokePreviewUrls();
        renderImages();
        message("");
      } catch (error) {
        message(error.message);
      } finally {
        event.target.value = "";
      }
    });
    el("main-image-button")?.addEventListener("click", () => el("main-image-input").click());
    el("gallery-button")?.addEventListener("click", () => el("gallery-input").click());
    el("remove-main-image")?.addEventListener("click", () => {
      state.mainImage = null;
      el("main-image-input").value = "";
      revokePreviewUrls();
      renderImages();
    });
    el("gallery-area")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-gallery]");
      if (!button) return;
      state.gallery.splice(Number(button.dataset.removeGallery), 1);
      revokePreviewUrls();
      renderImages();
    });
    window.openProductModal = add;
    window.editProduct = edit;
    window.filterProducts = render;
    loadCategories().catch((error) => message(error.message));
    load();
  });

  window.AdminProducts = { load };
})();
