// ============================================
//   SaludYa! - Citas (Appointments) JS
// ============================================

'use strict';

const SPECIALTIES = [
  'Medicina General', 'Pediatría', 'Cardiología',
  'Dermatología', 'Ginecología', 'Neurología',
  'Ortopedia', 'Oftalmología', 'Otorrinolaringología',
  'Psiquiatría', 'Endocrinología', 'Urología'
];

let appointments = [];
let currentFilter = 'all';
let showingForm = false;

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth();
  if (!user) return;

  // Load data
  appointments = Store.get('appointments') || getSampleAppointments();
  Store.set('appointments', appointments);

  // Populate specialty select
  const specialtySelect = document.getElementById('specialty');
  SPECIALTIES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    specialtySelect.appendChild(opt);
  });

  // Set default date to today
  const dateInput = document.getElementById('aptDate');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;

  // UI refs
  const newBtn    = document.getElementById('newAptBtn');
  const cancelBtn = document.getElementById('cancelFormBtn');
  const form      = document.getElementById('citaForm');
  const layout    = document.getElementById('citasLayout');

  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderAppointments();
    });
  });

  // Show / hide form
  newBtn.addEventListener('click', () => {
    showingForm = true;
    layout.classList.remove('form-hidden');
    newBtn.style.display = 'none';
    document.getElementById('citaForm').reset();
    document.getElementById('aptDate').value = today;
    document.getElementById('patientName').value = user.name || user.username;
  });

  cancelBtn.addEventListener('click', hideForm);

  function hideForm() {
    showingForm = false;
    layout.classList.add('form-hidden');
    newBtn.style.display = '';
  }

  // Submit form
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name      = document.getElementById('patientName').value.trim();
    const date      = document.getElementById('aptDate').value;
    const hourH     = document.getElementById('aptHour').value;
    const hourM     = document.getElementById('aptMin').value;
    const specialty = document.getElementById('specialty').value;
    const reason    = document.getElementById('reason').value.trim();

    if (!name || !date || !specialty) {
      showToast('Complete los campos obligatorios', 'error'); return;
    }

    const time = hourH && hourM ? `${hourH}:${hourM}` : '';

    const apt = {
      id: generateId(),
      patientName: name,
      date, time, specialty, reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    appointments.unshift(apt);
    Store.set('appointments', appointments);
    updateFilterCounts();
    renderAppointments();
    hideForm();
    showToast('Cita creada exitosamente', 'success');
  });

  updateFilterCounts();
  renderAppointments();
});

function updateFilterCounts() {
  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };
  document.getElementById('countAll').textContent       = counts.all;
  document.getElementById('countPending').textContent   = counts.pending;
  document.getElementById('countConfirmed').textContent = counts.confirmed;
  document.getElementById('countCompleted').textContent = counts.completed;
}

function renderAppointments() {
  const list = document.getElementById('citasList');
  const filtered = currentFilter === 'all'
    ? appointments
    : appointments.filter(a => a.status === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <p class="empty-state__title">No hay citas programadas</p>
        <p class="empty-state__text">Comienza creando tu primera cita</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(apt => `
    <div class="cita-item" id="apt-${apt.id}">
      <div class="cita-item__header">
        <div>
          <div class="cita-item__title">${apt.specialty}</div>
          <div class="cita-item__meta">
            <span class="cita-item__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${formatDate(apt.date)}
            </span>
            ${apt.time ? `
            <span class="cita-item__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              ${apt.time}
            </span>` : ''}
            <span class="cita-item__meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              ${apt.patientName}
            </span>
          </div>
        </div>
        <span class="badge ${getBadgeClass(apt.status)}">${getStatusLabel(apt.status)}</span>
      </div>
      ${apt.reason ? `<div class="cita-item__reason">${apt.reason}</div>` : ''}
      <div class="cita-item__actions">
        ${apt.status === 'pending' ? `
          <button class="btn btn-sm btn-accent" onclick="confirmApt('${apt.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Confirmar
          </button>` : ''}
        ${apt.status !== 'completed' && apt.status !== 'cancelled' ? `
          <button class="btn btn-sm btn-destructive" onclick="cancelApt('${apt.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancelar
          </button>` : ''}
      </div>
    </div>
  `).join('');
}

function confirmApt(id) {
  const apt = appointments.find(a => a.id === id);
  if (apt) { apt.status = 'confirmed'; save(); }
}

function cancelApt(id) {
  if (!confirm('¿Cancelar esta cita?')) return;
  const apt = appointments.find(a => a.id === id);
  if (apt) { apt.status = 'cancelled'; save(); }
}

function save() {
  Store.set('appointments', appointments);
  updateFilterCounts();
  renderAppointments();
  showToast('Estado actualizado', 'success');
}

function getBadgeClass(status) {
  const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' };
  return map[status] || '';
}

function getStatusLabel(status) {
  const map = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
  return map[status] || status;
}

function getSampleAppointments() {
  return [
    { id: generateId(), patientName: 'Juan Pérez Martínez', date: '2026-06-15', time: '10:30', specialty: 'Medicina General', reason: 'Consulta de rutina anual', status: 'confirmed', createdAt: new Date().toISOString() },
    { id: generateId(), patientName: 'Juan Pérez Martínez', date: '2026-06-22', time: '14:00', specialty: 'Cardiología', reason: 'Control de presión arterial', status: 'pending', createdAt: new Date().toISOString() }
  ];
}
