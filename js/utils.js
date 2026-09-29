// ============================================
//   SaludYa! - Shared Utilities
// ============================================

'use strict';

// ─── Local Storage helpers ───
const Store = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem('saludya_' + key)); } catch { return null; }
  },
  set: (key, value) => {
    localStorage.setItem('saludya_' + key, JSON.stringify(value));
  },
  remove: (key) => {
    localStorage.removeItem('saludya_' + key);
  }
};

// ─── Auth guard ───
function requireAuth() {
  const user = Store.get('user');
  if (!user) {
    window.location.href = '../index.html';
    return null;
  }
  return user;
}

function logout() {
  Store.remove('user');
  window.location.href = '../index.html';
}

// ─── Toast notification ───
function showToast(message, type = 'default', duration = 3000) {
  // Remove existing
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    default: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'default' ? type : ''}`;
  toast.innerHTML = `${icons[type] || icons.default}<span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Format date ───
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ─── Stars HTML ───
function renderStars(rating, max = 5) {
  let html = '<div class="stars">';
  for (let i = 1; i <= max; i++) {
    html += `<span class="star${i <= rating ? ' filled' : ''}">★</span>`;
  }
  html += '</div>';
  return html;
}

// ─── Generate ID ───
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Validate email ───
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
