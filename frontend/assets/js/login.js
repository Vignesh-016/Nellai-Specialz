(() => {
  const strength = (value) => {
    if (value.length < 8) return 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value)) {
      return value.length >= 12 && /[^A-Za-z0-9]/.test(value) ? 4 : 3;
    }
    return 2;
  };

  const addVisibilityToggle = (input) => {
    const wrapper = input?.parentElement;
    if (!wrapper || wrapper.querySelector("[data-password-toggle]")) return;
    wrapper.classList.add("relative");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.passwordToggle = "true";
    button.className = "absolute right-3 top-9 text-xs font-semibold text-[#4d190e]";
    button.textContent = "Show";
    button.setAttribute("aria-label", "Show password");
    button.addEventListener("click", () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.textContent = visible ? "Show" : "Hide";
      button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    });
    wrapper.appendChild(button);
  };

  const addStrengthMeter = (input) => {
    const wrapper = input?.parentElement;
    if (!wrapper || wrapper.querySelector("[data-login-strength]")) return;
    const meter = document.createElement("div");
    meter.dataset.loginStrength = "true";
    meter.className = "mt-3";
    meter.innerHTML = '<div class="flex gap-1"><span></span><span></span><span></span><span></span></div><p class="mt-1 text-xs text-[#74685F]" aria-live="polite"></p>';
    wrapper.appendChild(meter);
    input.addEventListener("input", () => {
      const score = strength(input.value);
      const labels = ["", "Weak", "Fair", "Good", "Strong"];
      meter.querySelector("p").textContent = input.value ? labels[score] : "Use a strong password";
      meter.querySelectorAll("span").forEach((segment, index) => {
        segment.className = `h-1.5 flex-1 rounded-full ${index < score ? "bg-[#B88932]" : "bg-[#E7DDD1]"}`;
      });
    });
  };

  const renderStep = (container, number) => {
    if (number === 1) {
      container.innerHTML = '<p class="text-sm leading-6 text-[#74685F]">Enter your email or phone number to continue this frontend-only recovery flow.</p><label class="mt-5 block text-sm font-semibold">Email or phone<input class="mt-2 h-12 w-full rounded-lg border border-[#E7DDD1] px-4"></label><button data-next-step class="mt-5 h-12 w-full rounded-lg bg-[#4d190e] font-semibold text-white">Send OTP</button>';
    }
    if (number === 2) {
      container.innerHTML = `<p class="text-sm leading-6 text-[#74685F]">Enter the 6-digit OTP for this frontend demo flow.</p><div class="mt-5 flex justify-between gap-1 sm:gap-2">${[1, 2, 3, 4, 5, 6].map((index) => `<input aria-label="OTP digit ${index}" inputmode="numeric" maxlength="1" class="h-11 w-9 rounded-lg border border-[#E7DDD1] text-center text-lg sm:h-12 sm:w-12">`).join("")}</div><button data-next-step class="mt-5 h-12 w-full rounded-lg bg-[#4d190e] font-semibold text-white">Verify OTP</button><button data-previous-step class="mt-3 w-full text-sm font-semibold text-[#4d190e]">Back</button>`;
      const inputs = [...container.querySelectorAll("input")];
      inputs.forEach((input, index) => {
        input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, ""); inputs[index + 1]?.focus(); });
        input.addEventListener("keydown", (event) => { if (event.key === "Backspace" && !input.value) inputs[index - 1]?.focus(); });
        input.addEventListener("paste", (event) => { const values = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); values.split("").forEach((value, position) => { if (inputs[position]) inputs[position].value = value; }); inputs[Math.min(values.length, 5)]?.focus(); event.preventDefault(); });
      });
    }
    if (number === 3) {
      container.innerHTML = '<p class="text-sm leading-6 text-[#74685F]">Choose a new password for your account.</p><label class="mt-5 block text-sm font-semibold">New password<input data-reset-password type="password" class="mt-2 h-12 w-full rounded-lg border border-[#E7DDD1] px-4"></label><label class="mt-4 block text-sm font-semibold">Confirm password<input data-reset-confirm type="password" class="mt-2 h-12 w-full rounded-lg border border-[#E7DDD1] px-4"></label><p data-reset-match class="mt-2 text-xs" aria-live="polite"></p><button data-next-step class="mt-5 h-12 w-full rounded-lg bg-[#4d190e] font-semibold text-white">Reset Password</button>';
      const password = container.querySelector("[data-reset-password]");
      const confirm = container.querySelector("[data-reset-confirm]");
      addVisibilityToggle(password); addVisibilityToggle(confirm); addStrengthMeter(password);
      confirm.addEventListener("input", () => { const match = confirm.value === password.value; const message = container.querySelector("[data-reset-match]"); message.textContent = confirm.value ? (match ? "Passwords match" : "Passwords do not match") : ""; message.className = `mt-2 text-xs ${match ? "text-emerald-700" : "text-red-700"}`; });
    }
    container.querySelector("[data-next-step]")?.addEventListener("click", () => number < 3 && renderStep(container, number + 1));
    container.querySelector("[data-previous-step]")?.addEventListener("click", () => renderStep(container, number - 1));
  };

  document.addEventListener("DOMContentLoaded", () => {
    const password = document.querySelector("#password");
    addVisibilityToggle(password);
    const forgot = document.querySelector("[data-forgot-password]");
    if (!forgot) return;
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 z-[80] hidden items-center justify-center bg-[#321307]/45 p-4";
    modal.innerHTML = '<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true"><div class="flex items-start justify-between"><div><p class="text-xs font-bold uppercase tracking-[0.2em] text-[#B88932]">Account recovery</p><h2 class="mt-2 font-serif text-3xl font-semibold text-[#321307]">Forgot password?</h2></div><button type="button" data-close-recovery class="text-2xl text-[#4d190e]" aria-label="Close">×</button></div><div data-recovery-step class="mt-6"></div></div>';
    document.body.appendChild(modal);
    const container = modal.querySelector("[data-recovery-step]");
    forgot.addEventListener("click", () => { modal.classList.remove("hidden"); modal.classList.add("flex"); renderStep(container, 1); });
    modal.querySelector("[data-close-recovery]").addEventListener("click", () => modal.classList.add("hidden"));
    document.addEventListener("keydown", (event) => event.key === "Escape" && modal.classList.add("hidden"));
  });
})();
