(() => {
  const reveal = () => {
    const blocks = document.querySelectorAll('[data-story-reveal]');
    if (!blocks.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      blocks.forEach((block) => block.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    blocks.forEach((block) => observer.observe(block));
  };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', reveal, { once: true })
    : reveal();
})();
