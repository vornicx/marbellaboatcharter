import { fleet } from '../data/fleet.js';

const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => [...r.querySelectorAll(s)];

const menuButton = qs('[data-menu-toggle]');
const mobileNav = qs('[data-mobile-nav]');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const next = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(next));
    mobileNav.dataset.open = String(next);
  });
}

const drawer = qs('[data-planner-drawer]');
let lastFocused = null;
const openPlanner = () => {
  if (!drawer) return;
  lastFocused = document.activeElement;
  drawer.hidden = false;
  requestAnimationFrame(() => {
    drawer.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
    const first = qs('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer);
    first?.focus();
  });
};
const closePlanner = () => {
  if (!drawer) return;
  drawer.dataset.open = 'false';
  document.body.style.overflow = '';
  setTimeout(() => { drawer.hidden = true; lastFocused?.focus(); }, 380);
};
qsa('[data-open-planner]').forEach(el => el.addEventListener('click', (e) => { if (el.tagName === 'A') e.preventDefault(); openPlanner(); }));
qsa('[data-close-planner]').forEach(el => el.addEventListener('click', closePlanner));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer && !drawer.hidden) closePlanner(); });

if (drawer) {
  drawer.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = qsa('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])', drawer).filter(el => !el.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

const fleetContainer = qs('[data-fleet-list]');
const fleetPreview = qs('[data-fleet-preview] img');
const filters = qsa('[data-fleet-filter]');
function renderFleet(filter='all', limit=null) {
  if (!fleetContainer) return;
  const selected = fleet.filter(item => filter === 'all' || item.type === filter).slice(0, limit || 999);
  fleetContainer.innerHTML = selected.map(item => `
    <a class="fleet-row" href="${item.slug === 'sunseeker-68' ? 'sunseeker-68.html' : 'fleet.html'}" data-image="${item.image}" data-type="${item.type}">
      <span class="fleet-row__id">${item.id}</span>
      <span class="fleet-row__name">${item.name}</span>
      <span class="fleet-row__meta">${item.capacity} guests · ${item.duration}</span>
      <span class="fleet-row__meta fleet-row__length">${item.length}</span>
      <span class="fleet-row__price">from ${item.from}</span>
      <span class="fleet-row__arrow" aria-hidden="true">→</span>
    </a>`).join('');
  qsa('.fleet-row', fleetContainer).forEach(row => {
    const swap = () => {
      if (!fleetPreview) return;
      const next = row.dataset.image;
      if (fleetPreview.src === next) return;
      fleetPreview.style.opacity = '0';
      setTimeout(() => { fleetPreview.src = next; fleetPreview.style.opacity = '1'; }, 120);
    };
    row.addEventListener('mouseenter', swap);
    row.addEventListener('focus', swap);
  });
  if (fleetPreview && selected[0]) fleetPreview.src = selected[0].image;
}
if (fleetContainer) {
  renderFleet(fleetContainer.dataset.limit ? 'all' : 'all', fleetContainer.dataset.limit ? Number(fleetContainer.dataset.limit) : null);
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    renderFleet(btn.dataset.fleetFilter);
  }));
}

