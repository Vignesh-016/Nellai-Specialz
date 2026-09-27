/**
 * Nellai Specialz — Dynamic Header Injector (header.js)
 * Pure Tailwind CSS styled with Glass Blur aesthetic.
 */
(function () {
  const currentPath = window.location.pathname;
  const isSubpage = currentPath.includes('/pages/');
  const basePath = isSubpage ? '../' : './';

  const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
  const isShop = currentPath.includes('shop.html') || currentPath.includes('product-detail.html');
  const isStory = currentPath.includes('our-story.html');
  const isContact = currentPath.includes('contact-us.html');

  const headerHTML = `
  <!-- 1. TOP ANNOUNCEMENT BAR -->
  <div class="bg-[#32110D] border-b border-[#B88932]/30 py-2.5 px-4 text-[#FBF5E9]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] sm:text-xs">
      
      <!-- Tamil Tagline Left -->
      <div class="flex items-center gap-2 font-medium text-[#F5E6C8]">
        <span class="text-[12px] sm:text-[13px] tracking-wide text-[#F5E6C8] font-serif">ஸ்ரீ திருநெல்வேலியின் சுவை — உங்கள் வீட்டிற்கே</span>
      </div>

      <!-- WhatsApp Action Right -->
      <a href="https://wa.me/917010100590" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 font-semibold text-[#D9B86C] hover:text-white transition">
        <svg class="w-4 h-4 text-green-400 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.242-1.111z"/></svg>
        WhatsApp Us
      </a>
    </div>
  </div>

  <!-- 2. HEADER NAVIGATION WITH GLASS BLUR -->
  <header class="sticky top-0 z-40 border-b border-[#5A160F]/15 bg-[#FBF5E9]/90 backdrop-blur-md shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3 sm:py-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
      
      <!-- Brand Logo - Improvised Large Size & Quality -->
      <a href="${basePath}index.html" class="flex items-center gap-3 group lg:justify-self-center py-1">
        <img src="${basePath}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz Logo" class="h-16 sm:h-20 lg:h-24 max-h-24 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105">
      </a>

      <!-- Primary Navigation Links (Home, Shop, Combo, Our Story, Contact Us) -->
      <nav class="hidden items-center gap-7 text-sm font-semibold text-[#32110D] lg:flex lg:order-first lg:justify-self-start" aria-label="Primary">
        <a class="${isHome ? 'text-[#5A160F] font-bold border-b-2 border-[#5A160F] pb-0.5' : 'hover:text-[#5A160F] transition-colors'}" href="${basePath}index.html">Home</a>
        <a class="${isShop ? 'text-[#5A160F] font-bold border-b-2 border-[#5A160F] pb-0.5' : 'hover:text-[#5A160F] transition-colors'}" href="${basePath}pages/shop.html">Shop</a>
        <a class="hover:text-[#5A160F] transition-colors" href="${basePath}index.html#combo">Combo</a>
        <a class="${isStory ? 'text-[#5A160F] font-bold border-b-2 border-[#5A160F] pb-0.5' : 'hover:text-[#5A160F] transition-colors'}" href="${basePath}pages/our-story.html">Our Story</a>
        <a class="${isContact ? 'text-[#5A160F] font-bold border-b-2 border-[#5A160F] pb-0.5' : 'hover:text-[#5A160F] transition-colors'}" href="${basePath}pages/contact-us.html">Contact Us</a>
      </nav>

      <!-- Action Utilities -->
      <div class="flex items-center gap-2 lg:justify-self-end">
        <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#32110D] hover:bg-[#5A160F]/10 hover:text-[#5A160F] transition" data-open-search aria-label="Search">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>
        <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#32110D] hover:bg-[#5A160F]/10 hover:text-[#5A160F] transition" data-open-account aria-label="Account">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </button>
        <button type="button" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#32110D] hover:bg-[#5A160F]/10 hover:text-[#5A160F] transition" data-open-cart aria-label="Open cart">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <span data-cart-count class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5A160F] text-[10px] font-bold leading-none text-[#FBF5E9] shadow-sm ring-2 ring-[#FBF5E9]">0</span>
        </button>
        <button type="button" id="mobileMenuBtn" class="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#32110D] lg:hidden" aria-label="Open menu">
          <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

    </div>
  </header>
  `;

  function mountHeader() {
    let target = document.getElementById('site-header') || document.querySelector('header');
    if (!target) {
      target = document.createElement('div');
      target.id = 'site-header';
      document.body.prepend(target);
    }
    target.outerHTML = `<div id="site-header">${headerHTML}</div>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountHeader);
  } else {
    mountHeader();
  }
})();
