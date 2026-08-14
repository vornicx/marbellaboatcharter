const qs=(s,r=document)=>r.querySelector(s);const qsa=(s,r=document)=>[...r.querySelectorAll(s)];

const addStylesheet=(href,key)=>{if(document.querySelector(`link[data-${key}]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute(`data-${key}`,'true');document.head.appendChild(link);};
addStylesheet('styles/benchmark-elevation.css','benchmark-elevation');
addStylesheet('styles/real-fleet-media.css','real-fleet-media');

document.title='Marbella Boat Charter | Private Yacht Charter';

const realMedia=[
  {target:'.home5-hero',className:'home5-hero__real-media',src:'https://marbellaboatcharter.com/wp-content/uploads/2022/04/Sunseeker-68-Sport-Yacht-sail.jpg',alt:'Sunseeker 68 Sport Yacht underway off Marbella',eager:true},
  {target:'.home5-intro__media',className:'home5-real-yacht-image',src:'https://marbellaboatcharter.com/wp-content/uploads/2022/04/Sunseeker-68-Sport-Yacht-outside.jpg',alt:'Outdoor deck of the Sunseeker 68 Sport Yacht'},
  {target:'.home5-yacht-card:nth-child(1) .home5-yacht-card__media',className:'home5-real-yacht-image',src:'https://marbellaboatcharter.com/wp-content/uploads/2022/04/Sunseeker-68-Sport-Yacht-sail.jpg',alt:'Sunseeker 68 Sport Yacht in the Mediterranean'},
  {target:'.home5-yacht-card:nth-child(2) .home5-yacht-card__media',className:'home5-real-yacht-image',src:'https://marbellaboatcharter.com/wp-content/uploads/2022/04/Mangusta-80-sun.jpg',alt:'Mangusta 80 yacht underway off Marbella'}
];
realMedia.forEach(item=>{const host=qs(item.target);if(!host||host.querySelector(`.${item.className}`))return;const img=document.createElement('img');img.className=item.className;img.src=item.src;img.alt=item.alt;img.decoding='async';img.loading=item.eager?'eager':'lazy';if(item.eager)img.fetchPriority='high';host.prepend(img);});

qsa('.brand-logo').forEach(link=>{if(!link.getAttribute('aria-label'))link.setAttribute('aria-label','Marbella Boat Charter home');});
qsa('a,button').forEach(control=>{
  const explicit=(control.getAttribute('aria-label')||control.getAttribute('title')||'').trim();
  const text=(control.textContent||'').replace(/\s+/g,' ').trim();
  const imageAlt=control.querySelector('img')?.getAttribute('alt')?.trim()||'';
  if(!explicit&&!text&&!imageAlt){
    if(control.tagName==='A'){
      const href=control.getAttribute('href')||'';
      const label=href.includes('booking')?'Plan a charter':href.includes('contact')?'Contact Marbella Boat Charter':'Open link';
      control.setAttribute('aria-label',label);
    }else{
      control.setAttribute('aria-label','Interactive control');
    }
  }
});

const finder=qs('[data-home5-finder]');
if(finder){
  const durationLabel=qs('select[name="duration"]',finder)?.closest('label');
  if(durationLabel&&!qs('input[name="date"]',finder)){
    const dateLabel=document.createElement('label');
    const now=new Date();
    const localIso=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    dateLabel.innerHTML='<span>Date</span><input type="date" name="date" aria-label="Preferred charter date">';
    const dateInput=qs('input',dateLabel);
    dateInput.min=localIso;
    durationLabel.before(dateLabel);
  }

  const context=document.createElement('div');
  context.className='home5-finder-context';
  context.setAttribute('aria-label','Charter service reassurance');
  context.innerHTML='<span><strong>15+ years local experience</strong>Marbella and Puerto Banús</span><span><strong>Real availability</strong>checked directly by the team</span><span><strong>Qualified skipper</strong>included with charters</span><span><strong>Vessel-specific quote</strong>clear inclusions before confirmation</span>';
  finder.insertAdjacentElement('afterend',context);

  finder.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(finder);
    const params=new URLSearchParams();
    for(const [key,value] of data.entries()){if(value)params.set(key,String(value));}
    location.href=`booking.html?${params.toString()}`;
  });
}

if(!qs('.home5-mobile-cta')){
  const mobileCta=document.createElement('nav');
  mobileCta.className='home5-mobile-cta';
  mobileCta.setAttribute('aria-label','Quick charter actions');
  mobileCta.innerHTML='<a class="home5-mobile-cta__primary" href="booking.html">Plan a charter</a><a class="home5-mobile-cta__secondary" href="https://wa.me/34682252526" target="_blank" rel="noopener">WhatsApp</a>';
  document.body.appendChild(mobileCta);
}

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced){
  document.documentElement.classList.add('home5-motion');
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in');observer.unobserve(entry.target);}})},{threshold:.12,rootMargin:'0px 0px -5%'});
  qsa('.home5-reveal').forEach(el=>observer.observe(el));
  const hero=qs('.home5-hero');
  if(hero&&window.matchMedia('(min-width: 801px)').matches){
    let ticking=false;
    const sync=()=>{const y=Math.min(window.scrollY,700);hero.style.setProperty('--home5-parallax',`${y*.075}px`);ticking=false;};
    window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(sync);ticking=true;}},{passive:true});
  }
}

const visual=qs('[data-home5-experience-visual]');const rows=qsa('[data-home5-experience]');
if(visual&&rows.length){
  const activate=row=>{rows.forEach(item=>item.classList.toggle('is-active',item===row));visual.dataset.scene=row.dataset.scene||'yacht';visual.dataset.caption=row.dataset.caption||'';};
  rows.forEach(row=>{
    const title=qs('h3',row)?.textContent?.trim();
    if(title&&!row.getAttribute('aria-label'))row.setAttribute('aria-label',`Explore ${title}`);
    row.addEventListener('mouseenter',()=>activate(row));
    row.addEventListener('focus',()=>activate(row));
    row.addEventListener('click',()=>{const href=row.dataset.href;if(href)location.href=href;});
  });
  activate(rows[0]);
}
