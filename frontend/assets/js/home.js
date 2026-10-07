/* Homepage JS: Hero slider, Testimonials switcher, Marquees, Scroll reveals, Cart integration */
(function () {
  const products = {
    "ghee-halwa": {
      id: "ghee-halwa",
      name: "Ghee Halwa",
      price: 600,
      image: "assets/images/products/ghee-halwa.jpg",
      weight: "1kg",
    },
    "muscoth-halwa": {
      id: "muscoth-halwa",
      name: "Muscoth Halwa",
      price: 500,
      image: "assets/images/products/classic-halwa.jpg",
      weight: "1kg",
    },
    "karupatti-halwa": {
      id: "karupatti-halwa",
      name: "Karupatti Halwa",
      price: 850,
      image: "assets/images/products/karupatti-halwa.jpg",
      weight: "1kg",
    },
    mixture: {
      id: "mixture",
      name: "Nellai Mixture",
      price: 149,
      image: "assets/images/Rustic Halwa Feast in Brass Vessels.png",
      weight: "250g",
    },
    "diwali-box": {
      id: "diwali-box",
      name: "Nellai Specialz Diwali Gift Box",
      price: 699,
      image: "assets/images/Nellai Specialz Festive Sweet Gift Set.png",
      weight: "500g Assorted Box",
    },
  };

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
    const cards = document.querySelectorAll("[data-testimonial-slide]");
    const dots = document.querySelectorAll("[data-testimonial-dot]");
    const prevBtn = document.querySelector("[data-testimonial-prev]");
    const nextBtn = document.querySelector("[data-testimonial-next]");

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

  function bindCart() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.addEventListener("click", () => {
        const itemKey = button.dataset.addToCart;
        const product = products[itemKey];
        if (product && window.NellaiStore) {
          window.NellaiStore.addToCart({ ...product, quantity: 1 });
          // Button feedback animation
          const originalText = button.innerHTML;
          button.innerHTML = `<span>✓ Added!</span>`;
          button.classList.add("bg-[#2D6A4F]");
          setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove("bg-[#2D6A4F]");
          }, 1500);
        }
      });
    });
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

  document.addEventListener("DOMContentLoaded", () => {
    bindHeroSlider();
    bindTestimonialSlider();
    bindGalleryAutoScroll();
    reveal();
    bindCart();
  });

  window.NELLAI_PRODUCTS = Object.values(products);
})();
