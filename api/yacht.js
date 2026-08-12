const fleet = require('../data/fleet.json');

const BASE = 'https://marbellaboatcharter.com';
const PHONE = '+34 682 25 25 26';
const EMAIL = 'info@marbellaboatcharter.com';
const ADDRESS = 'Edificio de Levante 10-B, 29660 Puerto Banús';
const labels = { motor:'Motor yacht', sailing:'Sailing yacht', fishing:'Fishing boat', group:'Group vessel' };
const included = {
  motor:['Qualified professional skipper','Route planning with the charter team','Standard onboard safety equipment','Drinks and snacks where specified for the vessel'],
  sailing:['Qualified skipper / professional crew','Sailing route planning','Standard onboard safety equipment','Drinks and snacks where specified'],
  fishing:['Professional fishing crew','Fishing equipment and bait for the booked programme','Standard onboard safety equipment','Operational route planning'],
  group:['Professional crew','Fuel within the published charter programme','Standard onboard safety equipment','Group-event coordination']
};

const e = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const num = value => Number(value).toLocaleString('en-IE',{maximumFractionDigits:2});
const eur = value => Number(value).toLocaleString('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:0});

function classify(v) {
  if (v.type === 'motor') {
    if (v.length < 10) return 'sport day boat';
    if (v.length < 15) return 'mid-size motor yacht';
    if (v.length < 22) return 'large luxury motor yacht';
    return 'large-format luxury yacht';
  }
  if (v.type === 'sailing') return v.beam > 5 ? 'catamaran sailing yacht' : 'monohull sailing yacht';
  if (v.type === 'fishing') return 'professional fishing boat';
  return 'large-capacity event vessel';
}

function overview(v) {
  if (v.type === 'motor') return `${v.name} is a ${classify(v)} in Marbella Boat Charter's current published fleet, configured for up to ${v.pax} guests by day. At ${num(v.length)} metres, it is suited to ${v.use.toLowerCase()}.`;
  if (v.type === 'sailing') return `${v.name} is a ${classify(v)} based in Puerto Banús for up to ${v.pax} guests. Its ${num(v.length)}-metre length and ${num(v.beam)}-metre beam support a more relaxed sailing-led experience than a typical motor-yacht charter.`;
  if (v.type === 'fishing') return `${v.name} is a ${classify(v)} for up to ${v.pax} guests, with published programmes for ${v.use.toLowerCase()}. Fishing charters depart with professional crew and the operating equipment required for the booked format.`;
  return `${v.name} is a ${classify(v)} based at ${v.port}, designed for up to ${v.pax} passengers. It gives larger private and corporate groups a single-vessel option instead of automatically splitting the party across several yachts.`;
}

function header() {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header level5-header"><div class="site-header__inner shell--wide"><a class="brand-mark" href="/" aria-label="Marbella Boat Charter home"><span class="brand-mark__sign" aria-hidden="true">M</span><span>Marbella Boat Charter</span></a><nav class="nav" aria-label="Primary navigation"><a href="/fleet">Fleet</a><a href="/experiences">Experiences</a><a href="/destinations">Destinations</a><a href="/owners">Owners</a><a href="/contact">Contact</a></nav><div class="header-actions"><a class="header-contact" href="tel:+34682252526">${PHONE}</a><a class="btn" data-variant="primary" href="/contact">Plan a charter</a><button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-menu-toggle>☰</button></div></div><nav class="mobile-nav shell--wide" aria-label="Mobile navigation" data-mobile-nav data-open="false"><a href="/fleet">Fleet</a><a href="/experiences">Experiences</a><a href="/destinations">Destinations</a><a href="/owners">Owners</a><a href="/contact">Contact</a><a class="btn" data-variant="primary" href="/contact">Plan a charter</a></nav></header>`;
}

function footer() {
  return `<footer class="site-footer level5-footer"><div class="shell footer-top"><div><a class="brand-mark" href="/"><span class="brand-mark__sign" aria-hidden="true">M</span><span>Marbella Boat Charter</span></a><p class="footer-note">Private yacht charter, sailing, fishing and group programmes across Marbella, Puerto Banús and the Costa del Sol.</p></div><nav class="footer-nav" aria-label="Explore"><strong>Explore</strong><a href="/fleet">Fleet</a><a href="/experiences">Experiences</a><a href="/destinations">Destinations</a><a href="/owners">Yacht owners</a><a href="/contact">Contact</a></nav><div class="footer-contact"><strong>Charter desk</strong><a href="tel:+34682252526">${PHONE}</a><a href="mailto:${EMAIL}">${EMAIL}</a><span>${ADDRESS}</span><a href="/booking-terms">Booking terms</a></div></div><div class="shell footer-bottom"><span>© <span data-year></span> Marbella Boat Charter</span><span><a href="/privacy">Privacy</a> · <a href="/cookies">Cookies</a> · <a href="/legal">Legal</a></span></div></footer>`;
}

module.exports = function handler(req, res) {
  const slug = String(req.query.slug || '').toLowerCase().replace(/[^a-z0-9-]/g,'');
  const v = fleet.find(item => item.slug === slug);
  if (!v) {
    res.statusCode = 404;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.end('<!doctype html><meta charset="utf-8"><title>Yacht not found</title><p>Yacht not found. <a href="/fleet">Return to fleet</a>.</p>');
  }

  const canonical = `${BASE}/yachts/${v.slug}`;
  const description = `Charter ${v.name} in Marbella / Puerto Banús: up to ${v.pax} guests, ${num(v.length)} m, published rates from ${eur(v.from_price)}. Request current availability and a tailored quote.`;
  const faqs = [
    [`How many guests can charter ${v.name}?`,`The current public listing shows a day-charter capacity of up to ${v.pax} guests. Final operating capacity is confirmed with the charter team for the booked programme.`],
    [`Where does ${v.name} depart from?`,`The current listing places this vessel at ${v.port}. Exact meeting point and boarding instructions are confirmed with the booking.`],
    [`What is the price to charter ${v.name}?`,`Published rates currently start from ${eur(v.from_price)}, with the exact total depending on duration, season, tax treatment, route, fuel rules and vessel-specific inclusions. The final quotation controls.`]
  ];
  const schema = { '@context':'https://schema.org', '@graph':[
    {'@type':'Service','name':`${v.name} yacht charter`,'serviceType':`${labels[v.type]} charter`,'description':description,'provider':{'@type':'LocalBusiness','name':'Marbella Boat Charter','telephone':PHONE,'email':EMAIL,'address':ADDRESS},'areaServed':['Puerto Banús','Marbella','Costa del Sol'],'offers':{'@type':'AggregateOffer','priceCurrency':'EUR','lowPrice':v.from_price,'availability':'https://schema.org/LimitedAvailability'},'url':canonical},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE},{'@type':'ListItem','position':2,'name':'Fleet','item':BASE+'/fleet'},{'@type':'ListItem','position':3,'name':v.name,'item':canonical}]},
    {'@type':'FAQPage','mainEntity':faqs.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}
  ]};
  const rates = v.rates.map(([label,rate])=>`<tr><th scope="row">${e(label)}</th><td>${e(rate)}</td></tr>`).join('');
  const inclusions = included[v.type].map(item=>`<li>${e(item)}</li>`).join('');
  const faqHtml = faqs.map(([q,a])=>`<details class="faq-item"><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('');
  const related = fleet.filter(x=>x.type===v.type && x.slug!==v.slug).sort((a,b)=>Math.abs(a.length-v.length)-Math.abs(b.length-v.length)).slice(0,3).map(x=>`<a class="related-vessel" href="/yachts/${e(x.slug)}"><span>${e(x.name)}</span><small>${x.pax} guests · ${num(x.length)} m · from ${eur(x.from_price)}</small></a>`).join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${e(v.name)} yacht charter Marbella | Marbella Boat Charter</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${e(v.name)} yacht charter Marbella"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${canonical}"><meta name="theme-color" content="#10131a"><link rel="stylesheet" href="/styles/brand.css"><link rel="stylesheet" href="/styles/site.css"><link rel="stylesheet" href="/styles/platform.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head><body>${header()}<main id="main"><section class="vessel-hero"><div class="shell--wide vessel-hero__grid"><div class="vessel-hero__copy"><p class="eyebrow">${e(labels[v.type])} · ${e(v.port)}</p><h1 class="display display--xl">${e(v.name)}</h1><p class="lead">${e(v.use)}.</p><div class="vessel-facts"><div><span>Guests</span><strong>${v.pax}</strong></div><div><span>Length</span><strong>${num(v.length)} m</strong></div><div><span>Beam</span><strong>${num(v.beam)} m</strong></div><div><span>From</span><strong>${eur(v.from_price)}</strong></div></div><div class="hero__actions"><a class="btn" data-variant="primary" href="/contact?boat=${encodeURIComponent(v.slug)}">Check availability</a><a class="btn" data-variant="secondary" href="/fleet">Back to fleet</a></div></div><div class="vessel-hero__visual"><div class="vessel-watermark">${e(v.id)}</div><p>Authorised ${e(v.name)} photography is the next asset layer; the commercial specification below is already tied to the operator's current public listing.</p></div></div></section><section class="section shell"><div class="detail-grid"><article><p class="eyebrow">Overview</p><h2 class="display display--section">Where this yacht fits.</h2><p class="lead">${e(overview(v))}</p><p class="body-copy">The charter team confirms the exact route, meeting point and operating plan for the selected date rather than assuming every yacht can serve every itinerary in the same way.</p></article><aside class="panel"><p class="eyebrow">Published specification</p><ul class="facts"><li><span>Capacity</span><strong>${v.pax} guests</strong></li><li><span>Length overall</span><strong>${num(v.length)} m</strong></li><li><span>Beam</span><strong>${num(v.beam)} m</strong></li><li><span>Home / departure</span><strong>${e(v.port)}</strong></li><li><span>Vessel class</span><strong>${e(classify(v))}</strong></li></ul></aside></div></section><section class="section shell--wide"><div class="rate-section"><div><p class="eyebrow">Published charter rates</p><h2 class="display display--section">Price the exact programme, not an assumption.</h2><p class="body-copy">These figures reflect the operator's public listing checked on 12 August 2026. The final quotation controls and may change with season, route, fuel, mooring, catering, tax and vessel-specific conditions.</p></div><div class="rate-card"><table><thead><tr><th>Season / format</th><th>Published rate</th></tr></thead><tbody>${rates}</tbody></table><p class="small">Unless explicitly stated otherwise, current vessel listings are shown excluding 21% VAT.</p></div></div></section><section class="section shell"><div class="detail-grid"><article class="panel"><p class="eyebrow">Core charter setup</p><h2 class="display display--section">What the team coordinates.</h2><ul class="premium-list">${inclusions}</ul></article><article class="panel panel--dark"><p class="eyebrow">Before you book</p><h2 class="display display--section">Date, guests and route determine the right quote.</h2><p class="lead">Send the preferred date, group size, duration and itinerary idea. The team confirms current availability, operating conditions and final price.</p><div class="hero__actions"><a class="btn" data-variant="ghost" href="/contact?boat=${encodeURIComponent(v.slug)}">Request ${e(v.name)}</a></div></article></div></section><section class="section shell"><p class="eyebrow">Common questions</p><h2 class="display display--section">Useful before committing.</h2><div class="faq-stack">${faqHtml}</div></section><section class="section shell"><div class="section-heading"><div><p class="eyebrow">Similar options</p><h2 class="display display--section">Compare nearby choices.</h2></div><a class="btn" data-variant="text" href="/fleet">View all vessels</a></div><div class="related-grid">${related}</div></section></main>${footer()}<script type="module" src="/scripts/site.js"></script><script type="module" src="/scripts/footer.js"></script><script type="module" src="/scripts/platform.js"></script></body></html>`;

  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
};
