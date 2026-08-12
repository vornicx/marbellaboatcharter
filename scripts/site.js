import { fleet } from '../data/fleet.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const siteHeader = qs('.site-header');
if (siteHeader) {
  const syncHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}

const menuButton = qs('[data-menu-toggle]');
const mobileNav = qs('[data-mobile-nav]');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.dataset.open !== 'true';
    mobileNav.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

const euro = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const lengthText = value => `${Number(value).toFixed(Number(value) % 1 ? 2 : 0)} m`;
const vesselHref = vessel => `/yachts/${vessel.slug}`;

const homeSelection = qs('[data-home-vessels]');
if (homeSelection) {
  const selectionIds = ['M06', 'M11', 'M15', 'M20', 'S02', 'G02'];
  const selected = selectionIds.map(id => fleet.find(v => v.id === id)).filter(Boolean);
  homeSelection.innerHTML = selected.map(v => `
    <a class="selector-card" href="${vesselHref(v)}" aria-label="${v.name}, ${v.pax} guests, from ${euro(v.from_price)}">
      <div class="selector-card__top"><span>${v.id}</span><span>${v.type}</span></div>
      <div class="selector-card__title">${v.name}</div>
      <p>${v.use}</p>
      <div class="selector-card__meta">
        <div><strong>${v.pax} guests</strong><span>Capacity</span></div>
        <div><strong>${lengthText(v.length)}</strong><span>Length</span></div>
        <div><strong>${v.port}</strong><span>Base</span></div>
      </div>
      <div class="selector-card__price">From ${euro(v.from_price)}</div>
    </a>`).join('');
}

const params = new URLSearchParams(window.location.search);
const requestedBoat = params.get('boat');
const requestedPlan = params.get('plan');
qsa('[data-plan]').forEach(field => {
  if (requestedBoat) {
    const match = fleet.find(v => v.slug === requestedBoat || v.name === requestedBoat);
    field.value = match?.name || requestedBoat;
  } else if (requestedPlan) field.value = requestedPlan;
});

qsa('[data-dispatch-form]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = qs('[data-dispatch-status]', form);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.consent = formData.get('consent') === 'true';
    if (status) status.textContent = 'Sending your charter brief…';
    try {
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, source: 'website-charter-desk', page: location.pathname }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'API unavailable');
      if (result.delivery === 'accepted_not_connected') throw new Error('delivery_not_connected');
      if (status) status.textContent = result.message || `Request received · ${result.reference || 'confirmed'}. The charter team will follow up directly.`;
      form.reset();
      return;
    } catch (_) {
      const lines = ['Hello Marbella Boat Charter, I would like to check availability.', '', `Name: ${data.name || ''}`, `Phone: ${data.phone || ''}`, `Email: ${data.email || 'Not provided'}`, `Preferred date: ${data.date || 'To discuss'}`, `Guests: ${data.guests || 'To discuss'}`, `Duration: ${data.duration || 'To discuss'}`, `Departure area: ${data.port || 'Flexible'}`, `Plan / yacht: ${data.plan || 'Open to recommendation'}`, `Budget context: ${data.budget || 'Open to recommendation'}`, `Extra detail: ${data.notes || 'None'}`];
      if (status) status.textContent = 'The direct form channel is not connected on this deployment. Opening WhatsApp with the same brief instead…';
      window.open(`https://wa.me/34682252526?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    }
  });
});