// Planner state machine
const steps = qsa('[data-planner-step]');
const progress = qs('[data-progress-bar]');
let step = 1;
const state = { intent: '', guests: 2, date: '', duration: '', name:'', email:'', phone:'' };
function showStep(n) {
  step = Math.max(1, Math.min(4, n));
  steps.forEach(s => s.dataset.active = String(Number(s.dataset.plannerStep) === step));
  if (progress) progress.style.transform = `scaleX(${step / 4})`;
  qs('[data-planner-back]')?.toggleAttribute('disabled', step === 1);
  const next = qs('[data-planner-next]');
  if (next) next.querySelector('.btn__label').textContent = step === 4 ? 'Send request' : 'Continue';
}
qsa('[data-choice]').forEach(btn => btn.addEventListener('click', () => {
  const group = btn.dataset.group;
  qsa(`[data-choice][data-group="${group}"]`).forEach(b => b.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed','true');
  state[group] = btn.dataset.value;
}));
qs('[data-guests]')?.addEventListener('input', e => state.guests = Number(e.target.value));
qsa('[data-duration]').forEach(btn => btn.addEventListener('click', () => state.duration = btn.dataset.value));
qs('[data-planner-back]')?.addEventListener('click', () => showStep(step - 1));
qs('[data-planner-next]')?.addEventListener('click', () => {
  if (step === 1 && !state.intent) return setInlineError('Choose what you want from the day.');
  if (step === 2 && (!state.date || !state.duration)) return setInlineError('Choose a date and duration so we can narrow the fleet.');
  if (step === 3 && (!qs('[data-name]')?.value || !qs('[data-email]')?.value)) return setInlineError('Add your name and email so the team can reply.');
  clearInlineError();
  if (step < 4) { showStep(step + 1); if (step === 4) renderSummary(); }
  else submitPlanner();
});
function setInlineError(message) { const el = qs('[data-planner-error]'); if (el) { el.textContent = message; el.hidden = false; } }
function clearInlineError() { const el = qs('[data-planner-error]'); if (el) { el.hidden = true; el.textContent = ''; } }
function renderSummary() {
  state.name = qs('[data-name]')?.value || '';
  state.email = qs('[data-email]')?.value || '';
  state.phone = qs('[data-phone]')?.value || '';
  const el = qs('[data-summary]');
  if (!el) return;
  el.innerHTML = `<li><span>Experience</span><strong>${state.intent}</strong></li><li><span>Guests</span><strong>${state.guests}</strong></li><li><span>Date</span><strong>${state.date || '—'}</strong></li><li><span>Duration</span><strong>${state.duration}</strong></li><li><span>Reply to</span><strong>${state.email}</strong></li>`;
}
function submitPlanner() {
  const btn = qs('[data-planner-next]');
  if (!btn) return;
  btn.dataset.loading = 'true';
  btn.setAttribute('aria-busy','true');
  setTimeout(() => {
    btn.removeAttribute('data-loading');
    btn.removeAttribute('aria-busy');
    const active = qs('[data-planner-step="4"]');
    if (active) active.innerHTML = `<p class="eyebrow">Request prepared</p><h2 class="display display--section">The team has everything needed to shortlist the right boats.</h2><p class="lead">This build uses a local success state. Production wiring should send the request to the booking API/CRM and trigger an email or WhatsApp acknowledgement.</p>`;
    btn.setAttribute('disabled','');
  }, 900);
}

// Custom calendar (no native date control)
const cal = qs('[data-calendar]');
if (cal) {
  const today = new Date(); today.setHours(0,0,0,0);
  let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabel = qs('[data-month-label]', cal);
  const grid = qs('[data-calendar-grid]', cal);
  const input = qs('[data-date-display]');
  const fmtMonth = new Intl.DateTimeFormat('en-GB', {month:'long', year:'numeric'});
  const fmtDate = new Intl.DateTimeFormat('en-GB', {day:'2-digit', month:'short', year:'numeric'});
  const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function drawCalendar() {
    monthLabel.textContent = fmtMonth.format(cursor);
    const firstDay = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - firstDay);
    grid.innerHTML = ['M','T','W','T','F','S','S'].map(d=>`<span class="calendar__dow" aria-hidden="true">${d}</span>`).join('');
    for (let i=0;i<42;i++) {
      const d = new Date(start); d.setDate(start.getDate()+i);
      const outside = d.getMonth() !== cursor.getMonth();
      const disabled = d < today;
      const selected = state.date === iso(d);
      const b = document.createElement('button');
      b.type='button'; b.className='calendar__day'; b.textContent=d.getDate(); b.dataset.outside=String(outside); b.disabled=disabled; b.setAttribute('aria-label',fmtDate.format(d)); b.setAttribute('aria-selected',String(selected));
      b.addEventListener('click',()=>{ state.date=iso(d); if(input) input.value=fmtDate.format(d); drawCalendar(); });
      grid.appendChild(b);
    }
  }
  qs('[data-cal-prev]', cal)?.addEventListener('click',()=>{ cursor = new Date(cursor.getFullYear(), cursor.getMonth()-1,1); drawCalendar(); });
  qs('[data-cal-next]', cal)?.addEventListener('click',()=>{ cursor = new Date(cursor.getFullYear(), cursor.getMonth()+1,1); drawCalendar(); });
  drawCalendar();
}
showStep(1);
