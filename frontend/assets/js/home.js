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

  document.addEventListener("DOMContentLoaded", () => {
    bindProductActions();
    bindSearchFilter();
  });

  window.NELLAI_PRODUCTS = PRODUCTS;
})();
