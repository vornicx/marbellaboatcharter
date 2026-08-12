import { fleet, fleetGroups } from '../data/fleet.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const menuButton = qs('[data-menu-toggle]');
const mobileNav = qs('[data-mobile-nav]');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.dataset.open !== 'true';
    mobileNav.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

const vesselHref = vessel => vessel.slug === 'sunseeker-68'
  ? 'sunseeker-68.html'
  : `contact.html?boat=${encodeURIComponent(vessel.name)}`;

const homeSelection = qs('[data-home-vessels]');
if (homeSelection) {
  const selectionIds = ['M04', 'M11', 'M15', 'S02', 'F02', 'G02'];
  const selected = selectionIds.map(id => fleet.find(v => v.id === id)).filter(Boolean);
  homeSelection.innerHTML = selected.map(vessel => `
    <a class="selection-card" href="${vesselHref(vessel)}" aria-label="${vessel.name}, ${vessel.pax} guests, from ${vessel.price}">
      <div class="selection-card__top"><span>${vessel.id}</span><span>${vessel.type}</span></div>
      <div class="selection-card__name">${vessel.name}</div>
      <p>${vessel.route}</p>
      <div class="selection-card__meta">
        <div><strong>${vessel.pax} guests</strong><span>Capacity</span></div>
        <div><strong>${vessel.length}</strong><span>Length</span></div>
        <div><strong>${vessel.duration}</strong><span>Duration</span></div>
      </div>
      <div class="selection-card__price">From ${vessel.price}</div>
    </a>
  `).join('');
}

const register = qs('[data-fleet-register]');
if (register) {
  register.innerHTML = fleetGroups.map(group => {
    const vessels = fleet.filter(v => v.type === group.key);
    return `
      <section class="fleet-group" id="${group.key}" aria-labelledby="group-${group.key}">
        <div class="fleet-group__head">
          <span class="mono">${group.code}</span>
          <h2 id="group-${group.key}">${group.name}</h2>
          <span>${group.note}</span>
        </div>
        <div class="fleet-table-head" aria-hidden="true"><span>ID</span><span>Vessel</span><span>Pax</span><span>LOA</span><span>Use / route</span><span>From</span></div>
        ${vessels.map(v => `
          <a class="fleet-entry" href="${vesselHref(v)}" aria-label="${v.name}, ${v.pax} guests, ${v.length}, from ${v.price}">
            <span class="fleet-entry__index">${v.id}</span>
            <span class="fleet-entry__name">${v.name}</span>
            <span class="fleet-entry__pax">${v.pax}</span>
            <span class="fleet-entry__length">${v.length}</span>
            <span class="fleet-entry__route">${v.route}</span>
            <span class="fleet-entry__price">${v.price}</span>
          </a>`).join('')}
      </section>`;
  }).join('') + '<p class="fleet-note">Published starting figures are indicative only. Rates vary by season, route, VAT treatment, fuel, mooring and vessel-specific inclusions.</p>';
}

const params = new URLSearchParams(window.location.search);
const requestedBoat = params.get('boat');
const requestedPlan = params.get('plan');
qsa('[data-plan]').forEach(field => {
  if (requestedBoat) field.value = requestedBoat;
  else if (requestedPlan) field.value = requestedPlan;
});

qsa('[data-dispatch-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const status = qs('[data-dispatch-status]', form);
    const lines = [
      'Hello Marbella Boat Charter, I would like to check availability.',
      '',
      `Name: ${data.get('name') || ''}`,
      `Preferred date: ${data.get('date') || 'To discuss'}`,
      `Guests: ${data.get('guests') || 'To discuss'}`,
      `Duration: ${data.get('duration') || 'To discuss'}`,
      `Area / departure: ${data.get('port') || 'Flexible'}`,
      `Plan / vessel: ${data.get('plan') || 'Open to recommendation'}`,
      `Extra detail: ${data.get('notes') || 'None'}`
    ];

    const url = `https://wa.me/34682252526?text=${encodeURIComponent(lines.join('\n'))}`;
    if (status) status.textContent = 'Opening WhatsApp with your charter brief…';
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});
