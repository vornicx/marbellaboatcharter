const qs=(s,r=document)=>r.querySelector(s);const qsa=(s,r=document)=>[...r.querySelectorAll(s)];

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced){document.documentElement.classList.add('home5-motion');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in');observer.unobserve(entry.target);}})},{threshold:.12,rootMargin:'0px 0px -5%'});qsa('.home5-reveal').forEach(el=>observer.observe(el));
  const hero=qs('.home5-hero');if(hero&&window.matchMedia('(min-width: 801px)').matches){let ticking=false;const sync=()=>{const y=Math.min(window.scrollY,700);hero.style.setProperty('--home5-parallax',`${y*.075}px`);ticking=false;};window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(sync);ticking=true;}},{passive:true});}}

const finder=qs('[data-home5-finder]');if(finder){finder.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(finder);const params=new URLSearchParams();for(const [key,value] of data.entries()){if(value)params.set(key,String(value));}location.href=`booking.html?${params.toString()}`;});}

const visual=qs('[data-home5-experience-visual]');const rows=qsa('[data-home5-experience]');if(visual&&rows.length){const activate=row=>{rows.forEach(item=>item.classList.toggle('is-active',item===row));visual.dataset.scene=row.dataset.scene||'yacht';visual.dataset.caption=row.dataset.caption||'';};rows.forEach(row=>{row.addEventListener('mouseenter',()=>activate(row));row.addEventListener('focus',()=>activate(row));row.addEventListener('click',()=>{const href=row.dataset.href;if(href)location.href=href;});});activate(rows[0]);}
