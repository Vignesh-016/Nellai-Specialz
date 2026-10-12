(() => {
  const score = (value) => value.length < 8 ? 1 : /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) ? (value.length >= 12 && /[^A-Za-z0-9]/.test(value) ? 4 : 3) : 2;

  const addToggle = (input) => {
    const wrapper = input?.parentElement;
    if (!wrapper || wrapper.querySelector("[data-register-toggle]")) return;
    wrapper.classList.add("relative");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.registerToggle = "true";
    button.className = "absolute right-2 top-9 grid h-9 w-9 place-items-center rounded-full text-[#806B58] transition hover:bg-[#FBF5E9] hover:text-[#8C1C13] [&>svg]:h-5 [&>svg]:w-5";
    button.style.setProperty("--icon-size", "1.25rem");
    button.querySelector("svg")?.style.setProperty("width", "1.25rem");
    button.querySelector("svg")?.style.setProperty("height", "1.25rem");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Show password");
    const showIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
    const hideIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 3 18 18M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.1 3.9M6.2 6.8C3.8 8.2 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5"/></svg>';
    button.innerHTML = showIcon;
    button.addEventListener("click", () => {
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.setAttribute("aria-pressed", String(!visible));
      button.setAttribute("aria-label", visible ? "Show password" : "Hide password");
      button.innerHTML = visible ? showIcon : hideIcon;
    });
    wrapper.appendChild(button);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const customerRegisterForm = document.getElementById('customerRegisterForm');
    customerRegisterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirm = document.getElementById('confirm-password').value;
      if (password !== confirm) return;
      try {
        await NellaiApi.request('customer-auth/register.php', { method: 'POST', credentials: 'include', body: JSON.stringify({ name: `${document.getElementById('first-name').value.trim()} ${document.getElementById('last-name').value.trim()}`, email, phone: document.getElementById('phone').value.trim(), password }) });
        const redirect = window.NellaiCustomerSession?.getSafeRedirect() || 'index.html';
        location.replace(`verify-otp.html?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`);
      } catch (error) {
        let status = customerRegisterForm.querySelector('[data-auth-error]');
        if (!status) { status = document.createElement('p'); status.dataset.authError = 'true'; status.className = 'text-sm text-red-700 sm:col-span-2'; customerRegisterForm.prepend(status); }
        status.textContent = error.message || 'Unable to create account. Please try again.';
      }
    }, true);
    const form=document.getElementById('customerRegisterForm'); form?.addEventListener('submit',async(event)=>{event.preventDefault();const button=form.querySelector('button[type="submit"]');const password=document.getElementById('register-password').value;const confirm=document.getElementById('confirm-password').value;if(password!==confirm){return;}button.disabled=true;button.textContent='Creating account…';try{await NellaiApi.request('customer-auth/register.php',{method:'POST',credentials:'include',body:JSON.stringify({name:`${document.getElementById('first-name').value.trim()} ${document.getElementById('last-name').value.trim()}`,email:document.getElementById('register-email').value.trim(),phone:document.getElementById('phone').value.trim(),password})});location.href=`login.html?registered=1&redirect=${encodeURIComponent(new URLSearchParams(location.search).get('redirect')||'index.html')}`;}catch(error){let status=form.querySelector('[data-auth-error]');if(!status){status=document.createElement('p');status.dataset.authError='true';status.className='text-sm text-red-700 sm:col-span-2';form.prepend(status);}status.textContent=error.message;}finally{button.disabled=false;button.textContent='Create account';}});
    const password = document.querySelector("[data-password-main]");
    const confirm = document.querySelector("[data-password-confirm]");
    if (!password || !confirm) return;
    addToggle(password); addToggle(confirm);
    const meter = document.createElement("div"); meter.className = "mt-3"; meter.innerHTML = '<div class="flex gap-1"><span></span><span></span><span></span><span></span></div><p class="mt-1 text-xs text-[#806B58]" aria-live="polite"></p><ul class="mt-2 grid gap-1 text-xs text-[#806B58] sm:grid-cols-2"><li>○ 8 characters</li><li>○ Uppercase letter</li><li>○ Lowercase letter</li><li>○ Number</li><li>○ Special character</li></ul>'; password.parentElement.appendChild(meter);
    const update = () => { const value = password.value; const current = score(value); const labels = ["", "Weak", "Fair", "Good", "Strong"]; meter.querySelector("p").textContent = value ? labels[current] : "Use a strong password"; meter.querySelectorAll(".flex span").forEach((segment, index) => { segment.className = `h-1.5 flex-1 rounded-full ${index < current ? "bg-[#D9B86C]" : "bg-[#EADBC1]"}`; }); };
    password.addEventListener("input", update);
    confirm.addEventListener("input", () => { const message = confirm.parentElement.querySelector("[data-register-match]") || document.createElement("p"); message.dataset.registerMatch = "true"; message.className = `mt-2 text-xs ${confirm.value === password.value ? "text-emerald-700" : "text-red-700"}`; message.textContent = confirm.value ? (confirm.value === password.value ? "Passwords match" : "Passwords do not match") : ""; if (!message.parentElement) confirm.parentElement.appendChild(message); });
    update();
  });
})();
