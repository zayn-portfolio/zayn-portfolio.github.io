/* Fills every page from data/content.json (saved by the Admin Panel). If it cannot load, the page keeps its built-in text. */
window.CMS=(()=>{
const {esc,safeUrl,waLink,icon,SOCIALS,WA_SVG}=SH,$=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
let q=[],done=false;
const api={data:null,ready(fn){done?fn():q.push(fn)}};
const finish=()=>{if(done)return;done=true;document.documentElement.classList.remove('cms-wait');q.splice(0).forEach(f=>f())};
const T=(s,v,root)=>{const e=$(s,root);if(e&&v!=null)e.textContent=v};
const img=p=>{p=String(p||'');return /^(javascript|data|vbscript):/i.test(p)?'':esc(p)};
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const cta=(c)=>{const b=$('.cta-box');if(!b||!c)return;T('h2',c.title,b);T('p',c.text,b);T('a.btn',c.btn,b)};
const head=(h)=>{if(h.metaTitle)document.title=h.metaTitle;const m=$('meta[name=description]');if(m&&h.metaDesc)m.content=h.metaDesc};
const socials=(info)=>{
 const out=SOCIALS.map(s=>{const u=safeUrl(info.socials&&info.socials[s.k]);return u?`<a href="${esc(u)}" target="_blank" rel="noopener" aria-label="${s.n}">${s.svg?`<svg viewBox="0 0 24 24">${s.svg}</svg>`:s.txt}</a>`:''});
 const w=waLink(info.whatsapp);if(w)out.push(`<a class="wa" href="${esc(w)}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24">${WA_SVG}</svg></a>`);
 $$('.social').forEach(e=>e.innerHTML=out.join(''));
};
function common(d){
 SH.applyTheme(d.theme);
 const s=d.site;
 $$('.logo').forEach(a=>a.innerHTML=esc(s.brand)+'<span>.</span>');
 T('.nav .btn.sm',s.hireBtn);T('.f-grid > div:first-child p',s.footer);
 T('.copy','\u00A9 '+new Date().getFullYear()+' '+s.copyright+'. All rights reserved.');
 $$('.photo-wrap .frame img').forEach(i=>{i.src=s.profile;i.alt=s.profileAlt});
 socials(d.info);
}
const P={
home(h){
 T('.hero .role',h.role);T('.hero h1',h.title);T('.hero .tag',h.tagline);T('.hero .sub',h.sub);
 const b=$$('.hero .cta-row a');if(b[0])b[0].textContent=h.btn1;if(b[1])b[1].textContent=h.btn2;
 const c=$('.chip');if(c)c.innerHTML=`<b>${esc(h.ratingNum)}</b>${esc(h.ratingLabel)}`;
 $('.stat-grid').innerHTML=h.stats.map(s=>`<div class="stat"><div class="num" data-to="${esc(s.to)}" data-suf="${esc(s.suf)}" data-dec="${esc(s.dec||0)}">0</div><p>${esc(s.label)}</p></div>`).join('');
 T('#services h2',h.svcTitle);T('#services .sec-h p',h.svcSub);
 $('.svc-grid').innerHTML=h.cards.map(x=>`<article class="svc"><div class="ico">${icon(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('');
 T('#work h2',h.workTitle);T('#work .sec-h p',h.workSub);T('#work .more a',h.workBtn);
 $('.work-grid').innerHTML=h.work.map(w=>`<figure class="work"><img src="${img(w.img)}" alt="${esc(w.title)}" loading="lazy"><figcaption>${esc(w.title)}<small>${esc(w.label)}</small></figcaption></figure>`).join('');
 T('#testimonials h2',h.testiTitle);
 $('.t-track').innerHTML=h.testimonials.map(t=>`<article class="t-card"><div class="stars">★★★★★</div><blockquote>${esc(t.quote)}</blockquote><div class="who"><div class="av">${esc(initials(t.name))}</div><div><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div></div></article>`).join('');
 T('.brands h2',h.brandsTitle);
 const br=String(h.brands||'').split(',').map(x=>x.trim()).filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
 $('.m-track').innerHTML=br+br;cta(h.cta);
},
portfolio(p){
 T('.p-head h1',p.title);T('.p-head .sec-h p',p.sub);
 $$('.tab').forEach(t=>t.textContent=p.tabs[t.dataset.cat]);
 window.PROJECTS=p.projects;window.CAT_LABELS=p.labels;cta(p.cta);
},
about(a){
 const st=$('.story');
 st.innerHTML=`<p class="role">${esc(a.role)}</p><h1>${esc(a.title)}</h1>`+a.paras.map(x=>`<p>${esc(x)}</p>`).join('')+`<div class="eq"><span class="pill">${esc(a.pills[0])}</span><em>+</em><span class="pill">${esc(a.pills[1])}</span><em>=</em><span class="pill hot">${esc(a.pills[2])}</span></div>`;
 T('.mission h2',a.missionTitle);T('.mission p',a.mission);
 T('#journey h2',a.journeyTitle);T('#journey .sec-h p',a.journeySub);
 $('.tl').innerHTML=a.journey.map((j,i)=>`<div class="tl-item reveal"><div class="tl-node">${i+1}</div><div class="tl-card">${j.year?`<small>${esc(j.year)}</small>`:''}<h3>${esc(j.title)}</h3><p>${esc(j.text)}</p></div></div>`).join('');
 T('#skills h2',a.skillsTitle);T('#skills .sec-h p',a.skillsSub);
 $('.skills').innerHTML=a.skills.map(s=>{const v=Math.max(0,Math.min(100,+s.pct||0));return `<div class="skill" style="--v:${v}%"><div class="sk-top"><span>${esc(s.name)}</span><b class="pct" data-to="${v}" data-suf="%">0%</b></div><div class="bar"><i class="fill"></i></div></div>`}).join('');
 cta(a.cta);
},
services(s){
 T('.p-head h1',s.title);T('.p-head .sec-h p',s.sub);
 $('.sv-grid').innerHTML=s.items.map(x=>`<article class="sv"><div class="ico">${icon(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="sv-foot"><div class="price"><small>${esc(x.from)}</small><b>${esc(x.price)}</b><span>${esc(x.unit)}</span></div><a class="btn sm" href="contact.html">${esc(x.btn)}</a></div></article>`).join('');
 cta(s.cta);
},
contact(c,d){
 T('.p-head h1',c.title);T('.p-head .sec-h p',c.sub);T('.c-intro',c.formIntro);
 const i=d.info,w=waLink(i.whatsapp);
 $('.c-info').innerHTML=`<h3>${esc(c.emailTitle)}</h3><a class="mail" href="mailto:${esc(i.email)}">${esc(i.email)}</a><p>${esc(c.emailNote)}</p>`+(w?`<h3 class="sp">${esc(c.waTitle)}</h3><a class="wa-line" href="${esc(w)}" target="_blank" rel="noopener">${esc(i.whatsapp)}</a>`:'')+`<h3 class="sp">${esc(c.onlineTitle)}</h3><div class="social"></div>`;
 socials(i);
 const sel=$('#f-type');sel.innerHTML='<option value="" disabled selected>Select a project type</option>'+d.services.items.map(x=>`<option>${esc(x.title)}</option>`).join('')+'<option>Something else</option>';
 const er=$('#err');if(er)er.textContent='Something went wrong and your message was not sent. Please email me directly at '+i.email+'.';
}};
const run=d=>{api.data=d;common(d);head(d[document.body.dataset.page==='contact'?'contactPage':document.body.dataset.page]||{});
 const pg=document.body.dataset.page;if(P[pg])P[pg](pg==='contact'?d.contactPage:d[pg],d);finish()};
fetch('data/content.json?v='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.json()}).then(run).catch(e=>{console.warn('CMS content not loaded, showing built-in text.',e);finish()});
return api;
})();
