(() => {
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const activeVariations = (product) => (product.variations || []).filter((variation) => String(variation.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  const money = (product) => {
    const prices = activeVariations(product).map((variation) => Number(variation.selling_price ?? variation.price ?? variation.sale_price)).filter((price) => Number.isFinite(price) && price > 0);
    const fallback = Number(product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price);
    if (!prices.length) return Number.isFinite(fallback) && fallback > 0 ? `₹${fallback.toLocaleString('en-IN')}` : 'Price unavailable';
    const minimum = Math.min(...prices);
    const maximum = Math.max(...prices);
    return minimum === maximum ? `₹${minimum.toLocaleString('en-IN')}` : `₹${minimum.toLocaleString('en-IN')} – ₹${maximum.toLocaleString('en-IN')}`;
  };
  const renderRelatedProducts = async (currentProduct) => {
    const grid = document.getElementById('relatedProductsGrid');
    if (!grid || !window.NellaiApi) return;
    try {
      const products = await window.NellaiApi.request('products/get.php?limit=100');
      const related = products.filter((product) => String(product.status || '').toUpperCase() === 'ACTIVE' && String(product.id) !== String(currentProduct.id)).slice(0, 3);
      const fallback = '../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png';
      grid.innerHTML = related.map((product) => {
        const rawImage = product.main_image || product.image || product.images?.[0]?.image_url || product.images?.[0]?.image_path;
        const image = window.normalizeStorefrontAsset?.(rawImage) || fallback;
        const variations = activeVariations(product);
        const size = variations.length > 1 ? `${variations.length} sizes` : (variations[0]?.weight || variations[0]?.variation_name || product.weight || '');
        const href = `product-detail.html?slug=${encodeURIComponent(product.slug || '')}`;
        return `<article class="bg-white rounded-2xl border border-[#EADBC1] overflow-hidden shadow-md shadow-[#321307]/5 p-4 flex gap-4 items-center"><a href="${href}"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" class="w-20 h-20 object-cover rounded-xl bg-[#FFFBF5]" onerror="this.onerror=null;this.src='${fallback}'"></a><div><h3 class="font-serif font-bold text-base text-[#321307]"><a href="${href}" class="hover:text-[#8C1C13]">${escapeHtml(product.name)}</a></h3><p class="text-xs font-semibold text-[#8C1C13]">${escapeHtml(product.ingredient_type || 'Traditional sweet')}</p><p class="text-sm font-bold text-[#8C1C13] mt-1">${money(product)}${size ? ` <span class="text-xs font-normal text-[#806B58]">/ ${escapeHtml(size)}</span>` : ''}</p></div></article>`;
      }).join('');
      grid.hidden = false;
    } catch (error) { console.error('[Product Detail] Related products failed:', error); }
  };
  document.addEventListener('DOMContentLoaded', async () => {
    const main = document.querySelector('main');
    if (main) main.hidden = true;
    const notFound = () => { if (main) { main.hidden = false; main.innerHTML = '<section class="max-w-2xl mx-auto px-6 py-24 text-center"><h1 class="font-serif text-4xl font-bold text-[#32110D]">Product not found</h1><a href="shop.html" class="mt-6 inline-block rounded-xl bg-[#4d190e] px-6 py-3 text-white">Back to Shop</a></section>'; } };
    try {
      const product = await window.loadProductDetail?.();
      if (!product) { notFound(); return; }
      window.renderProductGallery?.(product);
      window.renderProductVariations?.(product);
      renderRelatedProducts(product);
      if (main) main.hidden = false;
      const add = document.getElementById('btnAddToCart');
      if (add) add.onclick = () => {
        const variation = window.selectedProductVariation?.();
        if ((product.variations || []).length && !variation) return;
        const quantity = Number(document.getElementById('qtyCount')?.textContent || 1);
        const variationLabel = variation ? (variation.weight != null ? `${variation.weight}${variation.weight_unit ? ` ${variation.weight_unit}` : ''}` : variation.variation_name) : '';
        window.NellaiStore?.addToCart?.({ product_id: product.id, variation_id: variation ? Number(variation.id) : null, slug: product.slug, name: product.name, image: product.main_image || product.image || product.images?.[0]?.image_url || '', variation_name: variationLabel, weight: variation?.weight || variation?.variation_name || product.weight, weight_unit: variation?.weight_unit || product.weight_unit, quantity, unit_price: variation?.selling_price ?? product.selling_price ?? product.sale_price ?? product.offer_price ?? product.price });
      };
    } catch (error) { console.error('[Product Detail]', error); notFound(); }
  });
})();
