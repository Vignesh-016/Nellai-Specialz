/**
 * Nellai Specialz — Dynamic Footer Injector (footer.js)
 * Pure Tailwind CSS styled with Glass Blur aesthetic.
 */
(function () {
  const currentPath = window.location.pathname;
  const isSubpage = currentPath.includes('/pages/');
  const basePath = isSubpage ? '../' : './';

  const footerHTML = `
  <!-- MAIN FOOTER -->
  <footer class="bg-[#1C0906] py-16 text-[#FBF5E9] border-t border-[#B88932]/20 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
      
      <!-- Col 1: Logo & Info (Enlarged Logo & Bio text size) -->
      <div class="lg:col-span-2">
        <a href="${basePath}index.html" class="inline-block py-1">
          <img src="${basePath}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz Logo" class="h-24 sm:h-28 lg:h-32 max-h-36 w-auto object-contain brightness-110">
        </a>
        <p class="mt-5 text-base sm:text-lg font-serif italic text-[#D9B86C] font-semibold leading-relaxed">
          The Original Taste of Tirunelveli.
        </p>
        <p class="mt-1.5 font-serif text-sm sm:text-base text-[#FBF5E9]/90 leading-relaxed">
          நம்ம ஊர். நம்ம அல்வா.
        </p>
        <p class="mt-1.5 font-serif text-sm sm:text-base text-[#D9B86C] font-semibold">
          அன்புடன்.
        </p>
      </div>

      <!-- Col 2: Quick Links -->
      <div>
        <h3 class="text-sm font-bold uppercase tracking-[0.18em] text-[#D9B86C]">Quick Links</h3>
        <ul class="mt-4 space-y-2.5 text-xs sm:text-sm text-[#FBF5E9]/80">
          <li><a class="hover:text-white transition" href="${basePath}index.html">Home</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/shop.html">Shop All Products</a></li>
          <li><a class="hover:text-white transition" href="${basePath}index.html#combo">Combo</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/our-story.html">Our Story</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/contact-us.html">Contact Us</a></li>
        </ul>
      </div>

      <!-- Col 3: Customer Care -->
      <div>
        <h3 class="text-sm font-bold uppercase tracking-[0.18em] text-[#D9B86C]">Customer Care</h3>
        <ul class="mt-4 space-y-2.5 text-xs sm:text-sm text-[#FBF5E9]/80">
          <li><a class="hover:text-white transition" href="${basePath}pages/shop.html">Shopping</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/faq.html">FAQ</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/shipping-delivery.html">Shopping Policy</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/privacy-policy.html">Privacy Policy</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/terms-conditions.html">Terms &amp; Conditions</a></li>
          <li><a class="hover:text-white transition" href="${basePath}pages/return-refunds.html">Return &amp; Refunds</a></li>
        </ul>
      </div>

      <!-- Col 4: Contact Info -->
      <div>
        <h3 class="text-sm font-bold uppercase tracking-[0.18em] text-[#D9B86C]">Contact Us</h3>
        <ul class="mt-4 space-y-2.5 text-xs sm:text-sm text-[#FBF5E9]/80">
          <li class="flex items-start gap-2">
            <span class="text-[#D9B86C] shrink-0 mt-0.5">📍</span> 
            <span>514/260H Indira Nagar , 2nd Street Sankar Nagar, Tirunelveli – 627357</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-[#D9B86C] shrink-0">📞</span> 
            <a href="tel:+917010100590" class="hover:text-white transition">+91 70101 00590</a>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-[#D9B86C] shrink-0">✉️</span> 
            <a href="mailto:nellaispecialz@gmail.com" class="hover:text-white transition">nellaispecialz@gmail.com</a>
          </li>
        </ul>
      </div>

    </div>

    <!-- Bottom Copyright (Centered Alignment) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-[#FBF5E9]/10 pt-6 text-center relative z-10">
      <p class="text-xs sm:text-sm text-[#FBF5E9]/70 font-sans tracking-wide text-center">© 2026 Nellai Specialz. All rights reserved.</p>
    </div>
  </footer>
  `;

  function mountFooter() {
    let target = document.getElementById('site-footer') || document.querySelector('footer');
    if (!target) {
      target = document.createElement('div');
      target.id = 'site-footer';
      document.body.appendChild(target);
    }
    target.outerHTML = `<div id="site-footer">${footerHTML}</div>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountFooter);
  } else {
    mountFooter();
  }
})();
