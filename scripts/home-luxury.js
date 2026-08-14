const qs=(s,r=document)=>r.querySelector(s);const qsa=(s,r=document)=>[...r.querySelectorAll(s)];

const elevationStyles=document.createElement('link');
elevationStyles.rel='stylesheet';
elevationStyles.href='styles/benchmark-elevation.css';
elevationStyles.dataset.benchmarkElevation='true';
document.head.appendChild(elevationStyles);

document.title='Marbella Boat Charter | Private Yacht Charter';

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
