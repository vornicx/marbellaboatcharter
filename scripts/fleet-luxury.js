import { fleet } from '../data/fleet.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
const euro = value => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const categoryName = type => ({ motor: 'Motor yacht', sailing: 'Sailing', fishing: 'Fishing', group: 'Group vessel' }[type] || type);

const state = { type: 'all', guests: 0, price: 999999, sort: 'curated', shortlist: new Set() };
const list = qs('[data-l5-list]');
const count = qs('[data-l5-count]');
const typeSelect = qs('[data-l5-type]');
const guestsSelect = qs('[data-l5-guests]');
const priceSelect = qs('[data-l5-price]');
const sortSelect = qs('[data-l5-sort]');
const reset = qs('[data-l5-reset]');
const shortlist = qs('[data-l5-shortlist]');
const shortlistCount = qs('[data-l5-shortlist-count]');
const shortlistItems = qs('[data-l5-shortlist-items]');
const shortlistPlan = qs('[data-l5-shortlist-plan]');

function yachtUrl(vessel) {
  return `/yachts/${encodeURIComponent(vessel.slug)}`;
}

function filteredFleet() {
  const result = fleet.filter(vessel => {
    const typeOk = state.type === 'all' || vessel.type === state.type;
    const guestsOk = vessel.pax >= state.guests;
    const priceOk = vessel.from_price <= state.price;
    return typeOk && guestsOk && priceOk;
  });

  if (state.sort === 'price-asc') return result.sort((a, b) => a.from_price - b.from_price);
  if (state.sort === 'price-desc') return result.sort((a, b) => b.from_price - a.from_price);
  if (state.sort === 'length-desc') return result.sort((a, b) => b.length - a.length);
  if (state.sort === 'guests-desc') return result.sort((a, b) => b.pax - a.pax || b.length - a.length);
  return result;
}

function renderList() {
  if (!list) return;
  const result = filteredFleet();
  if (count) count.textContent = `${result.length} ${result.length === 1 ? 'yacht' : 'yachts'}`;

  if (!result.length) {
    list.innerHTML = `<div class="fleet-l5-empty"><h3>No yacht matches all three filters.</h3><p>Reset one filter or ask the charter desk for a recommendation against the real date and programme.</p></div>`;
    return;
  }

  list.innerHTML = result.map(vessel => {
    const selected = state.shortlist.has(vessel.id);
    const limitReached = state.shortlist.size >= 3 && !selected;
    return `<article class="fleet-l5-row" data-vessel-id="${vessel.id}">
      <span class="fleet-l5-row__id">${vessel.id}</span>
      <div class="fleet-l5-row__name"><a href="${yachtUrl(vessel)}">${vessel.name}</a></div>
      <div class="fleet-l5-row__type"><span>Type</span>${categoryName(vessel.type)}</div>
      <div class="fleet-l5-row__pax"><span>Guests</span>${vessel.pax}</div>
      <div class="fleet-l5-row__length"><span>Length</span>${Number(vessel.length).toFixed(vessel.length % 1 ? 1 : 0)} m</div>
      <div class="fleet-l5-row__price"><span>From</span><strong>${euro(vessel.from_price)}</strong></div>
      <button class="fleet-l5-row__compare${selected ? ' is-selected' : ''}" type="button" data-shortlist-toggle="${vessel.id}" aria-label="${selected ? 'Remove' : 'Add'} ${vessel.name} ${selected ? 'from' : 'to'} shortlist" aria-pressed="${selected}" ${limitReached ? 'disabled' : ''}>${selected ? '✓' : '+'}</button>
    </article>`;
  }).join('');

  qsa('[data-shortlist-toggle]', list).forEach(button => button.addEventListener('click', () => toggleShortlist(button.dataset.shortlistToggle)));
}

function renderShortlist() {
  if (!shortlist || !shortlistItems || !shortlistCount) return;
  const vessels = [...state.shortlist].map(id => fleet.find(v => v.id === id)).filter(Boolean);
  shortlist.hidden = vessels.length === 0;
  shortlistCount.textContent = `${vessels.length} ${vessels.length === 1 ? 'yacht' : 'yachts'} selected`;
  shortlistItems.innerHTML = vessels.map(vessel => `<span class="fleet-l5-shortlist__chip">${vessel.name}<button type="button" data-shortlist-remove="${vessel.id}" aria-label="Remove ${vessel.name}">×</button></span>`).join('');
  qsa('[data-shortlist-remove]', shortlistItems).forEach(button => button.addEventListener('click', () => toggleShortlist(button.dataset.shortlistRemove)));
}

function toggleShortlist(id) {
  if (state.shortlist.has(id)) state.shortlist.delete(id);
  else if (state.shortlist.size < 3) state.shortlist.add(id);
  renderList();
  renderShortlist();
}

function syncFromControls() {
  state.type = typeSelect?.value || 'all';
  state.guests = Number(guestsSelect?.value || 0);
  state.price = Number(priceSelect?.value || 999999);
  state.sort = sortSelect?.value || 'curated';
  renderList();
}

[typeSelect, guestsSelect, priceSelect, sortSelect].filter(Boolean).forEach(control => control.addEventListener('change', syncFromControls));

reset?.addEventListener('click', () => {
  state.type = 'all'; state.guests = 0; state.price = 999999; state.sort = 'curated';
  if (typeSelect) typeSelect.value = 'all';
  if (guestsSelect) guestsSelect.value = '0';
  if (priceSelect) priceSelect.value = '999999';
  if (sortSelect) sortSelect.value = 'curated';
  renderList();
});

qsa('[data-category-jump]').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.categoryJump;
  state.type = type;
  if (typeSelect) typeSelect.value = type;
  renderList();
  qs('#find-your-yacht')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}));

shortlistPlan?.addEventListener('click', () => {
  const names = [...state.shortlist].map(id => fleet.find(v => v.id === id)?.name).filter(Boolean);
  if (!names.length) return;
  const plan = `Shortlist: ${names.join(' / ')}`;
  window.location.href = `booking.html?plan=${encodeURIComponent(plan)}`;
});

renderList();
renderShortlist();