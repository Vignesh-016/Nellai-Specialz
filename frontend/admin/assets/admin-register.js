document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm'); const submitBtn = document.getElementById('registerBtn'); const status = document.getElementById('register-status'); let isSubmitting = false;
  if (!form || !submitBtn) { console.error('[Register] Form/button not found'); return; }
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); console.log('[Register] submit triggered'); if (isSubmitting) return;
    const data = Object.fromEntries(new FormData(form));
    if (!data.name.trim()) { status.textContent = 'Full name is required.'; return; }
    if (!data.email.trim()) { status.textContent = 'Email is required.'; return; }
    if (data.password.length < 8) { status.textContent = 'Password must be at least 8 characters.'; return; }
    if (data.password !== data.confirm_password) { status.textContent = 'Passwords do not match.'; return; }
    isSubmitting = true; submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; status.textContent = '';
    try { console.log('[Register] sending request'); const response = await fetch('https://backend.nellaispecialz.com/api/auth/register.php', { method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json().catch(() => ({})); if (!response.ok || !result.success) throw new Error(result.message || 'Unable to create account.'); sessionStorage.setItem('nellai_admin_verify_email', data.email); location.href = 'verify-otp.html'; }
    catch (error) { console.error('[Register] request failed:', error); status.textContent = error.message; }
    finally { isSubmitting = false; submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
  });
});
