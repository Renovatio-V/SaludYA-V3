// ============================================
//   SaludYa! - Historial Médico JS
// ============================================

'use strict';

let currentRatingId = null;
let currentRating = 0;

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  const records = Store.get('medical_records') || getSampleRecords();
  const prescriptions = Store.get('prescriptions') || getSamplePrescriptions();
  Store.set('medical_records', records);
  Store.set('prescriptions', prescriptions);

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  renderRecords(records);
  renderPrescriptions(prescriptions);

  // Modal close
  document.getElementById('closeModal').addEventListener('click', closeRatingModal);
  document.getElementById('cancelRating').addEventListener('click', closeRatingModal);
  document.getElementById('submitRating').addEventListener('click', submitRating);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeRatingModal();
  });
});

function renderRecords(records) {
  const container = document.getElementById('servicesList');
  container.innerHTML = records.map(r => `
    <div class="service-card">
      <div class="service-card__header">
        <div class="service-card__title-group">
          <div class="service-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div class="service-card__name">${r.name}</div>
            <div class="service-card__date">${formatDate(r.date)}</div>
          </div>
        </div>
        ${r.rating ? renderStars(r.rating) : ''}
      </div>
      <div class="service-card__body">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-item__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Doctor
            </div>
            <div class="detail-item__value">${r.doctor}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              Especialidad
            </div>
            <div class="detail-item__value">${r.specialty}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Diagnóstico
            </div>
            <div class="detail-item__value">${r.diagnosis}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item__label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m10 20 4-16m4 4-4-4-4 4M6 16l4 4 4-4"/>
              </svg>
              Prescripción
            </div>
            <div class="detail-item__value">${r.prescription}</div>
          </div>
        </div>
        ${r.review ? `<div class="review-box">"${r.review}"</div>` : ''}
      </div>
      ${!r.rating ? `
        <div class="rate-row">
          <button class="btn btn-accent btn-block btn-sm" onclick="openRatingModal('${r.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Calificar Servicio
          </button>
        </div>` : ''}
    </div>
  `).join('');
}

function renderPrescriptions(prescriptions) {
  const container = document.getElementById('prescriptionsList');
  container.innerHTML = prescriptions.map(p => `
    <div class="prescription-card">
      <div class="prescription-card__name">${p.medication}</div>
      <div class="prescription-detail">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <strong>Dosis:</strong>&nbsp;${p.dosage}
      </div>
      <div class="prescription-detail">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <strong>Frecuencia:</strong>&nbsp;${p.frequency}
      </div>
      <div class="prescription-detail">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <strong>Doctor:</strong>&nbsp;${p.doctor}
      </div>
      <div class="prescription-detail">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        </svg>
        <strong>Indicación:</strong>&nbsp;${p.indication}
      </div>
    </div>
  `).join('');
}

function openRatingModal(id) {
  currentRatingId = id;
  currentRating = 0;
  updateStarPicker(0);
  document.getElementById('ratingReview').value = '';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeRatingModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  currentRatingId = null;
}

function updateStarPicker(rating) {
  document.querySelectorAll('.star-picker__star').forEach((s, i) => {
    s.classList.toggle('active', i < rating);
  });
}

// Star picker interaction
document.querySelectorAll('.star-picker__star').forEach((star, i) => {
  star.addEventListener('mouseenter', () => updateStarPicker(i + 1));
  star.addEventListener('mouseleave', () => updateStarPicker(currentRating));
  star.addEventListener('click', () => { currentRating = i + 1; updateStarPicker(currentRating); });
});

function submitRating() {
  if (currentRating === 0) { showToast('Selecciona una calificación', 'warning'); return; }
  const review = document.getElementById('ratingReview').value.trim();
  const records = Store.get('medical_records') || [];
  const rec = records.find(r => r.id === currentRatingId);
  if (rec) {
    rec.rating = currentRating;
    if (review) rec.review = review;
    Store.set('medical_records', records);
    renderRecords(records);
    closeRatingModal();
    showToast('¡Gracias por tu calificación!', 'success');
  }
}

function getSampleRecords() {
  return [
    { id: generateId(), name: 'Consulta General', date: '2026-04-15', doctor: 'Dr. Carlos Mendoza', specialty: 'Medicina General', diagnosis: 'Gripe común. Se recomienda reposo y abundantes líquidos.', prescription: 'Paracetamol 500mg cada 8 horas por 5 días', rating: 5, review: 'Excelente atención, muy profesional y atento.' },
    { id: generateId(), name: 'Control de Presión', date: '2026-03-20', doctor: 'Dra. Ana Martínez', specialty: 'Cardiología', diagnosis: 'Presión arterial ligeramente elevada. Continuar con control periódico.', prescription: 'Losartán 50mg, 1 tableta diaria en ayunas', rating: null, review: null },
    { id: generateId(), name: 'Análisis de Laboratorio', date: '2026-02-10', doctor: 'Dr. Roberto Sánchez', specialty: 'Medicina General', diagnosis: 'Resultados normales. Niveles de colesterol dentro del rango saludable.', prescription: 'No requiere medicación. Mantener dieta balanceada.', rating: 4, review: 'Buen servicio, aunque la espera fue un poco larga.' }
  ];
}

function getSamplePrescriptions() {
  return [
    { id: generateId(), medication: 'Losartán 50mg', dosage: '1 tableta', frequency: 'Diaria en ayunas', doctor: 'Dra. Ana Martínez', indication: 'Control de presión arterial' },
    { id: generateId(), medication: 'Vitamina D3 1000UI', dosage: '1 cápsula', frequency: 'Diaria con el almuerzo', doctor: 'Dr. Carlos Mendoza', indication: 'Suplemento vitamínico preventivo' }
  ];
}
