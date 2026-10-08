(() => {
  const score = (value) => value.length < 8 ? 1 : /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) ? (value.length >= 12 && /[^A-Za-z0-9]/.test(value) ? 4 : 3) : 2;

  const addToggle = (input) => {
    const wrapper = input?.parentElement;
    if (!wrapper || wrapper.querySelector("[data-register-toggle]")) return;
    wrapper.classList.add("relative");
    const button = document.createElement("button");
    button.type = "button"; button.dataset.registerToggle = "true"; button.className = "absolute right-3 top-9 text-xs font-semibold text-[#4d190e]"; button.textContent = "Show";
    button.addEventListener("click", () => { const visible = input.type === "text"; input.type = visible ? "password" : "text"; button.textContent = visible ? "Show" : "Hide"; });
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
        const redirect = new URLSearchParams(location.search).get('redirect') || 'index.html';
        location.href = `verify-otp.html?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`;
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
    const meter = document.createElement("div"); meter.className = "mt-3"; meter.innerHTML = '<div class="flex gap-1"><span></span><span></span><span></span><span></span></div><p class="mt-1 text-xs text-[#74685F]" aria-live="polite"></p><ul class="mt-2 grid gap-1 text-xs text-[#74685F] sm:grid-cols-2"><li>○ 8 characters</li><li>○ Uppercase letter</li><li>○ Lowercase letter</li><li>○ Number</li><li>○ Special character</li></ul>'; password.parentElement.appendChild(meter);
    const update = () => { const value = password.value; const current = score(value); const labels = ["", "Weak", "Fair", "Good", "Strong"]; meter.querySelector("p").textContent = value ? labels[current] : "Use a strong password"; meter.querySelectorAll(".flex span").forEach((segment, index) => { segment.className = `h-1.5 flex-1 rounded-full ${index < current ? "bg-[#B88932]" : "bg-[#E7DDD1]"}`; }); };
    password.addEventListener("input", update);
    confirm.addEventListener("input", () => { const message = confirm.parentElement.querySelector("[data-register-match]") || document.createElement("p"); message.dataset.registerMatch = "true"; message.className = `mt-2 text-xs ${confirm.value === password.value ? "text-emerald-700" : "text-red-700"}`; message.textContent = confirm.value ? (confirm.value === password.value ? "Passwords match" : "Passwords do not match") : ""; if (!message.parentElement) confirm.parentElement.appendChild(message); });
    update();
  });
})();
