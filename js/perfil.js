// ============================================
//   SaludYa! - Perfil JS
// ============================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.panel).classList.add('active');
    });
  });

  // Pre-fill personal data
  document.getElementById('fullName').value  = user.name       || '';
  document.getElementById('email').value     = user.email      || '';
  document.getElementById('phone').value     = user.phone      || '';
  document.getElementById('birthdate').value = user.birthdate  || '';
  document.getElementById('address').value   = user.address    || '';
  document.getElementById('bloodType').value = user.bloodType  || '';

  // Save personal info
  document.getElementById('savePersonalBtn').addEventListener('click', () => {
    const updated = {
      ...user,
      name:      document.getElementById('fullName').value.trim(),
      email:     document.getElementById('email').value.trim(),
      phone:     document.getElementById('phone').value.trim(),
      birthdate: document.getElementById('birthdate').value,
      address:   document.getElementById('address').value.trim(),
      bloodType: document.getElementById('bloodType').value.trim()
    };

    if (!updated.name) { showToast('El nombre es obligatorio', 'error'); return; }
    if (updated.email && !isValidEmail(updated.email)) { showToast('Email inválido', 'error'); return; }

    Store.set('user', updated);
    showToast('Datos actualizados correctamente', 'success');
  });

  // Password strength indicator
  const newPassInput = document.getElementById('newPassword');
  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  newPassInput.addEventListener('input', () => {
    const val = newPassInput.value;
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength++;
    if (/\d/.test(val) && /[^a-zA-Z0-9]/.test(val)) strength++;

    const levels = ['', 'weak', 'medium', 'strong'];
    const labels = ['', 'Débil', 'Media', 'Fuerte'];
    strengthFill.className = 'strength-fill ' + (levels[strength] || '');
    strengthLabel.textContent = val.length ? labels[strength] || '' : '';
  });

  // Save password
  document.getElementById('savePasswordBtn').addEventListener('click', () => {
    const current = document.getElementById('currentPassword').value;
    const newPass  = document.getElementById('newPassword').value;
    const confirm  = document.getElementById('confirmPassword').value;

    if (!current || !newPass || !confirm) { showToast('Complete todos los campos', 'error'); return; }
    if (newPass.length < 8) { showToast('La contraseña debe tener al menos 8 caracteres', 'error'); return; }
    if (newPass !== confirm) { showToast('Las contraseñas no coinciden', 'error'); return; }

    // Demo: only check current password against known one
    if (current !== 'saludya123') { showToast('Contraseña actual incorrecta', 'error'); return; }

    showToast('Contraseña actualizada correctamente', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('strengthFill').className = 'strength-fill';
    document.getElementById('strengthLabel').textContent = '';
  });

  // Back button
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});
