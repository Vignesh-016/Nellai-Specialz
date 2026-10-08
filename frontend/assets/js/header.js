/* Shared site header with a continuously looping offer marquee. */
(function () {
  const isSubpage = window.location.pathname.includes("/pages/");
  const base = isSubpage ? "../" : "./";
  const path = window.location.pathname;
  const active = (name) => (name === "home" ? (!isSubpage && !path.includes("/pages/")) : path.includes(name));
  const navClass = (name) => `relative py-2 text-sm sm:text-base font-semibold text-[#32110D] transition-colors hover:text-[#8C1C13] ${active(name) ? "after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-[#8C1C13]" : ""}`;

  const headerHTML = `
    <div class="bg-[#7A120A] text-[#FFF8EF]">
      <div class="overflow-hidden px-4 text-[11px] sm:text-xs font-medium tracking-wide" aria-label="Current offers">
        <div class="offer-marquee flex h-9 w-max whitespace-nowrap items-center">
          <span>✦ Authentic Tirunelveli Halwa Freshly Prepared</span><span class="text-[#D9B86C]/80 mx-3">|</span><span>✦ Special Diwali Combo Offers Live</span><span class="text-[#D9B86C]/80 mx-3">|</span><span>✦ All-India Express Delivery &amp; Safe Packing</span><span class="text-[#D9B86C]/80 mx-3">|</span><span>✦ Pure Cow Ghee &amp; Natural Ingredients</span><span class="text-[#D9B86C]/80 mx-3">|</span>
          <span aria-hidden="true">✦ Authentic Tirunelveli Halwa Freshly Prepared</span><span aria-hidden="true" class="text-[#D9B86C]/80 mx-3">|</span><span aria-hidden="true">✦ Special Diwali Combo Offers Live</span><span aria-hidden="true" class="text-[#D9B86C]/80 mx-3">|</span><span aria-hidden="true">✦ All-India Express Delivery &amp; Safe Packing</span><span aria-hidden="true" class="text-[#D9B86C]/80 mx-3">|</span><span aria-hidden="true">✦ Pure Cow Ghee &amp; Natural Ingredients</span><span aria-hidden="true" class="text-[#D9B86C]/80 mx-3">|</span>
        </div>
      </div>
    </div>
    <header class="sticky top-0 z-40 border-b border-[#EADBC1] bg-[#FFF8EF]/95 backdrop-blur-md shadow-xs">
      <div class="mx-auto flex min-h-[76px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" id="mobileMenuBtn" class="order-first rounded-lg p-2 text-[#32110D] hover:bg-[#EADBC1]/30 lg:hidden" aria-label="Open menu"><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        <a href="${base}index.html" class="shrink-0 transition-transform hover:scale-[1.02]"><img src="${base}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz" class="h-16 sm:h-20 w-auto object-contain py-1"></a>
        <nav class="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Primary navigation"><a href="${base}index.html" class="${navClass("home")}">Home</a><a href="${base}pages/shop.html" class="${navClass("shop")}">Shop</a><a href="${base}pages/our-story.html" class="${navClass("our-story")}">About Us</a><a href="${base}pages/contact-us.html" class="${navClass("contact-us")}">Contact</a></nav>
        <div class="flex items-center gap-3 text-[#32110D] sm:gap-5"><label class="relative hidden md:block"><span class="sr-only">Search</span><svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C1C13]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke-width="2"/><path stroke-linecap="round" stroke-width="2" d="m20 20-4-4"/></svg><input type="search" placeholder="Search sweets, halwa, combos..." class="h-10 w-52 rounded-full border border-[#EADBC1] bg-[#FFFBF5] pl-10 pr-4 text-xs font-medium text-[#32110D] outline-none placeholder:text-[#8C1C13]/60 focus:border-[#8C1C13] focus:ring-1 focus:ring-[#8C1C13] sm:w-64 transition-all"></label><a href="${base}login.html" aria-label="Account" class="p-1.5 transition-colors hover:text-[#8C1C13]"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" stroke-width="1.8"/><path stroke-linecap="round" stroke-width="1.8" d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg></a><button type="button" data-open-cart aria-label="Cart" class="relative p-1.5 transition-colors hover:text-[#8C1C13]"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5h2l1.5 11h10L20 8H7M10 20a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01"/></svg><span data-cart-count class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8C1C13] text-[10px] font-bold text-white shadow-xs">0</span></button></div>
      </div>
      <div id="mobileMenuDrawer" class="hidden border-t border-[#EADBC1] bg-[#FFF8EF] px-6 py-5 lg:hidden"><nav class="grid gap-2" aria-label="Mobile navigation"><a href="${base}index.html" class="rounded-lg px-4 py-2.5 text-base font-semibold text-[#32110D] hover:bg-[#EADBC1]/40 transition-colors">Home</a><a href="${base}pages/shop.html" class="rounded-lg px-4 py-2.5 text-base font-semibold text-[#32110D] hover:bg-[#EADBC1]/40 transition-colors">Shop</a><a href="${base}pages/our-story.html" class="rounded-lg px-4 py-2.5 text-base font-semibold text-[#32110D] hover:bg-[#EADBC1]/40 transition-colors">About Us</a><a href="${base}pages/contact-us.html" class="rounded-lg px-4 py-2.5 text-base font-semibold text-[#32110D] hover:bg-[#EADBC1]/40 transition-colors">Contact</a></nav></div>
    </header>`;

  function mount() {
    const target = document.getElementById("site-header") || document.querySelector("header");
    if (target) target.outerHTML = `<div id="site-header">${headerHTML}</div>`;
    document.getElementById("mobileMenuBtn")?.addEventListener("click", () => document.getElementById("mobileMenuDrawer")?.classList.toggle("hidden"));
    const search = document.querySelector('input[type="search"]');
    const searchBox = search?.parentElement;
    const searchResults = document.createElement('div');
    if (searchBox && search) { searchBox.classList.add('relative'); searchResults.className = 'absolute left-0 right-0 top-12 z-[80] hidden max-h-80 overflow-auto rounded-xl border border-[#EADBC1] bg-[#FFFBF5] shadow-xl'; searchBox.appendChild(searchResults); }
    search?.addEventListener("input", (event) => window.dispatchEvent(new CustomEvent("nellai:search", { detail: event.target.value })));
    let searchTimer;
    search?.addEventListener('keydown', (event) => { const items = [...searchResults.querySelectorAll('[data-search-slug]')]; const active = items.indexOf(document.activeElement); if (event.key === 'ArrowDown' && items.length) { event.preventDefault(); items[Math.min(active + 1, items.length - 1)].focus(); } else if (event.key === 'ArrowUp' && items.length) { event.preventDefault(); items[Math.max(active - 1, 0)].focus(); } else if (event.key === 'Escape') searchResults.classList.add('hidden'); else if (event.key === 'Enter' && search.value.trim().length >= 2) { if (document.activeElement?.dataset.searchSlug) document.activeElement.click(); else location.href = `${base}pages/shop.html?search=${encodeURIComponent(search.value.trim())}`; } });
    search?.addEventListener('input', () => { clearTimeout(searchTimer); const term = search.value.trim(); if (term.length < 2) { searchResults.classList.add('hidden'); return; } searchResults.innerHTML = '<p class="p-3 text-xs text-[#806b58]">Searching...</p>'; searchResults.classList.remove('hidden'); searchTimer = setTimeout(async () => { try { const response = await fetch('https://backend.nellaispecialz.com/api/products/get.php'); const payload = await response.json(); const products = [...new Map((payload.data || []).filter(p => `${p.name} ${p.slug} ${p.sku || ''} ${p.short_description || ''}`.toLowerCase().includes(term.toLowerCase())).map(p => [p.id, p])).values()].slice(0, 7); searchResults.innerHTML = products.length ? products.map(p => { const image = p.main_image || p.image || p.images?.[0]?.image_path || ''; const src = /^https?:\/\//i.test(image) ? image : (image ? `https://backend.nellaispecialz.com/${image.replace(/^\/+/, '')}` : `${base}assets/images/nellai-specialz-logo.png`); const prices = (p.variations || []).map(v => Number(v.selling_price)).filter(v => v > 0); const price = prices.length ? Math.min(...prices) : Number(p.offer_price || p.selling_price || 0); return `<button type="button" data-search-slug="${encodeURIComponent(p.slug || '')}" class="flex w-full items-center gap-3 border-b border-[#EADBC1] px-3 py-2 text-left hover:bg-[#F8F1E4]"><img src="${src}" alt="" class="h-10 w-10 rounded-lg object-cover"><span><strong class="block text-xs text-[#32110D]">${p.name || 'Product'}</strong><small class="text-[11px] text-[#8C1C13]">${price > 0 ? `From ₹${price.toLocaleString('en-IN')}` : 'Price unavailable'}</small></span></button>`; }).join('') : '<p class="p-3 text-xs text-[#806b58]">No matching products found.</p>'; searchResults.classList.remove('hidden'); searchResults.querySelectorAll('[data-search-slug]').forEach(button => button.onclick = () => { location.href = `${base}pages/product-detail.html?slug=${button.dataset.searchSlug}`; }); } catch (_) { searchResults.innerHTML = '<p class="p-3 text-xs text-[#806b58]">Unable to load products right now.</p>'; } }, 300); });
    document.addEventListener('click', event => { if (!searchBox?.contains(event.target)) searchResults.classList.add('hidden'); });
    const marquee = document.querySelector(".offer-marquee");
    if (marquee && !marquee.dataset.loopReady) {
      const sequence = marquee.innerHTML;
      marquee.innerHTML = `<div class="offer-sequence flex shrink-0 items-center gap-8 pr-12">${sequence}</div><div class="offer-sequence flex shrink-0 items-center gap-8 pr-12" aria-hidden="true">${sequence}</div>`;
      marquee.dataset.loopReady = "true";
    }
    if (!document.getElementById("offer-marquee-styles")) {
      const styles = document.createElement("style");
      styles.id = "offer-marquee-styles";
      styles.textContent = `@keyframes offerMarquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}.offer-marquee{animation:offerMarquee 24s linear infinite;will-change:transform}.offer-marquee:hover{animation-play-state:paused}@media(prefers-reduced-motion:reduce){.offer-marquee{animation:none}}`;
      document.head.appendChild(styles);
    }

    const accountLink = document.querySelector('a[aria-label="Account"]');
    if (accountLink && window.NellaiCustomerSession) {
      window.NellaiCustomerSession.getCurrentCustomer().then((customer) => {
        if (customer) {
          accountLink.href = `${base}profile.html`;
          accountLink.title = `Signed in as ${customer.name || customer.email}`;
        }
      }).catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
