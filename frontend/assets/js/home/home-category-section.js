window.initHomeCategories = async () => {
  const container = document.querySelector("[data-home-categories]");
  if (!container) {
    console.warn("No category container found.");
    return;
  }

  container.innerHTML = "";

  try {
    // API returns { status: "success", data: [...] }
    const response = await NellaiApi.request("categories/get.php");

    const categories = response.data || [];

    const activeCategories = categories.filter((c) => c.status === "ACTIVE");

    if (activeCategories.length === 0) {
      container.textContent = "No categories available.";
      return;
    }

    // Create UI cards for each category
    activeCategories.forEach((c) => {
      const card = document.createElement("a");
      card.href = `pages/shop.html?category_id=${c.id}`;
      card.classList.add("category-card");

      // image optional — API does not return image
      const imageUrl = c.image_url || "assets/images/categories/default.jpg";

      card.innerHTML = `
        <img src="${imageUrl}" alt="${c.name}" class="category-image">
        <h3 class="category-title">${c.name}</h3>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Home categories load error:", error);
    container.textContent = "Error loading categories. Please try again.";
  }
};

// If you need to run it automatically after DOM is ready:
document.addEventListener("DOMContentLoaded", initHomeCategories);
