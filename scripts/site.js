import { fleet, fleetGroups } from '../data/fleet.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation: a simple office rail, no overlay drawer.
const menuButton = qs('[data-chart-menu]');
const chartNav = qs('[data-chart-nav]');
if (menuButton && chartNav) {
  menuButton.addEventListener('click', () => {
    const open = chartNav.dataset.open !== 'true';
    chartNav.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  chartNav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      chartNav.dataset.open = 'false';
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

const vesselHref = vessel => vessel.slug === 'sunseeker-68'
  ? 'sunseeker-68.html'
  : `contact.html?boat=${encodeURIComponent(vessel.name)}`;

// Home: show physical scale, not a repeated card carousel.
const homeScale = qs('[data-home-vessels]');
if (homeScale) {
  const selectedIds = ['M01', 'M04', 'M12', 'M15', 'M23', 'G02'];
  const selection = selectedIds.map(id => fleet.find(v => v.id === id)).filter(Boolean);
  const maxLength = 31;
  homeScale.innerHTML = selection.map(vessel => {
    const width = Math.max(18, Math.min(100, (vessel.lengthM / maxLength) * 100));
    return `<a class="vessel-bar" href="${vesselHref(vessel)}">
      <span class="vessel-bar__name"><small>${vessel.id}</small><strong>${vessel.name}</strong></span>
      <span class="vessel-bar__track"><i data-vessel-scale="${width}"></i><em>${vessel.length}</em></span>
      <span class="vessel-bar__pax">${vessel.pax} pax</span>
      <span class="vessel-bar__price">from ${vessel.price}</span>
    </a>`;
  }).join('');
  qsa('[data-vessel-scale]', homeScale).forEach(bar => { bar.style.width = `${bar.dataset.vesselScale}%`; });
}

// Full fleet register grouped by actual operation.
const register = qs('[data-fleet-register]');
if (register) {
  register.innerHTML = fleetGroups.map(group => {
    const vessels = fleet.filter(v => v.type === group.key);
    return `<section class="fleet-group" id="${group.key}" aria-labelledby="fleet-${group.key}">
      <div class="fleet-group__head"><span class="mono">${group.code}</span><h2 id="fleet-${group.key}">${group.name}</h2><span>${group.note}</span></div>
      <div class="fleet-table-head" aria-hidden="true"><span>ID</span><span>Vessel</span><span>Pax</span><span>LOA</span><span>Use / route</span><span>From</span></div>
      ${vessels.map(v => `<a class="fleet-entry" href="${vesselHref(v)}" aria-label="${v.name}, ${v.pax} guests, ${v.length}, from ${v.price}">
        <span class="fleet-entry__index">${v.id}</span><span class="fleet-entry__name">${v.name}</span><span class="fleet-entry__pax">${v.pax}</span><span class="fleet-entry__length">${v.length}</span><span class="fleet-entry__route">${v.route}</span><span class="fleet-entry__price">${v.price}</span>
      </a>`).join('')}
    </section>`;
  }).join('') + '<p class="fleet-note">Published starting figures are orientation only. VAT, fuel, mooring, season and inclusions vary by vessel. The charter desk confirms the live offer.</p>';
}

// Query parameters let fleet/service links prefill the real enquiry instead of opening fake detail pages.
const params = new URLSearchParams(window.location.search);
const requestedBoat = params.get('boat');
const requestedPlan = params.get('plan');
qsa('[data-plan]').forEach(field => {
  if (requestedBoat) field.value = `Interested in ${requestedBoat}. `;
  else if (requestedPlan) field.value = requestedPlan;
});

// Real handoff: prepare a structured WhatsApp enquiry; do not claim instant booking.
qsa('[data-dispatch-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = qs('[data-dispatch-status]', form);
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lines = [
      'Hello Marbella Boat Charter, I would like to check availability.',
      '',
      `Date: ${data.get('date') || 'To discuss'}`,
      `Guests: ${data.get('guests') || 'To discuss'}`,
      `Area / departure: ${data.get('port') || 'Flexible'}`,
      `Duration: ${data.get('duration') || 'To discuss'}`,
      `Plan / vessel: ${data.get('plan') || 'Open to recommendation'}`,
      `Name: ${data.get('name') || ''}`
    ];
    const url = `https://wa.me/34682252526?text=${encodeURIComponent(lines.join('\n'))}`;
    if (status) status.textContent = 'Opening WhatsApp with your charter brief…';
    window.open(url, '_blank', 'noopener,noreferrer');
  });
});
