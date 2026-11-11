CMS.ready(()=>{
const P=window.PROJECTS||[],grid=$('#pgrid'),tabs=$$('.tab'),hl=$('.tab-hl'),lb=$('#lb'),media=$('#lb-media'),x=$('#lb-x');
const label=window.CAT_LABELS||{amazon:'Amazon Listing Image',ugc:'AI UGC Ad',video:'Product Video Ad'};
let cat=tabs[0].dataset.cat,back;
const moveHl=t=>{hl.style.width=t.offsetWidth+'px';hl.style.transform=`translateX(${t.offsetLeft}px)`};
const render=()=>{
 grid.scrollLeft=0;
 const list=P.filter(p=>p.cat===cat);
 if(!list.length){
  grid.innerHTML=`<div class="empty-cat" style="grid-column:1/-1;text-align:center;padding:70px 20px;color:var(--mut,#8a90a4);"><svg style="width:48px;height:48px;margin:0 auto 16px;opacity:.6;display:block;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg><h3 style="margin:0 0 8px;font-size:1.2rem;color:var(--tx,#f4f2ee);">No projects in this category yet</h3><p style="margin:0;font-size:0.95rem;">You can add projects for this category from the Admin Panel.</p></div>`;
  return;
 }
 grid.innerHTML=list.map(p=>`<article class="pcard" tabindex="0" role="button" data-id="${p.id}" aria-label="Open ${SH.esc(p.title)}"><div class="pthumb"><img src="${SH.esc(p.img)}" alt="${SH.esc(p.title)}" loading="lazy">${p.cat==='amazon'?'':'<span class="play"></span>'}</div><div class="pbody"><small>${label[p.cat]||p.cat}</small><h3>${SH.esc(p.title)}</h3><p>${SH.esc(p.desc)}</p></div></article>`).join('');
 [...grid.children].forEach((c,i)=>{c.classList.add('reveal');c.style.setProperty('--d',(i%3)*.12+'s');io.observe(c)});
};
tabs.forEach(t=>t.addEventListener('click',()=>{
 if(t.dataset.cat===cat)return;cat=t.dataset.cat;
 tabs.forEach(b=>{b.classList.toggle('on',b===t);b.setAttribute('aria-selected',b===t)});moveHl(t);
 grid.classList.add('swap');setTimeout(()=>{render();grid.scrollLeft=0;grid.classList.remove('swap')},280)}));
const pPrev=$('#p-prev'),pNext=$('#p-next');
if(pPrev&&pNext){
 pPrev.onclick=()=>grid.scrollBy({left:-Math.min(320,window.innerWidth*0.8),behavior:'smooth'});
 pNext.onclick=()=>grid.scrollBy({left:Math.min(320,window.innerWidth*0.8),behavior:'smooth'});
}
const open=id=>{const p=P.find(q=>q.id===id);back=document.activeElement;
 media.innerHTML=p.video?`<video src="${SH.esc(p.video)}" poster="${SH.esc(p.img)}" controls autoplay playsinline></video>`
  :`<img src="${SH.esc(p.img)}" alt="${SH.esc(p.title)}">`+(p.cat==='amazon'?'':'<span class="bigplay"></span><div class="vnote">Video placeholder. Your video will play here.</div>');
 $('#lb-cat').textContent=label[p.cat];$('#lb-title').textContent=p.title;$('#lb-text').textContent=p.long;
 lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';x.focus()};
const close=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');document.body.style.overflow='';setTimeout(()=>media.innerHTML='',400);back&&back.focus()};
grid.addEventListener('click',e=>{const c=e.target.closest('.pcard');c&&open(c.dataset.id)});
grid.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const c=e.target.closest('.pcard');if(c){e.preventDefault();open(c.dataset.id)}}});
x.onclick=close;lb.addEventListener('click',e=>{if(e.target===lb)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('open'))close()});
render();(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>moveHl($('.tab.on')));
addEventListener('resize',()=>moveHl($('.tab.on')));moveHl(tabs[0]);
});
