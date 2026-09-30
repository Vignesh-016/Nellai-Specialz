/**
 * Homepage catalogue, cart actions, and local product search.
 * Product records match the store catalog.
 */
(function () {
  const PRODUCTS = [
    {
      id: "tirunelveli-halwa",
      name: "Tirunelveli Halwa",
      description: "The classic taste of Tirunelveli — rich, glossy and irresistibly soft.",
      weight: "500g | 1kg | 2kg",
      price: null,
      priceLabel: "From ₹XXX",
      image: "assets/images/products/classic-halwa.jpg",
      badge: "Classic",
      placeholder: false
    },
    {
      id: "ghee-halwa",
      name: "Ghee Halwa",
      description: "Rich ghee flavour with a luxurious texture and indulgent finish.",
      weight: "500g | 1kg | 2kg",
      price: null,
      priceLabel: "From ₹XXX",
      image: "assets/images/products/ghee-halwa.jpg",
      badge: "Rich & Buttery",
      placeholder: false
    },
    {
      id: "karupatti-halwa",
      name: "Karupatti Halwa",
      description: "A distinctive traditional sweetness with the deep character of karupatti.",
      weight: "500g | 1kg | 2kg",
      price: null,
      priceLabel: "From ₹XXX",
      image: "assets/images/products/karupatti-halwa.jpg",
      badge: "Traditional",
      placeholder: false
    },
    {
      id: "fourth-halwa",
      name: "Fourth Halwa",
      description: "A unique flavour, crafted with traditional care.",
      weight: "500g | 1kg | 2kg",
      price: null,
      priceLabel: "From ₹XXX",
      image: "assets/images/products/fourth-halwa.jpg",
      badge: "Special",
      placeholder: false
    },
    {
      id: "nellai-halwa-combo",
      name: "Nellai Halwa Combo",
      description: "A curated selection of Nellai Specialz favourites — perfect for sharing, gifting, or discovering your next favourite.",
      weight: "Custom Selection",
      price: null,
      priceLabel: "From ₹XXX",
      image: "assets/images/products/combo-halwa.jpg",
      badge: "Combo",
      placeholder: false,
      isCombo: true
    }
  ];

  function byId(id) {
    return PRODUCTS.find((product) => product.id === id || (id === "fourth-halwa-placeholder" && product.id === "fourth-halwa"));
  }

  function bindProductActions() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.addEventListener("click", () => {
        const product = byId(button.getAttribute("data-add-to-cart"));
        if (!product || !window.NellaiStore) return;
        window.NellaiStore.addToCart({
          id: product.id,
          name: product.name,
          weight: product.weight,
          price: product.price || 0,
          image: product.image,
          quantity: 1,
          placeholder: product.placeholder
        });
      });
    });
  }

  function bindSearchFilter() {
    window.addEventListener("nellai:search", (event) => {
      const query = String(event.detail || "").trim().toLowerCase();
      const results = document.getElementById("searchResults");
      if (!results) return;

      if (!query) {
        results.textContent = "Start typing to find a halwa.";
        return;
      }

      const matches = PRODUCTS.filter((product) =>
        (product.name + " " + product.description).toLowerCase().includes(query)
      );

      if (!matches.length) {
        results.textContent = "No matching products on this page.";
        return;
      }

      results.innerHTML = matches
        .map((product) => `<a class="block border-b border-[#5A160F]/10 py-2 text-sm text-[#32110D] hover:text-[#5A160F]" href="#${product.isCombo ? "combo" : "halwas"}">${product.name}</a>`)
        .join("");
    });
  }

  const REVIEWS = [
    {
      quote: '"The best Halwa I have ever had!<br>So soft, rich and full of flavor.<br>Truly authentic Tirunelveli taste."',
      author: '– Priya K., Chennai'
    },
    {
      quote: '"The Karupatti Halwa balances the perfect blend of sweetness and texture. Authentic taste delivered on time!"',
      author: '– Mahesh, Mumbai'
    },
    {
      quote: '"Prompt and punctual delivery of fresh Tirunelveli Halwa. The packaging preserved the rich native flavor perfectly!"',
      author: '– Raghunathan, Sweet Enthusiast'
    }
  ];

  function bindReviewCarousel() {
    const prevBtn = document.getElementById("prevReviewBtn");
    const nextBtn = document.getElementById("nextReviewBtn");
    const quoteEl = document.getElementById("reviewQuoteText");
    const authorEl = document.getElementById("reviewAuthorText");
    const dots = document.querySelectorAll("[data-review-dot]");
    if (!quoteEl || !authorEl) return;

    let currentIndex = 0;

    function renderReview(index) {
      currentIndex = (index + REVIEWS.length) % REVIEWS.length;
      quoteEl.innerHTML = REVIEWS[currentIndex].quote;
      authorEl.textContent = REVIEWS[currentIndex].author;

      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.className = "review-dot h-2.5 w-2.5 rounded-full bg-[#32110D] cursor-pointer transition-all";
        } else {
          dot.className = "review-dot h-2.5 w-2.5 rounded-full border border-[#B88932] bg-transparent cursor-pointer transition-all";
        }
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => renderReview(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => renderReview(currentIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => renderReview(i)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindProductActions();
    bindSearchFilter();
    bindReviewCarousel();
  });

  window.NELLAI_PRODUCTS = PRODUCTS;
})();
