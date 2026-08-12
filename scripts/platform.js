import { fleet } from '../data/fleet.js';

const qs = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => [...r.querySelectorAll(s)];
const euro = value => new Intl.NumberFormat('en-IE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(value);

const cardsRoot = qs('[data-fleet-cards]');
if (cardsRoot) {
  const type = qs('[data-fleet-type]');
  const guests = qs('[data-fleet-guests]');
  const price = qs('[data-fleet-price]');
  const count = qs('[data-fleet-count]');
  const reset = qs('[data-reset-filters]');
  const dock = qs('[data-compare-dock]');
  const dockItems = qs('[data-compare-items]');
  const dockCount = qs('[data-compare-count]');
  const plan = qs('[data-compare-plan]');
  const selected = new Set();

  const renderDock = () => {
    const chosen = fleet.filter(v => selected.has(v.slug));
    dock.hidden = chosen.length === 0;
    dockCount.textContent = `${chosen.length} selected`;
    dockItems.innerHTML = chosen.map(v => `<button type="button" data-remove-compare="${v.slug}" aria-label="Remove ${v.name}">${v.name}<span>×</span></button>`).join('');
    qsa('[data-remove-compare]', dockItems).forEach(btn => btn.addEventListener('click', () => {
      selected.delete(btn.dataset.removeCompare);
      render();
    }));
  };

  const render = () => {
    const t = type.value;
    const g = Number(guests.value);
    const p = Number(price.value);
    const list = fleet.filter(v => (t === 'all' || v.type === t) && v.pax >= g && v.from_price <= p);
    count.textContent = `${list.length} vessel${list.length === 1 ? '' : 's'}`;
    cardsRoot.innerHTML = list.map(v => `
      <article class="fleet-product">
        <a class="fleet-product__main" href="/yachts/${v.slug}">
          <div class="fleet-product__index"><span>${v.id}</span><span>${v.type}</span></div>
          <h2>${v.name}</h2>
          <p>${v.use}</p>
          <div class="fleet-product__facts"><span><strong>${v.pax}</strong> guests</span><span><strong>${v.length} m</strong> length</span><span><strong>${v.port}</strong> base</span></div>
          <div class="fleet-product__price"><span>Published from</span><strong>${euro(v.from_price)}</strong></div>
        </a>
        <button class="fleet-product__compare" type="button" data-compare="${v.slug}" aria-pressed="${selected.has(v.slug)}">${selected.has(v.slug) ? 'Selected' : 'Compare'}</button>
      </article>`).join('');
    qsa('[data-compare]', cardsRoot).forEach(btn => btn.addEventListener('click', () => {
      const slug = btn.dataset.compare;
      if (selected.has(slug)) selected.delete(slug);
      else if (selected.size < 3) selected.add(slug);
      else {
        const first = selected.values().next().value;
        selected.delete(first);
        selected.add(slug);
      }
      render();
    }));
    renderDock();
  };

  [type, guests, price].forEach(el => el.addEventListener('change', render));
  reset.addEventListener('click', () => { type.value='all'; guests.value='0'; price.value='999999'; render(); });
  plan.addEventListener('click', () => {
    const names = fleet.filter(v => selected.has(v.slug)).map(v => v.name).join(', ');
    location.href = `/contact?plan=${encodeURIComponent(`Comparing: ${names}`)}`;
  });
  render();
}
