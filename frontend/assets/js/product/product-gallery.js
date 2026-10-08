window.renderProductGallery = (product) => {
  const fallback = "../assets/images/ChatGPT Image Sep 26, 2026, 12_19_36 PM.png";
  const normalize = window.normalizeStorefrontImage || ((path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `https://backend.nellaispecialz.com/${String(path).replace(/^\/+/, "")}`;
  });
  const gallery = Array.isArray(product.images) ? product.images : (product.gallery || []);
  const sources = [
    product.main_image,
    product.image,
    ...gallery.map((image) => image.image_url || image.image_path || image),
  ].filter(Boolean);
  const images = [...new Set(sources.map(normalize).filter(Boolean))];
  if (!images.length) images.push(fallback);

  const main = document.getElementById("mainProductImg");
  const thumbnails = document.querySelector(".lg\\:col-span-6 .grid.grid-cols-4")
    || document.querySelector(".grid.grid-cols-4");
  if (!main) return;

  main.src = images[0];
  main.alt = product.name || "";
  main.onerror = () => {
    main.onerror = null;
    main.src = fallback;
  };
  if (!thumbnails) return;
  thumbnails.replaceChildren();

  images.forEach((source, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `thumb-btn border-2 ${index === 0 ? "border-[#4d190e]" : "border-transparent"} rounded-xl overflow-hidden aspect-square bg-[#F7F1E5]`;
    const image = document.createElement("img");
    image.src = source;
    image.alt = product.name || "";
    image.className = "h-full w-full object-cover";
    image.onerror = () => {
      image.onerror = null;
      image.src = fallback;
    };
    button.appendChild(image);
    button.addEventListener("click", () => {
      main.src = source;
      thumbnails.querySelectorAll("button").forEach((item) => {
        item.classList.remove("border-[#4d190e]");
        item.classList.add("border-transparent");
      });
      button.classList.add("border-[#4d190e]");
      button.classList.remove("border-transparent");
    });
    thumbnails.appendChild(button);
  });
};
