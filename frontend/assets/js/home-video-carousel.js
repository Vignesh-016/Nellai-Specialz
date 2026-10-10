(function () {
  function bindVideoModal() {
    const modal = document.getElementById("video-modal");
    const modalTitle = document.getElementById("video-modal-title");
    const modalPlayer = document.getElementById("video-modal-player");
    const modalSource = document.getElementById("video-modal-source");
    const closeBtn = document.getElementById("close-video-modal");

    if (!modal || !modalPlayer) return;

    function closeModal() {
      modal.classList.remove("opacity-100", "pointer-events-auto");
      modal.classList.add("opacity-0", "pointer-events-none");
      modalPlayer.pause();
      modalPlayer.currentTime = 0;
      if (modalSource) modalSource.src = "";
      modalPlayer.load();
    }

    document.querySelectorAll("[data-open-video-modal]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const title = btn.getAttribute("data-video-title") || "Video Preview";
        const src = btn.getAttribute("data-video-src") || "";

        if (modalTitle) modalTitle.textContent = title;
        if (modalSource) {
          modalSource.src = src;
        }
        modalPlayer.load();

        modal.classList.remove("opacity-0", "pointer-events-none");
        modal.classList.add("opacity-100", "pointer-events-auto");
        modalPlayer.play().catch(() => {});
      });
    });

    closeBtn?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
  }

  function bindVideoCarousel() {
    const container = document.querySelector("#video-carousel-container");
    if (!container) return;

    const cards = container.querySelectorAll("[data-video-card]");
    const dots = document.querySelectorAll("[data-video-dot]");
    const prevBtn = container.querySelector("[data-video-prev]");
    const nextBtn = container.querySelector("[data-video-next]");

    if (!cards.length) return;

    let activeIndex = 0;
    let startX = 0;

    function updateCarousel(index) {
      const total = cards.length;
      activeIndex = (index + total) % total;

      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

      cards.forEach((card, i) => {
        let diff = i - activeIndex;

        if (diff < -1 && activeIndex === total - 1 && i === 0) diff = 1;
        if (diff > 1 && activeIndex === 0 && i === total - 1) diff = -1;

        if (diff === 0) {
          card.style.transform = isMobile ? "translateX(0%) scale(1)" : "translateX(0%) scale(1.06)";
          card.style.opacity = "1";
          card.style.zIndex = "20";
          card.classList.remove("border-[#EADBC1]", "shadow-lg");
          card.classList.add("border-2", "border-[#D9B86C]", "shadow-2xl");
        } else if (diff === -1) {
          const shiftX = isMobile ? "-110%" : isTablet ? "-65%" : "-75%";
          card.style.transform = `translateX(${shiftX}) scale(${isMobile ? 0.85 : 0.9})`;
          card.style.opacity = isMobile ? "0.2" : "0.5";
          card.style.zIndex = "10";
          card.classList.remove("border-2", "border-[#D9B86C]", "shadow-2xl");
          card.classList.add("border-[#EADBC1]", "shadow-lg");
        } else if (diff === 1) {
          const shiftX = isMobile ? "110%" : isTablet ? "65%" : "75%";
          card.style.transform = `translateX(${shiftX}) scale(${isMobile ? 0.85 : 0.9})`;
          card.style.opacity = isMobile ? "0.2" : "0.5";
          card.style.zIndex = "10";
          card.classList.remove("border-2", "border-[#D9B86C]", "shadow-2xl");
          card.classList.add("border-[#EADBC1]", "shadow-lg");
        } else {
          const shiftX = diff < 0 ? "-150%" : "150%";
          card.style.transform = `translateX(${shiftX}) scale(0.7)`;
          card.style.opacity = "0";
          card.style.zIndex = "0";
          card.classList.remove("border-2", "border-[#D9B86C]", "shadow-2xl");
          card.classList.add("border-[#EADBC1]");
        }
      });

      dots.forEach((dot, i) => {
        if (i === activeIndex) {
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

    cards.forEach((card, i) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest("[data-open-video-modal]")) return;
        if (i !== activeIndex) updateCarousel(i);
      });
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => updateCarousel(i));
    });

    prevBtn?.addEventListener("click", () => updateCarousel(activeIndex - 1));
    nextBtn?.addEventListener("click", () => updateCarousel(activeIndex + 1));

    container.addEventListener(
      "touchstart",
      (event) => {
        startX = event.touches[0].clientX;
      },
      { passive: true },
    );

    container.addEventListener(
      "touchend",
      (event) => {
        const endX = event.changedTouches[0].clientX;
        const diffX = startX - endX;

        if (Math.abs(diffX) > 40) {
          if (diffX > 0) updateCarousel(activeIndex + 1);
          else updateCarousel(activeIndex - 1);
        }
      },
      { passive: true },
    );

    window.addEventListener("resize", () => updateCarousel(activeIndex));

    bindVideoModal();
    updateCarousel(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindVideoCarousel();
  });
})();
