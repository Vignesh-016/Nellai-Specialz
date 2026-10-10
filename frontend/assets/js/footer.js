/* Shared footer injected across the site. */
(function () {
  const basePath = window.location.pathname.includes("/pages/") ? "../" : "./";
  const footerScriptUrl =
    document.currentScript?.src ||
    new URL(`${basePath}assets/js/footer.js`, window.location.href).href;

  const icon = (content, className = "h-5 w-5") => `
    <svg aria-hidden="true" class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${content}
    </svg>`;

  const footerHTML = `
    <footer class="relative overflow-hidden bg-[#FFE5BD] text-[#321307]">
      <img src="${basePath}assets/images/Temple.png" alt="" aria-hidden="true" class="pointer-events-none absolute bottom-0 left-1/2 z-0 h-[85%] w-[min(1100px,100%)] -translate-x-1/2 object-contain object-bottom opacity-[0.05]">
      <div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          <!-- Brand -->
          <section class="lg:pr-10" aria-labelledby="footer-brand-title">
            <a href="${basePath}index.html" class="inline-block" aria-label="Nellai Specialz home">
              <img src="${basePath}assets/images/nellai-specialz-logo.png" alt="Nellai Specialz" class="h-auto w-[180px] object-contain">
            </a>
            <h2 id="footer-brand-title" class="sr-only">Nellai Specialz</h2>
            <p class="mt-0 max-w-xs text-[15px] leading-[1.45] text-[#6B4A35]">
              Traditional sweets and snacks from Tirunelveli, delivered with the same authentic taste to your home.
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <a href="#" aria-label="Facebook" class="flex h-11 w-11 items-center justify-center rounded-full border border-[#8C5A16] text-[#6B3F1E] transition hover:bg-[#dfb664] hover:text-[#321307]">
                ${icon('<path stroke-linecap="round" stroke-width="1.8" d="M14 8h3V5h-3c-2 0-4 2-4 4v2H7v3h3v6h3v-6h3l1-3h-4V9c0-.6.4-1 1-1Z"/>')}
              </a>
              <a href="#" aria-label="Instagram" class="flex h-11 w-11 items-center justify-center rounded-full border border-[#8C5A16] text-[#6B3F1E] transition hover:bg-[#dfb664] hover:text-[#321307]">
                ${icon('<rect x="4" y="4" width="16" height="16" rx="4" stroke-width="1.8"/><circle cx="12" cy="12" r="3.5" stroke-width="1.8"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>')}
              </a>
              <a href="#" aria-label="YouTube" class="flex h-11 w-11 items-center justify-center rounded-full border border-[#8C5A16] text-[#6B3F1E] transition hover:bg-[#dfb664] hover:text-[#321307]">
                ${icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.5 7.5a2 2 0 0 0-1.4-1.4C17.8 5.7 12 5.7 12 5.7s-5.8 0-7.1.4a2 2 0 0 0-1.4 1.4C3.1 8.8 3.1 12 3.1 12s0 3.2.4 4.5a2 2 0 0 0 1.4 1.4c1.3.4 7.1.4 7.1.4s5.8 0 7.1-.4a2 2 0 0 0 1.4-1.4c.4-1.3.4-4.5.4-4.5s0-3.2-.4-4.5Z"/><path d="m10 9 5 3-5 3V9Z"/>')}
              </a>
            </div>
          </section>

          <!-- Shop -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-shop-title">
            <h2 id="footer-shop-title" class="font-serif text-[22px] font-semibold text-[#6B3F1E]">Quick Links</h2>
            <ul class="mt-4 space-y-2 text-[15px] text-[#6B4A35]">
              <li><a href="${basePath}index.html" class="hover:text-[#e7bd6d]">Home</a></li>
              <li><a href="${basePath}pages/shop.html" class="hover:text-[#e7bd6d]">Shop</a></li>
              <li><a href="${basePath}pages/our-story.html" class="hover:text-[#e7bd6d]">About Us</a></li>
              <li><a href="${basePath}pages/contact-us.html" class="hover:text-[#e7bd6d]">Contact Us</a></li>
              <li><a href="${basePath}profile.html" class="hover:text-[#e7bd6d]">My Profile</a></li>
              <li><a href="${basePath}profile.html#orders" class="hover:text-[#e7bd6d]">My Orders</a></li>
              <li><a href="${basePath}pages/contact-us.html#bulk-order" class="hover:text-[#e7bd6d]">Bulk Orders</a></li>
            </ul>
          </section>

          <!-- About -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-about-title">
            <h2 id="footer-about-title" class="font-serif text-[22px] font-semibold text-[#6B3F1E]">Policies</h2>
            <ul class="mt-4 space-y-2 text-[15px] text-[#5B3A29]">
              <li><a href="${basePath}pages/shipping-delivery.html" class="hover:text-[#e7bd6d]">Shipping &amp; Delivery</a></li>
              <li><a href="${basePath}pages/return-refunds.html" class="hover:text-[#e7bd6d]">Returns &amp; Refunds</a></li>
              <li><a href="${basePath}pages/privacy-policy.html" class="hover:text-[#e7bd6d]">Privacy Policy</a></li>
              <li><a href="${basePath}pages/terms-conditions.html" class="hover:text-[#e7bd6d]">Terms &amp; Conditions</a></li>
              <li><a href="${basePath}pages/faq.html" class="hover:text-[#e7bd6d]">FAQs</a></li>
            </ul>
          </section>

          <!-- Customer Care -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-care-title">
            <h2 id="footer-care-title" class="font-serif text-[22px] font-semibold text-[#6B3F1E]">Contact Details</h2>
            <ul class="mt-4 space-y-2 text-[15px] text-[#5B3A29]">
              <li><a href="tel:+917010100590" class="flex items-start gap-2 hover:text-[#8C5A16]">${icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6.6 3.5h2.2l1.3 4-1.8 1.5a13.2 13.2 0 0 0 6.7 6.7l1.5-1.8 4 1.3v2.2a2 2 0 0 1-2.2 2A16.3 16.3 0 0 1 4.4 5.7a2 2 0 0 1 2.2-2.2Z"/>')}<span>+91 70101 00590</span></a></li>
              <li><a href="mailto:nellaispecialz@gmail.com" class="flex items-start gap-2 hover:text-[#8C5A16]">${icon('<rect x="3" y="5" width="18" height="14" rx="2" stroke-width="1.8"/><path stroke-linecap="round" stroke-width="1.8" d="m4 7 8 6 8-6"/>')}<span>nellaispecialz@gmail.com</span></a></li>
              <li class="flex items-start gap-2 leading-relaxed">${icon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2" stroke-width="1.8"/>')}<span>514/260H Indira Nagar,<br>2nd Street Sankar Nagar,<br>Tirunelveli</span></li>
             
            </ul>
          </section>

          <!-- Newsletter -->
          <section class="border-[#845624] lg:border-l lg:pl-8" aria-labelledby="footer-connect-title">
            <h2 id="footer-connect-title" class="font-serif text-[22px] font-semibold text-[#6B3F1E]">Stay Connected</h2>
            <p class="mt-4 max-w-xs text-[15px] leading-relaxed text-[#5B3A29]">Subscribe to get special offers and updates.</p>
            <form class="mt-5 flex h-14 max-w-[300px] overflow-hidden rounded-2xl border border-[#d7a957]" action="#" method="post">
              <label for="footer-email" class="sr-only">Email address</label>
              <input id="footer-email" type="email" placeholder="Enter your email" class="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#321307] outline-none placeholder:text-[#6B4A35]" required>
              <button type="submit" aria-label="Subscribe" class="flex w-14 shrink-0 items-center justify-center bg-[#f2c875] text-[#321307] transition hover:bg-[#ffe3a6]"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 12h13m-6-6 6 6-6 6" /></svg></button>
            </form>
          </section>
        </div>
      </div>

      <div class="relative z-10 border-t border-[#D9B86C]/30 px-4 py-4 text-center text-xs text-[#e7c98d]">© 2026 Nellai Specialz. All Rights Reserved.</div>
    </footer>`;

  function mountFooter() {
    const target = document.getElementById("site-footer");

    if (target) target.innerHTML = footerHTML;

    // Inject Floating Action Buttons & Bulk Order Modal if not already injected
    if (!document.getElementById("floating-actions")) {
      const floatingDiv = document.createElement("div");
      floatingDiv.id = "floating-actions";
      floatingDiv.className =
        "fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end pointer-events-auto";
      floatingDiv.innerHTML = `
        <button type="button" id="openBulkOrderModalBtn" class="group flex items-center gap-2 rounded-full border border-[#D9B86C] bg-[#8C1C13] px-4 py-2.5 text-xs font-bold text-[#FFF8EF] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#7A120A] cursor-pointer">
          <svg class="h-5 w-5 text-[#D9B86C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="tracking-wide">Bulk Order</span>
        </button>

        <a href="https://wa.me/919876543210?text=Hi%20Nellai%20Specialz%2C%20I%20have%20an%20inquiry%20about%20ordering" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-2 rounded-full border border-emerald-400 bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] cursor-pointer" aria-label="Chat on WhatsApp">
          <svg class="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span class="tracking-wide">WhatsApp Us</span>
        </a>
      `;
      document.body.appendChild(floatingDiv);
      floatingDiv
        .querySelector('a[aria-label="Chat on WhatsApp"]')
        ?.setAttribute(
          "href",
          "https://wa.me/917010100590?text=Hi%20Nellai%20Specialz%2C%20I%20have%20an%20inquiry%20about%20ordering",
        );
    }

    if (!document.getElementById("bulkOrderModal")) {
      const modalDiv = document.createElement("div");
      modalDiv.id = "bulkOrderModal";
      modalDiv.className =
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-all duration-300 opacity-0 pointer-events-none";
      modalDiv.innerHTML = `
        <div class="relative w-full max-w-[560px] overflow-hidden rounded-3xl border border-[#D9B86C] bg-[#FFFBF5] shadow-2xl transition-all duration-300 transform scale-95 max-h-[90vh] flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-[#EADBC1] bg-gradient-to-r from-[#7A120A] via-[#8C1C13] to-[#7A120A] px-6 py-4 text-[#FFF8EF] shrink-0">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9B86C]/20 border border-[#D9B86C]/40 text-lg">📦</span>
              <div>
                <h3 class="font-serif text-lg font-bold text-[#FFF8EF]">Bulk & Corporate Enquiry</h3>
                <p class="text-[11px] text-[#F8F1E4]/80">Special rates for weddings, festive gifting & corporate events</p>
              </div>
            </div>
            <button type="button" id="closeBulkOrderModalBtn" class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 transition cursor-pointer" aria-label="Close modal">&times;</button>
          </div>

          <!-- Modal Body Form -->
          <form id="bulkOrderForm" class="p-6 space-y-4 text-[#32110D] overflow-y-auto flex-1">
            <!-- Row 1: Name & Company Name -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="bulkName" class="block text-xs font-bold text-[#5C3A21] mb-1">Name *</label>
                <input type="text" id="bulkName" name="name" maxlength="150" required placeholder="Enter full name" class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] placeholder-[#5C3A21]/40 focus:border-[#8C1C13] focus:outline-none" />
              </div>
              <div>
                <label for="bulkCompany" class="block text-xs font-bold text-[#5C3A21] mb-1">Company Name *</label>
                <input type="text" id="bulkCompany" name="company_name" maxlength="200" required placeholder="Enter company / organization name" class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] placeholder-[#5C3A21]/40 focus:border-[#8C1C13] focus:outline-none" />
              </div>
            </div>

            <!-- Row 2: Phone Number & Employee Size -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="bulkPhone" class="block text-xs font-bold text-[#5C3A21] mb-1">Phone Number *</label>
                <input type="tel" id="bulkPhone" name="phone" maxlength="25" required placeholder="+91 98765 43210" class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] placeholder-[#5C3A21]/40 focus:border-[#8C1C13] focus:outline-none" />
              </div>
              <div>
                <label for="bulkEmpSize" class="block text-xs font-bold text-[#5C3A21] mb-1">Employee Size *</label>
                <select id="bulkEmpSize" name="employee_size" required class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] focus:border-[#8C1C13] focus:outline-none cursor-pointer">
                  <option value="Below 25">Below 25</option>
                  <option value="25–50">25–50</option>
                  <option value="51–100">51–100</option>
                  <option value="101–250">101–250</option>
                  <option value="251–500">251–500</option>
                  <option value="Above 500">Above 500</option>
                </select>
              </div>
            </div>

            <!-- Row 3: Address -->
            <div>
              <label for="bulkAddress" class="block text-xs font-bold text-[#5C3A21] mb-1">Address *</label>
              <input type="text" id="bulkAddress" name="address" maxlength="1000" required placeholder="Full delivery address or office location" class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] placeholder-[#5C3A21]/40 focus:border-[#8C1C13] focus:outline-none" />
            </div>

            <!-- Row 4: Combo Boxes Required Dropdown & Dynamic Custom Quantity -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="bulkComboBoxes" class="block text-xs font-bold text-[#5C3A21] mb-1">Combo Boxes Required *</label>
                <select id="bulkComboBoxes" name="combo_boxes_required" required class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] focus:border-[#8C1C13] focus:outline-none cursor-pointer">
                  <option value="Below 20">Below 20</option>
                  <option value="20 to 50">20 to 50</option>
                  <option value="50 to 100">50 to 100</option>
                  <option value="Customize">Customize</option>
                </select>
              </div>
              
              <!-- Dynamic Custom Quantity Field (hidden until Customize is selected) -->
              <div id="customQtyWrapper" class="hidden">
                <label for="bulkCustomQty" class="block text-xs font-bold text-[#5C3A21] mb-1">Custom Quantity *</label>
                <input type="number" id="bulkCustomQty" name="custom_quantity" min="1" step="1" placeholder="Enter required count" class="w-full rounded-xl border border-[#EADBC1] bg-white px-3.5 py-2.5 text-xs text-[#32110D] placeholder-[#5C3A21]/40 focus:border-[#8C1C13] focus:outline-none" />
              </div>
            </div>

            <label class="hidden" aria-hidden="true">Leave this field empty
              <input name="website" tabindex="-1" autocomplete="off" />
            </label>
            <div id="bulkFormStatus" class="hidden rounded-xl p-3 text-xs font-semibold text-center" role="status" aria-live="polite"></div>

            <!-- Action Buttons: Cancel & Submit Enquiry -->
            <div class="pt-3 border-t border-[#EADBC1] flex items-center justify-end gap-3 shrink-0">
              <button type="button" id="cancelBulkOrderBtn" class="rounded-full border border-[#EADBC1] bg-white px-5 py-2.5 text-xs font-bold text-[#5C3A21] hover:bg-[#F8F1E4] transition cursor-pointer">
                Cancel
              </button>
              <button type="submit" id="submitBulkOrderBtn" class="rounded-full bg-[#8C1C13] px-6 py-2.5 text-xs font-bold text-[#FFF8EF] shadow-md transition hover:bg-[#7A120A] cursor-pointer">
                Submit Enquiry
              </button>
            </div>
          </form>
        </div>
      </div>
      `;
      document.body.appendChild(modalDiv);

      const baseUrl = new URL(".", footerScriptUrl);
      const loadScript = (src) =>
        new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = resolve;
          script.onerror = () => reject(new Error(`Unable to load ${src}`));
          document.head.appendChild(script);
        });
      const ready = window.NellaiApi
        ? Promise.resolve()
        : loadScript(new URL("api.js", baseUrl).href);
      ready
        .then(() =>
          loadScript(new URL("forms/bulk-order-form.js", baseUrl).href),
        )
        .catch((error) => {
          console.error("[Bulk Enquiry]", error);
          const status = document.getElementById("bulkFormStatus");
          if (status) {
            status.textContent =
              "The bulk enquiry form is temporarily unavailable. Please try again later.";
            status.className =
              "rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-center text-red-700";
          }
        });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountFooter);
  } else {
    mountFooter();
  }
})();
