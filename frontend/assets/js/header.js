/**
 * Nellai Specialz — Dynamic Header Injector (header.js)
 * Exact reference design matching user specification.
 */
(function () {
  const currentPath = window.location.pathname;
  const isSubpage = currentPath.includes('/pages/');
  const basePath = isSubpage ? '../' : './';

  const isHome = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '' || currentPath.endsWith('index.html#') || (!currentPath.includes('.html') && !isSubpage);
  const isStory = currentPath.includes('our-story.html');
  const isShop = currentPath.includes('shop.html') || currentPath.includes('product-detail.html');

  const headerHTML = `
  <!-- 1. TOP ANNOUNCEMENT BAR (Dark Burgundy Background with Warm Gold Text) -->
  <div class="ns-topbar bg-[#3D0C07] text-[#E8C88A] py-2 px-4 text-xs font-medium border-b border-[#5A1910]">
    <div class="max-w-[1460px] mx-auto flex items-center justify-between gap-4">
      
      <!-- Left: Social Media Icons -->
      <div class="flex items-center gap-3.5">
        <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" class="text-[#E8C88A] hover:text-white transition-colors">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" class="text-[#E8C88A] hover:text-white transition-colors">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube" class="text-[#E8C88A] hover:text-white transition-colors">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
        </a>
      </div>

      <!-- Center Announcement text -->
      <div class="ns-topbar-message flex items-center justify-center gap-4 text-[11px] sm:text-xs font-medium tracking-wider text-[#E8C88A]">
        <span class="flex items-center gap-1.5"><span class="text-[#E8C88A]">❖</span> Freshly Prepared Traditional Halwa <span class="text-[#E8C88A]">❖</span></span>
        <span class="flex items-center gap-1.5"><span>🎁</span> Festival Offers Live Now <span class="text-[#E8C88A]">❖</span></span>
      </div>

      <!-- Right Links -->
      <div class="flex items-center gap-4 text-[11px] sm:text-xs font-medium text-[#E8C88A]">
        <a href="${basePath}pages/our-story.html" class="hover:text-white transition-colors">About Us</a>
        <span class="text-[#E8C88A]/40">|</span>
        <a href="${basePath}pages/contact-us.html" class="hover:text-white transition-colors">Contact Us</a>
      </div>

    </div>
  </div>

  <!-- 2. MAIN HEADER NAVIGATION (Soft Ivory Cream background, Centered Logo) -->
  <header class="ns-main-header sticky top-0 z-40 bg-[#FAF5EB] border-b border-[#E8DFC8] shadow-xs">
    <div class="ns-nav-inner max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 lg:grid lg:grid-cols-12">
      
      <!-- Left Desktop Links (Cols 1-4) -->
      <nav class="hidden lg:flex items-center gap-6 xl:gap-8 lg:col-span-4 text-xs xl:text-[13px] font-bold tracking-widest text-[#32110D]">
        <a href="${basePath}index.html" class="relative py-1 group ${isHome ? 'text-[#801412]' : 'hover:text-[#801412]'}">
          HOME
          <span class="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#801412] ${isHome ? 'block' : 'hidden group-hover:block'}"></span>
        </a>
        <a href="${basePath}pages/our-story.html" class="relative py-1 group ${isStory ? 'text-[#801412]' : 'hover:text-[#801412]'}">
          OUR STORY
        </a>
        <a href="${basePath}pages/shop.html" class="relative py-1 group inline-flex items-center gap-1 ${isShop ? 'text-[#801412]' : 'hover:text-[#801412]'}">
          SHOP
          <svg class="w-3 h-3 text-[#32110D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
        </a>
        <a href="${basePath}index.html#combo" class="relative py-1 group hover:text-[#801412]">
          HALWA COMBOS
        </a>
      </nav>

      <!-- Mobile Menu Button (Left on mobile) -->
      <button type="button" id="mobileMenuBtn" class="lg:hidden p-1.5 text-[#32110D]" aria-label="Open Menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>

      <!-- Center Logo (Cols 5-8) -->
      <div class="ns-logo lg:col-span-4 flex flex-col items-center justify-center text-center">
        <a href="${basePath}index.html" class="inline-flex flex-col items-center group">
          <img src="${basePath}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz" class="h-12 sm:h-14 w-auto object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
          <div class="hidden flex-col items-center">
            <span class="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-[#5A120C]">NELLAI</span>
            <div class="flex items-center gap-1.5 -mt-0.5">
              <span class="h-[1px] w-3 bg-[#B88932]"></span>
              <span class="text-[10px] font-bold tracking-[0.25em] text-[#32110D]">SPECIALZ</span>
              <span class="h-[1px] w-3 bg-[#B88932]"></span>
            </div>
            <span class="text-[8px] font-semibold tracking-[0.18em] text-[#655546] uppercase mt-0.5">TRADITIONAL SWEETS & SNACKS</span>
          </div>
        </a>
      </div>

      <!-- Right Utilities: Search + Wishlist + Account + Cart (Cols 9-12) -->
      <div class="ns-tools lg:col-span-4 flex items-center justify-end gap-3 sm:gap-4">
        
        <!-- Search Pill -->
        <div class="ns-search relative">
          <input type="text" placeholder="Search for Halwa..." class="h-11 w-44 rounded-full border border-[#D8C9B4] bg-[#FFFDF8] py-0 pl-4 pr-12 text-xs text-[#32110D] placeholder-[#8C7D6F] focus:outline-none focus:ring-1 focus:ring-[#801412] md:w-52 lg:w-60">
          <button type="button" class="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#32110D] hover:text-[#801412]" aria-label="Search">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>
        </div>

        <!-- Utility Icons Group -->
        <div class="flex items-center gap-2.5 sm:gap-3.5 text-[#32110D]">
          
          <!-- Wishlist Heart -->
          <a href="#" class="relative p-1 hover:text-[#801412] transition-colors" aria-label="Wishlist">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#801412] text-[9px] font-bold text-white">0</span>
          </a>

          <!-- User Account -->
          <a href="#" class="p-1 hover:text-[#801412] transition-colors" aria-label="Account">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </a>

          <span class="h-4 w-[1px] bg-[#D8C9B4] hidden sm:block"></span>

          <!-- Shopping Cart Bag -->
          <button type="button" data-open-cart class="relative p-1 hover:text-[#801412] transition-colors" aria-label="Cart">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span data-cart-count class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#801412] text-[9px] font-bold text-white">0</span>
          </button>

        </div>

      </div>

    </div>

    <!-- Mobile Drawer -->
    <div id="mobileMenuDrawer" class="hidden lg:hidden border-t border-[#E8DFC8] bg-[#FAF5EB] px-4 py-4 space-y-2">
      <a href="${basePath}index.html" class="block px-3 py-2 rounded-md font-bold text-sm text-[#32110D] hover:bg-[#801412]/10">HOME</a>
      <a href="${basePath}pages/our-story.html" class="block px-3 py-2 rounded-md font-bold text-sm text-[#32110D] hover:bg-[#801412]/10">OUR STORY</a>
      <a href="${basePath}pages/shop.html" class="block px-3 py-2 rounded-md font-bold text-sm text-[#32110D] hover:bg-[#801412]/10">SHOP ALL PRODUCTS</a>
      <a href="${basePath}index.html#combo" class="block px-3 py-2 rounded-md font-bold text-sm text-[#32110D] hover:bg-[#801412]/10">HALWA COMBOS</a>
      <a href="${basePath}pages/contact-us.html" class="block px-3 py-2 rounded-md font-bold text-sm text-[#32110D] hover:bg-[#801412]/10">CONTACT US</a>
    </div>
  </header>
  `;

  const headerStyles = document.createElement('style');
  headerStyles.textContent = `
    .ns-topbar { background:#3D0C07 !important; color:#E8C88A !important; min-height:38px; border-color:#5A1910 !important; }
    .ns-topbar > div,.ns-nav-inner { width:100%; max-width:1460px; margin-left:auto; margin-right:auto; }
    .ns-topbar a { color:#E8C88A !important; }
    .ns-topbar a:hover { color:#FFFFFF !important; }
    .ns-main-header { background:#FAF5EB !important; border-color:#E8DFC8 !important; box-shadow:0 1px 3px rgba(0,0,0,0.05) !important; backdrop-filter:none !important; }
    .ns-nav-inner { min-height:80px; max-width:1460px; padding-top:10px !important; padding-bottom:10px !important; }
    .ns-main-header nav { align-self:center; gap:28px; font-size:13px; letter-spacing:.08em; }
    .ns-main-header nav a { color:#32110D; }
    .ns-main-header nav a:hover { color:#801412; }
    .ns-main-header input { background:#FFFDF8; border-color:#D8C9B4; }
    @media (min-width:1024px) {
      .ns-nav-inner { display:grid !important; grid-template-columns:1fr auto 1fr !important; align-items:center; min-height:80px; }
      .ns-nav-inner > nav { grid-column:1; grid-row:1; justify-self:start; }
      .ns-nav-inner > .ns-logo { grid-column:2; grid-row:1; justify-self:center; }
      .ns-nav-inner > .ns-tools { grid-column:3; grid-row:1; justify-self:end; }
      .ns-nav-inner > .ns-logo img { height:56px; }
    }
    .ns-topbar-message { display:flex !important; }
    .ns-search { display:block !important; width:240px; flex:0 0 240px; }
    .ns-search input { display:block; width:100%; height:36px; }
    .ns-main-header .ns-tools { gap:16px !important; }
    @media (max-width:1200px) { .ns-search { width:200px; flex-basis:200px; } }
    @media (max-width:767px) { .ns-topbar-message { display:none !important; } .ns-search { display:none !important; } }
  `;
  document.head.appendChild(headerStyles);

  function mountHeader() {
    let target = document.getElementById('site-header') || document.querySelector('header');
    if (!target) {
      target = document.createElement('div');
      target.id = 'site-header';
      document.body.prepend(target);
    }
    target.outerHTML = `<div id="site-header">${headerHTML}</div>`;

    const btn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileMenuDrawer');
    if (btn && drawer) {
      btn.addEventListener('click', () => drawer.classList.toggle('hidden'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountHeader);
  } else {
    mountHeader();
  }
})();
