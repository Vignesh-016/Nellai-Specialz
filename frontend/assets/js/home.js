/* Homepage-only interactions: scroll reveals and catalogue add-to-cart hooks. */
(function () {
  const products = {
    "tirunelveli-halwa": { id: "tirunelveli-halwa", name: "Tirunelveli Halwa", price: 199, image: "assets/images/products/classic-halwa.jpg", weight: "250g" },
    "ghee-halwa": { id: "ghee-halwa", name: "Ghee Mysore Pak", price: 189, image: "assets/images/products/halwa-ghee.jpg", weight: "250g" },
    "karupatti-halwa": { id: "karupatti-halwa", name: "Nellai Mixture", price: 149, image: "assets/images/products/karupatti-halwa.jpg", weight: "200g" },
    "fourth-halwa": { id: "fourth-halwa", name: "Laddu", price: 179, image: "assets/images/products/fourth-halwa.jpg", weight: "250g" }
  };

  function reveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    items.forEach((item) => {
      item.classList.add("transition", "duration-700", "ease-out");
      item.classList.add("opacity-0", "translate-y-6");
    });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.remove("opacity-0", "translate-y-6"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  function bindCart() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      const card = button.closest("article");
      const value = card?.querySelector("[data-qty-value]");
      let quantity = 1;
      card?.querySelector("[data-qty-minus]")?.addEventListener("click", () => { quantity = Math.max(1, quantity - 1); value.textContent = quantity; });
      card?.querySelector("[data-qty-plus]")?.addEventListener("click", () => { quantity += 1; value.textContent = quantity; });
      button.addEventListener("click", () => {
        const product = products[button.dataset.addToCart];
        if (product && window.NellaiStore) window.NellaiStore.addToCart({ ...product, quantity });
      });
    });
  }

  function bindTestimonials() {
    const track = document.querySelector("[data-testimonial-track]");
    if (!track) return;
    const dots = [...document.querySelectorAll("[data-testimonial-dot]")];
    const updateDots = () => {
      const index = Math.min(dots.length - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
      dots.forEach((dot, i) => dot.className = i === index ? "h-3 w-3 rounded-full bg-[#b88932]" : "h-3 w-3 rounded-full bg-[#e5cfa9]");
    };
    const move = (direction) => { track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" }); setTimeout(updateDots, 350); };
    document.querySelector("[data-testimonial-prev]")?.addEventListener("click", () => move(-1));
    document.querySelector("[data-testimonial-next]")?.addEventListener("click", () => move(1));
    dots.forEach((dot) => dot.addEventListener("click", () => { track.scrollTo({ left: Number(dot.dataset.testimonialDot) * track.clientWidth, behavior: "smooth" }); setTimeout(updateDots, 350); }));
  }

  document.addEventListener("DOMContentLoaded", () => { reveal(); bindCart(); bindTestimonials(); });
  window.NELLAI_PRODUCTS = Object.values(products);
})();
