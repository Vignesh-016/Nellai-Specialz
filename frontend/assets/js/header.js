/* Shared site header with a continuously looping offer marquee. */
(function () {
  const isSubpage = window.location.pathname.includes("/pages/");
  const base = isSubpage ? "../" : "./";
  const path = window.location.pathname;
  const active = (name) => (name === "home" ? !isSubpage : path.includes(name));
  const navClass = (name) => `relative py-2 text-[13px] font-medium text-[#2d170d] transition hover:text-[#8b5415] ${active(name) ? "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#b88932]" : ""}`;

  const headerHTML = `
    <div class="bg-[#351507] text-[#f6dfb0]">
      <div class="overflow-hidden px-4 text-[11px] sm:text-xs" aria-label="Current offers">
        <div class="offer-marquee flex h-9 w-max whitespace-nowrap">
          <span>✦ Freshly Prepared Traditional Halwa</span><span class="text-[#d4a85f]/70">|</span><span>✦ Festival Offers Live Now</span><span class="text-[#d4a85f]/70">|</span><span>✦ Free Shipping on Eligible Orders</span><span class="text-[#d4a85f]/70">|</span><span>✦ All India Delivery</span><span class="text-[#d4a85f]/70">|</span>
          <span aria-hidden="true">✦ Freshly Prepared Traditional Halwa</span><span aria-hidden="true" class="text-[#d4a85f]/70">|</span><span aria-hidden="true">✦ Festival Offers Live Now</span><span aria-hidden="true" class="text-[#d4a85f]/70">|</span><span aria-hidden="true">✦ Free Shipping on Eligible Orders</span><span aria-hidden="true" class="text-[#d4a85f]/70">|</span><span aria-hidden="true">✦ All India Delivery</span><span aria-hidden="true" class="text-[#d4a85f]/70">|</span>
        </div>
      </div>
    </div>
    <header class="sticky top-0 z-40 border-b border-[#eadcc6] bg-[#fff8eb] shadow-sm">
      <div class="mx-auto flex min-h-[72px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" id="mobileMenuBtn" class="order-first rounded-md p-2 text-[#351507] lg:hidden" aria-label="Open menu"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        <a href="${base}index.html" class="shrink-0"><img src="${base}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz" class="h-14 w-auto object-contain sm:h-16"></a>
        <nav class="hidden items-center gap-5 lg:flex xl:gap-6" aria-label="Primary navigation"><a href="${base}index.html" class="${navClass("home")}">Home</a><a href="${base}pages/shop.html" class="${navClass("shop.html")}">Halwa</a><a href="${base}pages/shop.html#sweets" class="${navClass("sweets")}">Sweets</a><a href="${base}pages/shop.html#snacks" class="${navClass("snacks")}">Snacks</a><a href="${base}index.html#combo" class="${navClass("combo")}">Combos</a><a href="${base}pages/shop.html#gift" class="${navClass("gift")}">Gifting</a><a href="${base}pages/our-story.html" class="${navClass("our-story.html")}">About Us</a><a href="${base}pages/contact-us.html" class="${navClass("contact-us.html")}">Contact</a></nav>
        <div class="flex items-center gap-3 text-[#351507] sm:gap-4"><label class="relative hidden md:block"><span class="sr-only">Search</span><svg class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke-width="1.8"/><path stroke-linecap="round" stroke-width="1.8" d="m20 20-4-4"/></svg><input type="search" placeholder="Search for sweets, snacks, combos..." class="h-11 w-56 rounded-full border border-[#e1c99f] bg-[#fffaf0] pl-11 pr-4 text-xs text-[#351507] outline-none placeholder:text-[#806b58] focus:border-[#b88932] sm:w-72"></label><a href="#" aria-label="Account" class="transition hover:text-[#a06b1c]"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" stroke-width="1.8"/><path stroke-linecap="round" stroke-width="1.8" d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg></a><button type="button" data-open-cart aria-label="Cart" class="relative transition hover:text-[#a06b1c]"><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5h2l1.5 11h10L20 8H7M10 20a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01"/></svg><span data-cart-count class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ad7410] text-[10px] font-bold text-white">0</span></button></div>
      </div>
      <div id="mobileMenuDrawer" class="hidden border-t border-[#eadcc6] bg-[#fff8eb] px-5 py-4 lg:hidden"><nav class="grid gap-1" aria-label="Mobile navigation"><a href="${base}index.html" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Home</a><a href="${base}pages/shop.html" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Halwa</a><a href="${base}pages/shop.html#sweets" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Sweets</a><a href="${base}pages/shop.html#snacks" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Snacks</a><a href="${base}index.html#combo" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Combos</a><a href="${base}pages/shop.html#gift" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Gifting</a><a href="${base}pages/our-story.html" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">About Us</a><a href="${base}pages/contact-us.html" class="rounded px-3 py-2 text-sm font-medium text-[#351507] hover:bg-[#f2dfbc]">Contact</a></nav></div>
    </header>`;

  function mount() {
    const target = document.getElementById("site-header") || document.querySelector("header");
    if (target) target.outerHTML = `<div id="site-header">${headerHTML}</div>`;
    document.getElementById("mobileMenuBtn")?.addEventListener("click", () => document.getElementById("mobileMenuDrawer")?.classList.toggle("hidden"));
    document.querySelector('input[type="search"]')?.addEventListener("input", (event) => window.dispatchEvent(new CustomEvent("nellai:search", { detail: event.target.value })));
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();


