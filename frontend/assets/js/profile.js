/* Profile-page-only interactions. */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[href^="#"]').forEach((link) => link.addEventListener("click", () => {
    document.querySelectorAll('[href^="#"]').forEach((item) => item.classList.remove("text-[#4d190e]"));
    link.classList.add("text-[#4d190e]");
  }));
});
