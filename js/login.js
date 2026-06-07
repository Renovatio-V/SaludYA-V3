// ============================================
//   SaludYa! - Login JS
// ============================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  const existing = Store.get('user');
  if (existing) { window.location.href = 'dashboard.html'; return; }

  const form         = document.getElementById('loginForm');
  const usernameInput= document.getElementById('username');
  const passwordInput= document.getElementById('password');
  const toggleBtn    = document.getElementById('togglePassword');
  const errorEl      = document.getElementById('loginError');
  const submitBtn    = document.getElementById('submitBtn');
  const btnText      = document.getElementById('btnText');
  const spinner      = document.getElementById('btnSpinner');
  const registerLink = document.getElementById('registerLink');

  // Demo credentials
  const DEMO_USER = { username: 'juan.perez', password: 'saludya123' };

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    const isText = passwordInput.type === 'text';
    passwordInput.type = isText ? 'password' : 'text';
    toggleBtn.innerHTML = isText
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  });

  function showError(msg) {
    errorEl.querySelector('span').textContent = msg;
    errorEl.classList.add('visible');
  }
  function hideError() { errorEl.classList.remove('visible'); }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Iniciando sesión...' : 'Iniciar Sesión';
    spinner.style.display = loading ? 'block' : 'none';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const user = usernameInput.value.trim();
    const pass = passwordInput.value;

    if (!user || !pass) { showError('Por favor complete todos los campos.'); return; }

    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));

    if (user === DEMO_USER.username && pass === DEMO_USER.password) {
      Store.set('user', {
        username: user,
        name: 'Juan Pérez Martínez',
        email: 'juan.perez@email.com',
        phone: '+1 234 567 8900',
        address: 'Av. Principal 123, Ciudad',
        birthdate: '1990-05-15',
        bloodType: 'O+'
      });
      window.location.href = 'dashboard.html';
    } else {
      setLoading(false);
      showError('Usuario o contraseña incorrectos. Intente con juan.perez / saludya123');
      passwordInput.value = '';
      passwordInput.focus();
    }
  });

  registerLink.addEventListener('click', () => {
    showToast('Registro próximamente disponible', 'warning');
  });

  // Clear error on input
  [usernameInput, passwordInput].forEach(el =>
    el.addEventListener('input', hideError)
  );
});
