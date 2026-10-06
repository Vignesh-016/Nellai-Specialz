/* Our Story — Cinematic single-banner sticky scroll storytelling */
(function () {
  const TOTAL = 6;

  function isDesktop() {
    return (
      window.innerWidth >= 1024 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function initStoryScroll() {
    const container = document.getElementById("story-sticky-container");
    const banner = document.getElementById("story-banner");
    const counter = document.getElementById("story-counter");
    const timelineFill = document.getElementById("story-timeline-fill");
    const bgImages = document.querySelectorAll("[data-story-bg]");
    const dots = document.querySelectorAll("[data-story-dot]");
    const stepEls = document.querySelectorAll("[data-story-step]");

    if (!container || !banner || stepEls.length === 0) return;

    let currentStep = -1;
    let ticking = false;

    /* Active dot classes */
    const DOT_ACTIVE = ["h-3.5", "w-3.5", "bg-[#f5c56b]", "ring-4", "ring-[#f5c56b]/25"];
    const DOT_INACTIVE = ["h-2.5", "w-2.5", "bg-[#f5c56b]/30"];
    const DOT_REMOVE_ACTIVE = ["h-3.5", "w-3.5", "bg-[#f5c56b]", "ring-4", "ring-[#f5c56b]/25"];
    const DOT_REMOVE_INACTIVE = ["h-2.5", "w-2.5", "bg-[#f5c56b]/30"];

    function goToStep(index) {
      if (index === currentStep) return;
      currentStep = index;

      /* --- Background crossfade --- */
      bgImages.forEach((img, i) => {
        img.style.opacity = i === currentStep ? "1" : "0";
      });

      /* --- Step content transition --- */
      stepEls.forEach((el, i) => {
        if (i === currentStep) {
          el.style.opacity = "1";
          el.style.transform = "translate3d(0,0,0)";
          el.style.pointerEvents = "auto";
        } else {
          const dir = i < currentStep ? -24 : 24;
          el.style.opacity = "0";
          el.style.transform = `translate3d(${dir}px,0,0)`;
          el.style.pointerEvents = "none";
        }
      });

      /* --- Timeline dots --- */
      dots.forEach((dot, i) => {
        if (i === currentStep) {
          DOT_REMOVE_INACTIVE.forEach((c) => dot.classList.remove(c));
          DOT_ACTIVE.forEach((c) => dot.classList.add(c));
          dot.setAttribute("aria-current", "true");
        } else {
          DOT_REMOVE_ACTIVE.forEach((c) => dot.classList.remove(c));
          DOT_INACTIVE.forEach((c) => dot.classList.add(c));
          dot.removeAttribute("aria-current");
        }
      });

      /* --- Timeline fill progress --- */
      if (timelineFill) {
        const pct = TOTAL > 1 ? (currentStep / (TOTAL - 1)) * 100 : 0;
        timelineFill.style.width = pct + "%";
      }

      /* --- Counter --- */
      if (counter) {
        counter.textContent = `0${currentStep + 1} / 0${TOTAL}`;
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateFromScroll);
        ticking = true;
      }
    }

    function updateFromScroll() {
      ticking = false;
      if (!isDesktop()) {
        /* On mobile reset inline styles */
        stepEls.forEach((el) => {
          el.style.opacity = "";
          el.style.transform = "";
          el.style.pointerEvents = "";
        });
        bgImages.forEach((img) => {
          img.style.opacity = "";
        });
        return;
      }

      const rect = container.getBoundingClientRect();
      const wh = window.innerHeight;
      const scrollable = container.offsetHeight - wh;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const stepIndex = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
      goToStep(stepIndex);
    }

    /* --- Dot click navigation --- */
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        if (!isDesktop()) return;
        const scrollable = container.offsetHeight - window.innerHeight;
        const targetProgress = i / (TOTAL - 1);
        const targetY = container.offsetTop + targetProgress * scrollable;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    /* Initial */
    goToStep(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStoryScroll);
  } else {
    initStoryScroll();
  }
})();
