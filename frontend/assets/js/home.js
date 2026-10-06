/* Homepage-only interactions: hero slider, auto-scrolling marquees, scroll reveals, and cart hooks. */
(function () {
  const products = {
    "karupatti-halwa": {
      id: "karupatti-halwa",
      name: "Karupatti Halwa",
      price: 199,
      image: "assets/images/products/karupatti-halwa.jpg",
      weight: "250g",
    },
    "ghee-halwa": {
      id: "ghee-halwa",
      name: "Ghee Halwa",
      price: 189,
      image: "assets/images/products/ghee-halwa.jpg",
      weight: "250g",
    },
    "cashew-halwa": {
      id: "cashew-halwa",
      name: "Cashew Halwa",
      price: 219,
      image: "assets/images/products/classic-halwa.jpg",
      weight: "250g",
    },
    "dry-fruit-halwa": {
      id: "dry-fruit-halwa",
      name: "Special Dry Fruit Halwa",
      price: 249,
      image: "assets/images/Glistening Halwa in Brass Bowl.webp",
      weight: "250g",
    },
    "diwali-box": {
      id: "diwali-box",
      name: "Diwali Special Treat Box",
      price: 999,
      image: "assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png",
      weight: "1kg Assorted",
    }
  };

  function injectMarqueeStyles() {
    if (document.getElementById("homepage-marquee-styles")) return;
    const style = document.createElement("style");
    style.id = "homepage-marquee-styles";
    style.textContent = `
      @keyframes uspMarqueeAnim {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      .animate-usp-marquee {
        display: flex;
        width: max-content;
        animation: uspMarqueeAnim 32s linear infinite;
        will-change: transform;
      }
      .animate-usp-marquee:hover {
        animation-play-state: paused;
      }

      @keyframes testimonialMarqueeAnim {
        0% { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      .animate-testimonial-marquee {
        display: flex;
        width: max-content;
        animation: testimonialMarqueeAnim 42s linear infinite;
        will-change: transform;
      }
      .animate-testimonial-marquee:hover {
        animation-play-state: paused;
      }

      @media (prefers-reduced-motion: reduce) {
        .animate-usp-marquee,
        .animate-testimonial-marquee {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function bindUspMarquee() {
    const container = document.querySelector("[data-usp-marquee]");
    if (!container || container.dataset.marqueeReady) return;
    const sequence = container.innerHTML;
    container.innerHTML = `
      <div class="animate-usp-marquee flex items-center">
        <div class="flex items-center gap-8 pr-8 shrink-0">${sequence}</div>
        <div class="flex items-center gap-8 pr-8 shrink-0" aria-hidden="true">${sequence}</div>
      </div>
    `;
    container.dataset.marqueeReady = "true";
  }

  function bindTestimonialMarquee() {
    const container = document.querySelector("[data-testimonial-marquee]");
    if (!container || container.dataset.marqueeReady) return;
    const sequence = container.innerHTML;
    container.innerHTML = `
      <div class="animate-testimonial-marquee flex items-stretch">
        <div class="flex items-stretch gap-6 pr-6 shrink-0">${sequence}</div>
        <div class="flex items-stretch gap-6 pr-6 shrink-0" aria-hidden="true">${sequence}</div>
      </div>
    `;
    container.dataset.marqueeReady = "true";
  }

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
          slide.classList.remove("opacity-0", "pointer-events-none", "absolute", "inset-0", "z-0");
          slide.classList.add("opacity-100", "relative", "z-10");
        } else {
          slide.classList.remove("opacity-100", "relative", "z-10");
          slide.classList.add("opacity-0", "pointer-events-none", "absolute", "inset-0", "z-0");
        }
      });

      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.remove("bg-[#f3cd7c]/40", "w-3");
          dot.classList.add("bg-[#f3cd7c]", "w-8");
          dot.setAttribute("aria-current", "true");
        } else {
          dot.classList.remove("bg-[#f3cd7c]", "w-8");
          dot.classList.add("bg-[#f3cd7c]/40", "w-3");
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
      { threshold: 0.12 },
    );
    items.forEach((item) => observer.observe(item));
  }

  function bindCart() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      const card = button.closest("article") || button.closest("section");
      const value = card?.querySelector("[data-qty-value]");
      let quantity = 1;
      card?.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
        quantity = Math.max(1, quantity - 1);
        if (value) value.textContent = quantity;
      });
      card?.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
        quantity += 1;
        if (value) value.textContent = quantity;
      });
      button.addEventListener("click", () => {
        const product = products[button.dataset.addToCart];
        if (product && window.NellaiStore)
          window.NellaiStore.addToCart({ ...product, quantity });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectMarqueeStyles();
    bindUspMarquee();
    bindTestimonialMarquee();
    bindHeroSlider();
    reveal();
    bindCart();
  });
  window.NELLAI_PRODUCTS = Object.values(products);
})();


