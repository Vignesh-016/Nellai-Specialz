/* Shared footer injected across the site. */
(function () {
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";

  const icon = (content, className = "h-5 w-5") => `
    <svg aria-hidden="true" class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${content}
    </svg>`;

  const footerHTML = `
    <footer class="relative overflow-hidden bg-[#321307] text-[#fff3d6]">
      <div class="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          <!-- Brand -->
          <section class="lg:pr-10" aria-labelledby="footer-brand-title">
            <a href="${basePath}index.html" class="inline-block" aria-label="Nellai Specialz home">
              <img src="${basePath}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz" class="h-auto w-[180px] object-contain">
            </a>
            <h2 id="footer-brand-title" class="sr-only">Nellai Specialz</h2>
            <p class="mt-0 max-w-xs text-[15px] leading-[1.45] text-[#f6dfbd]">
              Traditional sweets and snacks from Tirunelveli, delivered with the same authentic taste to your home.
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <a href="#" aria-label="Facebook" class="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfb664] text-[#f5d99b] transition hover:bg-[#dfb664] hover:text-[#321307]">
                ${icon('<path stroke-linecap="round" stroke-width="1.8" d="M14 8h3V5h-3c-2 0-4 2-4 4v2H7v3h3v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1Z"/>')}
              </a>
              <a href="#" aria-label="Instagram" class="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfb664] text-[#f5d99b] transition hover:bg-[#dfb664] hover:text-[#321307]">
                ${icon('<rect x="4" y="4" width="16" height="16" rx="4" stroke-width="1.8"/><circle cx="12" cy="12" r="3.5" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>')}
              </a>
              <a href="#" aria-label="YouTube" class="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfb664] text-[#f5d99b] transition hover:bg-[#dfb664] hover:text-[#321307]">
                ${icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.5 7.5a2 2 0 0 0-1.4-1.4C17.8 5.7 12 5.7 12 5.7s-5.8 0-7.1.4a2 2 0 0 0-1.4 1.4C3.1 8.8 3.1 12 3.1 12s0 3.2.4 4.5a2 2 0 0 0 1.4 1.4c1.3.4 7.1.4 7.1.4s5.8 0 7.1-.4a2 2 0 0 0 1.4-1.4c.4-1.3.4-4.5.4-4.5s0-3.2-.4-4.5Z"/><path d="m10 9 5 3-5 3V9Z"/>')}
              </a>
            </div>
          </section>

          <!-- Shop -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-shop-title">
            <h2 id="footer-shop-title" class="font-serif text-[22px] font-semibold text-[#e7bd6d]">Shop</h2>
            <ul class="mt-4 space-y-2 text-[15px] text-[#f6dfbd]">
              <li><a href="${basePath}pages/shop.html" class="hover:text-white">Halwa</a></li>
              <li><a href="${basePath}pages/shop.html" class="hover:text-white">Sweets</a></li>
              <li><a href="${basePath}pages/shop.html" class="hover:text-white">Snacks &amp; Mixtures</a></li>
              <li><a href="${basePath}index.html#combo" class="hover:text-white">Combos</a></li>
              <li><a href="${basePath}pages/shop.html" class="hover:text-white">Gift Boxes</a></li>
            </ul>
          </section>

          <!-- About -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-about-title">
            <h2 id="footer-about-title" class="font-serif text-[22px] font-semibold text-[#e7bd6d]">About</h2>
            <ul class="mt-4 space-y-2 text-[15px] text-[#f6dfbd]">
              <li><a href="${basePath}pages/our-story.html" class="hover:text-white">Our Story</a></li>
              <li><a href="${basePath}pages/our-story.html" class="hover:text-white">Our Ingredients</a></li>
              <li><a href="${basePath}pages/our-story.html" class="hover:text-white">Our Process</a></li>
              <li><a href="${basePath}pages/our-story.html" class="hover:text-white">Quality Assurance</a></li>
              <li><a href="${basePath}pages/contact-us.html" class="hover:text-white">Contact Us</a></li>
            </ul>
          </section>

          <!-- Customer Care -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-care-title">
            <h2 id="footer-care-title" class="font-serif text-[22px] font-semibold text-[#e7bd6d]">Customer Care</h2>
            <ul class="mt-4 space-y-2 text-[15px] text-[#f6dfbd]">
              <li><a href="${basePath}pages/shop.html" class="hover:text-white">Track Your Order</a></li>
              <li><a href="${basePath}pages/shipping-delivery.html" class="hover:text-white">Shipping &amp; Delivery</a></li>
              <li><a href="${basePath}pages/return-refunds.html" class="hover:text-white">Returns &amp; Refunds</a></li>
              <li><a href="${basePath}pages/faq.html" class="hover:text-white">FAQs</a></li>
              <li><a href="${basePath}pages/contact-us.html" class="hover:text-white">Bulk Orders</a></li>
            </ul>
          </section>

          <!-- Newsletter -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-connect-title">
            <h2 id="footer-connect-title" class="font-serif text-[22px] font-semibold text-[#e7bd6d]">Stay Connected</h2>
            <p class="mt-4 max-w-xs text-[15px] leading-relaxed text-[#f6dfbd]">Subscribe to get special offers and updates.</p>
            <form class="mt-5 flex h-14 max-w-[300px] overflow-hidden rounded-2xl border border-[#d7a957]" action="#" method="post">
              <label for="footer-email" class="sr-only">Email address</label>
              <input id="footer-email" type="email" placeholder="Enter your email" class="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-[#f6dfbd]" required>
              <button type="submit" aria-label="Subscribe" class="flex w-14 shrink-0 items-center justify-center bg-[#f2c875] text-[#321307] transition hover:bg-[#ffe3a6]"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 12h13m-6-6 6 6-6 6" /></svg></button>
            </form>
          </section>
        </div>
      </div>

      <!-- Decorative skyline -->
      <div class=" border-[#a8752c]/60">
        <div class="relative h-20 overflow-hidden sm:h-24 lg:h-28"><img src="${basePath}assets/images/Temple.png" alt="" class="absolute inset-x-0 bottom-0 mx-auto h-full w-full object-contain object-bottom opacity-40"></div>
      </div>

      <div class="border-t border-[#845624] px-4 py-4 text-center text-xs text-[#e7c98d]">© 2026 Nellai Specialz. All Rights Reserved.</div>
    </footer>`;

  function mountFooter() {
    const target = document.getElementById("site-footer");

    if (target) target.innerHTML = footerHTML;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountFooter);
  } else {
    mountFooter();
  }
})();


