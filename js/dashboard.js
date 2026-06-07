// ============================================
//   SaludYa! - Dashboard JS
// ============================================

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  // Display user name
  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = user.name || user.username;

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Deseas cerrar sesión?')) logout();
    });
  }

  // Animate cards staggered
  const cards = document.querySelectorAll('.menu-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 100);
  });
});
