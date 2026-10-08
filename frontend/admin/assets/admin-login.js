document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm'); const button = document.getElementById('adminLoginBtn'); const password = document.getElementById('admin-password');
  if (!form || !button) { console.error('[Login] Form/button not found'); return; }
  const params = new URLSearchParams(location.search); const notice = params.get('verified') === '1' ? 'Email verified successfully. Your admin account has been created. You can now sign in.' : params.get('reason') === 'auth' ? 'Please sign in to continue.' : '';
  const status = document.createElement('p'); status.className='text-sm'; status.textContent=notice; form.prepend(status);
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); if (button.disabled) return; button.disabled=true; button.textContent='Signing in...'; status.textContent='';
    try { const response=await fetch('https://backend.nellaispecialz.com/api/auth/login.php',{method:'POST',credentials:'include',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('admin-email').value.trim(),password:password.value})}); const result=await response.json().catch(()=>({})); if(!response.ok||!result.success)throw Error(result.message||'Unable to sign in.'); const me=await fetch('https://backend.nellaispecialz.com/api/auth/me.php',{credentials:'include',headers:{Accept:'application/json'}}); const meResult=await me.json().catch(()=>({})); if(!me.ok||!meResult.success)throw Error('Login succeeded but session could not be established.'); const redirect=params.get('redirect'); const allowed=['index.html','categories.html','products.html','orders.html','coupons.html','blog.html','enquiries.html']; location.href=allowed.includes(redirect)?redirect:'index.html'; }
    catch(error){ status.textContent=error.message; button.disabled=false; button.textContent='Sign in to admin'; }
  });
});
