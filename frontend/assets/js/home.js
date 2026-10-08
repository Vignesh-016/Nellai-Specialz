/* Homepage JS: Hero slider, Testimonials switcher, Marquees, Scroll reveals, Cart integration */
(function () {
  function bindHeroSlider() {
    const slides = document.querySelectorAll("[data-hero-slide]");
    const dots = document.querySelectorAll("[data-hero-dot]");
    const prevBtn = document.querySelector("[data-hero-prev]");
    const nextBtn = document.querySelector("[data-hero-next]");
    const sliderContainer = document.querySelector("#hero-slider");

    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.remove(
            "opacity-0",
            "pointer-events-none",
            "absolute",
            "inset-0",
            "z-0",
          );
          slide.classList.add("opacity-100", "relative", "z-10");
        } else {
          slide.classList.remove("opacity-100", "relative", "z-10");
          slide.classList.add(
            "opacity-0",
            "pointer-events-none",
            "absolute",
            "inset-0",
            "z-0",
          );
        }
      });

      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.remove("bg-[#8C1C13]/30", "w-2.5");
          dot.classList.add("bg-[#8C1C13]", "w-7");
          dot.setAttribute("aria-current", "true");
        } else {
          dot.classList.remove("bg-[#8C1C13]", "w-7");
          dot.classList.add("bg-[#8C1C13]/30", "w-2.5");
          dot.removeAttribute("aria-current");
        }
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 6000);
    }

    function stopTimer() {
      if (timer) clearInterval(timer);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goToSlide(i);
        startTimer();
      });
    });

    prevBtn?.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      startTimer();
    });

    nextBtn?.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      startTimer();
    });

    sliderContainer?.addEventListener("mouseenter", stopTimer);
    sliderContainer?.addEventListener("mouseleave", startTimer);

    goToSlide(0);
    startTimer();
  }

  function bindTestimonialSlider() {
    const section = document.querySelector("#testimonials");
    if (!section) return;
    const cards = section.querySelectorAll("[data-testimonial-slide]");
    const dots = section.querySelectorAll("[data-testimonial-dot]");
    const prevBtn = section.querySelector("[data-testimonial-prev]");
    const nextBtn = section.querySelector("[data-testimonial-next]");

    if (!cards.length) return;

    let currentIndex = 0;
    let timer = null;

    function showCard(index) {
      currentIndex = (index + cards.length) % cards.length;
      cards.forEach((card, i) => {
        if (i === currentIndex) {
          card.classList.remove("hidden");
          card.classList.add("block");
        } else {
          card.classList.remove("block");
          card.classList.add("hidden");
        }
      });

      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.remove("bg-[#8C1C13]/30", "w-2");
          dot.classList.add("bg-[#8C1C13]", "w-6");
        } else {
          dot.classList.remove("bg-[#8C1C13]", "w-6");
          dot.classList.add("bg-[#8C1C13]/30", "w-2");
        }
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(() => {
        showCard(currentIndex + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) clearInterval(timer);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        showCard(i);
        startTimer();
      });
    });

    prevBtn?.addEventListener("click", () => {
      showCard(currentIndex - 1);
      startTimer();
    });

    nextBtn?.addEventListener("click", () => {
      showCard(currentIndex + 1);
      startTimer();
    });

    showCard(0);
    startTimer();
  }

  function reveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    items.forEach((item) => {
      item.classList.add("transition", "duration-700", "ease-out");
      item.classList.add("opacity-0", "translate-y-6");
    });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-6");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 },
    );
    items.forEach((item) => observer.observe(item));
  }

  function bindGalleryAutoScroll() {
    const container = document.getElementById("gallery-container");
    const track = document.getElementById("gallery-track");
    if (!container || !track) return;

    let isDown = false;
    let startX, scrollLeft;

    container.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener("mouseleave", () => { isDown = false; });
    container.addEventListener("mouseup", () => { isDown = false; });

    container.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });
  }

  /* Product section rendering lives in home/home-product-section.js. */
  /* function renderHomeProducts(products, grid) {
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
    const imageUrl = (value) => !value ? '' : (/^https?:\/\//i.test(value) ? value : `https://backend.nellaispecialz.com/${String(value).replace(/^\//, '')}`);
    const seen = new Set();
    const selected = products.filter((p) => String(p.status || '').toLowerCase() === 'active' && !seen.has(p.id) && seen.add(p.id)).slice(0, 4);
    if (!selected.length) { grid.textContent = 'No products available.'; return; }
    grid.innerHTML = selected.map((p) => {
      const variations = (p.variations || []).filter((v) => String(v.status || 'ACTIVE').toLowerCase() === 'active');
      const prices = variations.map((v) => Number(v.selling_price ?? v.price ?? v.sale_price)).filter((v) => Number.isFinite(v) && v > 0);
      const price = prices.length ? Math.min(...prices) : Number(p.selling_price ?? p.sale_price ?? p.offer_price ?? 0);
      const variation = variations[0];
      const weight = variation?.weight || variation?.variation_name || [p.weight, p.weight_unit].filter(Boolean).join(' ');
      const rawImage = [p.main_image, p.image, ...(p.images || []).map((x) => x.image_url || x.image_path || x)].filter(Boolean)[0];
      const image = imageUrl(rawImage) || 'assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png';
      const badge = p.badge || p.ingredient_type || '';
      const href = `pages/product-detail.html?slug=${encodeURIComponent(p.slug || '')}`;
      return `<div class="group flex flex-col justify-between relative h-full"><a href="${href}" class="block relative z-10 mx-auto w-[90%] mb-3 overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-105"><img src="${image}" alt="${esc(p.name)}" class="h-44 w-full object-cover rounded-xl shadow-xs" onerror="this.onerror=null;this.src='assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png';">${badge ? `<span class="absolute top-3 left-3 z-20 rounded-full bg-[#8C1C13] px-2.5 py-0.5 text-[10px] font-bold text-[#FFF8EF] shadow-xs">${esc(badge)}</span>` : ''}</a><div class="p-4 rounded-2xl border border-[#EADBC1] bg-[#FFFBF5] shadow-xs flex-1 flex flex-col justify-between group-hover:border-[#8C1C13]/40 group-hover:shadow-md transition-all"><div><div class="flex items-center justify-between gap-2"><a href="${href}" class="font-serif text-xl font-bold text-[#32110D] hover:text-[#8C1C13] transition">${esc(p.name)}</a>${weight ? `<span class="text-[10px] font-bold text-[#8C1C13] bg-[#8C1C13]/10 px-2 py-0.5 rounded-md whitespace-nowrap">${esc(weight)}</span>` : ''}</div></div><div class="mt-4 pt-3 border-t border-[#EADBC1]"><div class="flex items-baseline justify-between mb-2.5"><span class="text-[11px] font-semibold text-[#5C3A21]">Price</span><strong class="font-serif text-xl font-bold text-[#32110D]">₹${price.toLocaleString('en-IN')}</strong></div><a href="${href}" class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C1C13] py-2.5 text-xs font-bold text-[#FFF8EF] shadow-xs transition-all duration-200 hover:bg-[#7A120A]">View Product →</a></div></div></div>`;
    }).join('');
  }

  async function bindHomeProducts() {
    const grid = document.querySelector('[data-home-products]');
    if (!grid || !window.NellaiApi) return;
    const fallback = grid.innerHTML;
    try {
      const products = await window.NellaiApi.request('products/get.php?limit=100');
      const active = products.filter((p) => String(p.status || '').toLowerCase() === 'active');
      const featured = active.filter((p) => Number(p.featured) === 1);
      renderHomeProducts(featured.length ? featured : active, grid);
    } catch (error) {
      console.error('[Home] Products API failed:', error);
      grid.innerHTML = fallback;
    }
  } */

  document.addEventListener("DOMContentLoaded", () => {
    bindHeroSlider();
    bindTestimonialSlider();
    bindGalleryAutoScroll();
    reveal();
  });
})();
