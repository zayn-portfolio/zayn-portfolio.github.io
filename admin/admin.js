(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)],{esc}=SH;
let D=null,csrf='',dirty=false,sec='dash',OPEN=new Set(),meta={isDefault:false,maxUpload:0},pick=null;
const PH='assets/img/placeholder.svg';
const api=async(a,body,isForm)=>{
 if(window.location.protocol==='file:'){
  return {ok:false,error:'Admin panel requires a PHP server and cannot run directly from file://. Double-click "start-admin.bat" in the project folder or upload to your hosting.'};
 }
 try{const r=await fetch('api.php?action='+a,{method:body?'POST':'GET',credentials:'same-origin',headers:{'X-CSRF-Token':csrf,...(body&&!isForm?{'Content-Type':'application/json'}:{})},body:body?(isForm?body:JSON.stringify(body)):undefined});
  let j;try{j=await r.json()}catch(e){j={ok:false,error:'The server did not answer correctly. Make sure PHP is enabled on your hosting and all files were uploaded.'}}
  if(r.status===401&&j.auth===false&&D){toast('Your session ended. Please log in again.',1);D=null;showLogin()}return j}
 catch(e){return {ok:false,error:'Could not reach the server. Make sure your PHP server is running.'}}};
const toast=(m,err)=>{const t=$('#toast');t.textContent=m;t.className='show'+(err?' err':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',err?5000:2600)};
const ap=p=>/^(https?:)?\/\//i.test(p||'')?p:'../'+(p||PH);
const gp=p=>p.split('.').reduce((o,k)=>o==null?o:o[k],D);
const sp=(p,v)=>{const k=p.split('.'),l=k.pop();k.reduce((o,x)=>o[x],D)[l]=v};
const setDirty=d=>{dirty=d;const s=$('#state');s.className='state '+(d?'dirty':'ok');s.textContent=d?'Unsaved changes':'All changes saved'};
/* ---------- field builders ---------- */
const F={
 t:(p,l,o={})=>`<label class="f ${o.w||''}"><span>${l}</span>${o.area?`<textarea rows="${o.rows||3}" data-p="${p}">${esc(gp(p))}</textarea>`:`<input type="${o.type||'text'}" ${o.type==='number'?'step="any"':''} data-p="${p}" value="${esc(gp(p))}" placeholder="${esc(o.ph||'')}">`}${o.hint?`<em>${o.hint}</em>`:''}</label>`,
 sel:(p,l,opts,o={})=>`<label class="f ${o.w||''}"><span>${l}</span><select data-p="${p}">${opts.map(([v,n])=>`<option value="${esc(v)}" ${gp(p)===v?'selected':''}>${esc(n)}</option>`).join('')}</select></label>`,
 img:(p,l,hint='')=>`<div class="f imgf"><span>${l}</span><div class="imgrow"><img data-prev="${p}" src="${esc(ap(gp(p)))}" alt=""><div><input data-p="${p}" value="${esc(gp(p))}"><button class="btn" data-act="pick" data-kind="image" data-p="${p}">Upload new image</button><em style="display:block;font-size:.8rem;color:#7a8099;margin-top:6px">${hint||'JPG, PNG or WEBP. Big photos are shrunk automatically.'}</em></div></div></div>`,
 vid:(p,l)=>`<div class="f wide"><span>${l}</span><input data-p="${p}" value="${esc(gp(p))}" placeholder="Leave empty to show a play-button preview only"><button class="btn" style="margin-top:8px" data-act="pick" data-kind="video" data-p="${p}">Upload video (MP4 / WEBM)</button><em>Or paste a link / file path. Your hosting allows about ${meta.maxUpload?Math.floor(meta.maxUpload/1048576)+' MB':'a limited size'} per upload.</em></div>`
};
const ICONS=Object.keys(SH.ICONS).map(k=>[k,k[0].toUpperCase()+k.slice(1)]);
const card=(t,s,body)=>`<section class="card"><h3>${t}</h3>${s?`<p class="sub">${s}</p>`:''}${body}</section>`;
const grid=b=>`<div class="grid">${b}</div>`;
const head=(t,d)=>`<div class="pagehead"><h1>${t}</h1><p>${d}</p></div>`;
const seo=pg=>`<section class="card"><details class="seo"><summary>Browser tab title &amp; Google description</summary><div style="margin-top:14px">${F.t(pg+'.metaTitle','Page title (shown on the browser tab and Google)')}${F.t(pg+'.metaDesc','Short description for Google',{area:1,rows:2})}</div></details></section>`;
const cta=pg=>card('Call-to-action box (bottom of page)','The colored box near the bottom with a button.',grid(F.t(pg+'.cta.title','Heading',{w:'wide'})+F.t(pg+'.cta.text','Text',{area:1,w:'wide'})+F.t(pg+'.cta.btn','Button text')));
const L=(p,title,item,n,sum)=>{const a=gp(p);return a.map((x,i)=>{const bp=`${p}.${i}`;return `<details class="it" data-k="${bp}" ${OPEN.has(bp)?'open':''}><summary>${sum?sum(x,bp,i):`<b>${title} ${i+1}</b>`}<span class="ctl"><button data-act="up" data-p="${p}" data-i="${i}" title="Move up">&uarr;</button><button data-act="dn" data-p="${p}" data-i="${i}" title="Move down">&darr;</button><button class="x" data-act="del" data-p="${p}" data-i="${i}" title="Remove">&#10005;</button></span></summary>${grid(item(bp,x,i))}</details>`}).join('')+`<button class="btn add" data-act="add" data-p="${p}" data-n="${n}">+ Add ${title}</button>`};
const NEW={
 stat:()=>({to:0,suf:'+',dec:'0',label:'New number'}),
 card:()=>({icon:'star',title:'New item',text:'Short description.'}),
 work:()=>({img:PH,title:'New project',label:'Ad'}),
 testi:()=>({quote:'',name:'Client name',role:'Role, Company'}),
 proj:()=>({id:'p'+Date.now().toString(36),cat:'amazon',title:'New project',desc:'',long:'',img:PH,video:''}),
 para:()=>'',journey:()=>({year:'',title:'New milestone',text:''}),skill:()=>({name:'New skill',pct:80}),
 svc:()=>({icon:'star',title:'New service',text:'Describe this service.',from:'Starting at',price:'$0',unit:'per project',btn:'Get started'})
};
/* ---------- sections ---------- */
const NAV=[['dash','&#127968;','Dashboard'],['h1','Pages'],['home','&#127776;','Home Page'],['portfolio','&#128188;','Portfolio Page'],['about','&#128100;','About Page'],['services','&#128176;','Services &amp; Prices'],['contact','&#9993;','Contact &amp; Social'],['h2','Site'],['sitewide','&#127991;','Logo &amp; Footer'],['images','&#128247;','All Images'],['theme','&#127912;','Color Theme'],['security','&#128274;','Password &amp; Security']];
const catOpts=()=>Object.entries(D.portfolio.tabs).map(([k,v])=>[k,v]);
const S={
dash:()=>{const p=D.portfolio.projects,pr=D.services.items.map(s=>s.price).join(' · ');
 const T=[['home','&#127776;','Home Page','Hero text, stats, featured work, testimonials'],['portfolio','&#128188;','Portfolio Page',p.length+' projects'],['about','&#128100;','About Page','Story, journey, skills'],['services','&#128176;','Services &amp; Prices',D.services.items.length+' services · '+esc(pr)],['contact','&#9993;','Contact &amp; Social','Email, WhatsApp, social links'],['sitewide','&#127991;','Logo &amp; Footer','Brand name, footer text'],['images','&#128247;','All Images','Profile photo and every thumbnail'],['theme','&#127912;','Color Theme','Now: '+esc((SH.THEMES.find(t=>t.id===D.theme)||SH.THEMES[0]).name)],['security','&#128274;','Password &amp; Security','Change your login']];
 return head('Welcome back','Pick what you want to edit. Nothing goes live until you press <b>Save changes</b> (top right).')+
 (meta.isDefault?`<div class="warn"><b>&#9888; You are still using the default password (Admin@123). Please change it now, before your website goes live.</b><button class="btn pri" data-act="go" data-s="security">Change password</button></div>`:'')+
 `<div class="dash">${T.map(t=>`<button class="tile" data-act="go" data-s="${t[0]}"><div class="ic">${t[1]}</div><b>${t[2]}</b><span>${t[3]}</span></button>`).join('')}</div>`},
home:()=>{const h='home';
 return head('Home Page','Everything on your front page, from top to bottom.')+
 card('Top section (hero)','The first thing visitors see.',grid(F.t(h+'.role','Small line above name')+F.t(h+'.title','Main heading (your name)')+F.t(h+'.tagline','Tagline',{w:'wide'})+F.t(h+'.sub','Paragraph under tagline',{area:1,w:'wide'})+F.t(h+'.btn1','First button text')+F.t(h+'.btn2','Second button text')+F.t(h+'.ratingNum','Rating badge number')+F.t(h+'.ratingLabel','Rating badge label')+F.img('site.profile','Your profile photo','Used on the Home page and the About page. Portrait photos (4:5) look best.')))+
 card('Numbers strip','The animated counters (projects, clients, years, rating).',L(h+'.stats','Number',(b)=>F.t(b+'.to','Number',{type:'number'})+F.t(b+'.suf','Symbol after number (+, %, or empty)')+F.t(b+'.dec','Decimal places (0 or 1)')+F.t(b+'.label','Label'),'stat',(x,b)=>`<b data-live="${b}.label">${esc(x.label)}</b>`))+
 card('"What I can make" section','Short cards about what you offer (prices live in Services &amp; Prices).',grid(F.t(h+'.svcTitle','Section heading')+F.t(h+'.svcSub','Sub-heading'))+L(h+'.cards','Card',(b)=>F.sel(b+'.icon','Icon',ICONS)+F.t(b+'.title','Title')+F.t(b+'.text','Text',{area:1,w:'wide'}),'card',(x,b)=>`<b data-live="${b}.title">${esc(x.title)}</b>`))+
 card('Featured work (home page thumbnails)','The grid of recent work on the home page. Upload a thumbnail for each.',grid(F.t(h+'.workTitle','Section heading')+F.t(h+'.workSub','Sub-heading')+F.t(h+'.workBtn','Button text'))+L(h+'.work','Featured project',(b)=>F.t(b+'.title','Title')+F.t(b+'.label','Small label (e.g. UGC ad)')+F.img(b+'.img','Thumbnail','Wide images (16:10) look best.'),'work',(x,b)=>`<img class="th" data-prev="${b}.img" src="${esc(ap(x.img))}" alt=""><b data-live="${b}.title">${esc(x.title)}</b>`))+
 card('Testimonials','Client quotes in the slider.',F.t(h+'.testiTitle','Section heading')+L(h+'.testimonials','Testimonial',(b)=>F.t(b+'.quote','Quote',{area:1,w:'wide'})+F.t(b+'.name','Client name')+F.t(b+'.role','Role and company'),'testi',(x,b)=>`<b data-live="${b}.name">${esc(x.name)}</b>`))+
 card('Brands I have worked with','',F.t(h+'.brandsTitle','Section heading')+F.t(h+'.brands','Brand names',{area:1,hint:'Separate names with commas.'}))+cta(h)+seo(h)},
portfolio:()=>{const p='portfolio';
 return head('Portfolio Page','Text, categories and every project.')+
 card('Page heading','',grid(F.t(p+'.title','Heading')+F.t(p+'.sub','Intro text',{area:1,w:'wide'})))+
 card('Category names','Tab names at the top, and the small label shown on each project.',grid(['amazon','ugc','video'].map(k=>F.t(p+'.tabs.'+k,'Tab name ('+k+')')+F.t(p+'.labels.'+k,'Card label ('+k+')')).join('')))+
 card('Projects','Click a project to open it. Add or remove projects any time.',L(p+'.projects','Project',(b)=>F.t(b+'.title','Title')+F.sel(b+'.cat','Category',catOpts())+F.t(b+'.desc','Short description (on the card)',{area:1,w:'wide'})+F.t(b+'.long','Long description (when opened)',{area:1,rows:4,w:'wide'})+F.img(b+'.img','Thumbnail / main image')+F.vid(b+'.video','Video'),'proj',(x,b)=>`<img class="th" data-prev="${b}.img" src="${esc(ap(x.img))}" alt=""><b data-live="${b}.title">${esc(x.title)}</b><i class="badge">${esc(D.portfolio.tabs[x.cat]||x.cat)}</i>`))+cta(p)+seo(p)},
about:()=>{const a='about';
 return head('About Page','Your story, journey and skills.')+
 card('Your story','',grid(F.t(a+'.role','Small line above heading')+F.t(a+'.title','Heading')+F.img('site.profile','Your profile photo','Same photo as on the Home page.'))+L(a+'.paras','Paragraph',(b)=>F.t(b,'Text',{area:1,rows:4,w:'wide'}),'para',(x,b,i)=>`<b>Paragraph ${i+1}</b>`)+grid(F.t(a+'.pills.0','Pill 1')+F.t(a+'.pills.1','Pill 2')+F.t(a+'.pills.2','Pill 3 (highlighted result)')))+
 card('Mission','',grid(F.t(a+'.missionTitle','Heading')+F.t(a+'.mission','Text',{area:1,w:'wide'})))+
 card('Journey timeline','',grid(F.t(a+'.journeyTitle','Heading')+F.t(a+'.journeySub','Sub-heading'))+L(a+'.journey','Milestone',(b)=>F.t(b+'.title','Title')+F.t(b+'.year','Year (optional)')+F.t(b+'.text','Text',{area:1,w:'wide'}),'journey',(x,b)=>`<b data-live="${b}.title">${esc(x.title)}</b>`))+
 card('Core skills','',grid(F.t(a+'.skillsTitle','Heading')+F.t(a+'.skillsSub','Sub-heading'))+L(a+'.skills','Skill',(b)=>F.t(b+'.name','Skill name')+F.t(b+'.pct','Level (0 to 100)',{type:'number'}),'skill',(x,b)=>`<b data-live="${b}.name">${esc(x.name)}</b>`))+cta(a)+seo(a)},
services:()=>{const s='services';
 return head('Services &amp; Prices','Add, remove and re-price your services at any time.')+
 card('Page heading','',grid(F.t(s+'.title','Heading')+F.t(s+'.sub','Intro text',{area:1,w:'wide'})))+
 card('Your services','Each service shows its own price. The Contact form &ldquo;Project type&rdquo; list updates automatically.',L(s+'.items','Service',(b)=>F.t(b+'.title','Service name')+F.sel(b+'.icon','Icon',ICONS)+F.t(b+'.text','Description',{area:1,w:'wide'})+F.t(b+'.from','Small text above price')+F.t(b+'.price','Price',{hint:'Type it exactly as shown, e.g. $30 or $30 - $50'})+F.t(b+'.unit','Text after price (e.g. per video)')+F.t(b+'.btn','Button text'),'svc',(x,b)=>`<b data-live="${b}.title">${esc(x.title)}</b><i class="badge" data-live="${b}.price">${esc(x.price)}</i>`))+cta(s)+seo(s)},
contact:()=>{const i='info',c='contactPage';
 return head('Contact &amp; Social','Where clients can reach you.')+
 card('Contact details','',grid(F.t(i+'.email','Contact email',{type:'email'})+F.t(i+'.whatsapp','WhatsApp number',{ph:'+8801XXXXXXXXX',hint:'Include country code. Leave empty to hide WhatsApp.'})))+
 card('Social media links','Paste the full link. Leave a box empty to hide that icon everywhere.',grid(SH.SOCIALS.map(s=>F.t(i+'.socials.'+s.k,s.n,{ph:'https://'})).join('')))+
 card('Contact page text','',grid(F.t(c+'.title','Heading')+F.t(c+'.sub','Intro text')+F.t(c+'.emailTitle','&ldquo;Email&rdquo; title')+F.t(c+'.emailNote','Note under email')+F.t(c+'.waTitle','&ldquo;WhatsApp&rdquo; title')+F.t(c+'.onlineTitle','&ldquo;Find me online&rdquo; title')+F.t(c+'.formIntro','Text above the form',{area:1,w:'wide'})))+seo(c)},
sitewide:()=>head('Logo &amp; Footer','Shown on every page.')+card('Site-wide text','',grid(F.t('site.brand','Logo text',{hint:'A dot is added automatically after it.'})+F.t('site.hireBtn','Top-right button text')+F.t('site.footer','Footer description',{area:1,w:'wide'})+F.t('site.copyright','Copyright name',{w:'wide'}))),
images:()=>{const g=(t,items)=>`<h3 style="margin:18px 0 10px">${t}</h3><div class="imgs">${items.map(([p,l])=>`<div class="ic2"><img data-prev="${p}" src="${esc(ap(gp(p)))}" alt=""><div><b>${esc(l)}</b><button class="btn" data-act="pick" data-kind="image" data-p="${p}">Replace image</button></div></div>`).join('')}</div>`;
 const P=D.portfolio.projects;
 return head('All Images','Every image on your website in one place. Replace any image, then press <b>Save changes</b>.')+
 g('Profile photo (Home + About)',[['site.profile','Profile photo']])+g('Home page: featured work',D.home.work.map((w,i)=>[`home.work.${i}.img`,w.title]))+
 ['amazon','ugc','video'].map(k=>g('Portfolio: '+D.portfolio.tabs[k],P.map((x,i)=>[x,i]).filter(([x])=>x.cat===k).map(([x,i])=>[`portfolio.projects.${i}.img`,x.title]))).join('')},
theme:()=>head('Color Theme','Pick a theme. It is applied to <b>every page of your live website</b> immediately.')+`<div class="themes">${SH.THEMES.map(t=>`<button class="th2 ${D.theme===t.id?'on':''}" data-act="theme" data-id="${t.id}"><div class="pv" style="background:${t.v.bg}"><i style="height:16px;width:60%;background:${t.v.or}"></i><i style="height:34px;background:${t.v.card};border:1px solid ${t.v.line}"></i><i style="height:10px;width:80%;background:${t.v.mut};opacity:.5"></i><i style="height:12px;width:35%;background:${t.v.bl}"></i></div><div class="lab"><span>${t.name}</span><span>${D.theme===t.id?'&#10003; Active':'Apply'}</span></div></button>`).join('')}</div>`,
security:()=>head('Password &amp; Security','Change your login details.')+(meta.isDefault?`<div class="warn"><b>&#9888; You are still using the default login (admin / Admin@123). Change it below before going live.</b></div>`:'')+card('Change username &amp; password','Use at least 8 characters. You will stay logged in.',`<div style="max-width:420px"><label class="f"><span>Current password</span><input id="pw0" type="password" autocomplete="current-password"></label><label class="f"><span>New username</span><input id="pwu" value="${esc($('#app').dataset.user||'admin')}" autocomplete="username"></label><label class="f"><span>New password</span><input id="pw1" type="password" autocomplete="new-password"></label><label class="f"><span>Repeat new password</span><input id="pw2" type="password" autocomplete="new-password"></label><button class="btn pri" data-act="pw">Save new password</button></div>`)
};
/* ---------- render & events ---------- */
const render=()=>{const y=window.scrollY;$('#main').innerHTML=S[sec]();$('#ttl').innerHTML=(NAV.find(n=>n[0]===sec)||[])[2]||'';
 $('#nav').innerHTML=NAV.map(n=>n.length===2?`<h6>${n[1]}</h6>`:`<button data-act="go" data-s="${n[0]}" class="${n[0]===sec?'on':''}"><span>${n[1]}</span>${n[2]}</button>`).join('');window.scrollTo(0,y)};
const go=s=>{sec=s;OPEN=new Set();$('#side').classList.remove('open');render();window.scrollTo(0,0)};
const save=async()=>{const b=$('#save');b.disabled=true;b.textContent='Saving...';const r=await api('save',D);b.disabled=false;b.textContent='Save changes';
 if(r.ok){setDirty(false);toast('Saved. Your live website is updated.');return true}toast(r.error||'Save failed',1);return false};
document.addEventListener('input',e=>{const el=e.target;if(!el.dataset.p)return;let v=el.value;if(el.type==='number')v=v===''?0:+v;sp(el.dataset.p,v);setDirty(true);
 $$(`[data-live="${el.dataset.p}"]`).forEach(n=>n.textContent=v);$$(`[data-prev="${el.dataset.p}"]`).forEach(n=>n.src=ap(v));
 if(el.tagName==='SELECT'&&el.dataset.p.endsWith('.cat'))render()});
document.addEventListener('toggle',e=>{const k=e.target.dataset&&e.target.dataset.k;if(k)e.target.open?OPEN.add(k):OPEN.delete(k)},true);
const prep=async f=>{if(f.type==='image/gif'||!f.type.startsWith('image/'))return f;
 try{const bm=await createImageBitmap(f),m=1800,s=Math.min(1,m/Math.max(bm.width,bm.height));if(s===1&&f.size<900000)return f;
  const c=document.createElement('canvas');c.width=Math.round(bm.width*s);c.height=Math.round(bm.height*s);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);
  const b=await new Promise(r=>c.toBlob(r,'image/webp',.88));if(b&&b.type==='image/webp'&&b.size<f.size)return new File([b],'image.webp',{type:'image/webp'});return f}catch(e){return f}};
$('#filepick').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f||!pick)return;const {p,kind}=pick;
 toast(kind==='video'?'Uploading video... please wait':'Uploading image...');
 const file=kind==='video'?f:await prep(f),fd=new FormData();fd.append('file',file,file.name);const r=await api('upload',fd,true);
 if(r.ok){sp(p,r.path);setDirty(true);render();toast('Uploaded. Press "Save changes" to publish it.')}else toast(r.error||'Upload failed',1)});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-act]');if(!b)return;if(b.closest('summary'))e.preventDefault();const a=b.dataset.act,p=b.dataset.p,i=+b.dataset.i;
 if(a==='go')return go(b.dataset.s);
 if(a==='pick'){pick={p,kind:b.dataset.kind};const fp=$('#filepick');fp.accept=b.dataset.kind==='video'?'video/mp4,video/webm':'image/*';return fp.click()}
 if(a==='add'){const arr=gp(p);arr.push(NEW[b.dataset.n]());OPEN=new Set([p+'.'+(arr.length-1)]);setDirty(true);return render()}
 if(a==='del'){if(!confirm('Remove this item? (You can still undo by reloading before you save.)'))return;gp(p).splice(i,1);OPEN=new Set();setDirty(true);return render()}
 if(a==='up'||a==='dn'){const arr=gp(p),j=a==='up'?i-1:i+1;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];OPEN=new Set([p+'.'+j]);setDirty(true);return render()}
 if(a==='theme'){D.theme=b.dataset.id;SH.applyTheme(D.theme,document);render();return void(await save()&&toast('Theme applied to every page of your live website.'))}
 if(a==='pw'){const c=$('#pw0').value,u=$('#pwu').value,n=$('#pw1').value;if(n!==$('#pw2').value)return toast('The two new passwords do not match.',1);
  b.disabled=true;const r=await api('password',{current:c,newUser:u,newPass:n});b.disabled=false;
  if(r.ok){csrf=r.csrf;meta.isDefault=false;$('#app').dataset.user=r.user;toast('Password changed. Use the new login next time.');render()}else toast(r.error,1)}});
$('#save').onclick=save;$('#burger').onclick=()=>$('#side').classList.toggle('open');
$('#out').onclick=async()=>{if(dirty&&!confirm('You have unsaved changes. Log out anyway?'))return;await api('logout',{});D=null;setDirty(false);showLogin()};
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'&&D){e.preventDefault();save()}});
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
/* ---------- login / boot ---------- */
const showLogin=()=>{$('#app').hidden=true;$('#login').hidden=false;$('#lp').value='';setTimeout(()=>$('#lu').focus(),50)};
const start=async user=>{const r=await fetch('../data/content.json?v='+Date.now(),{cache:'no-store'}).then(x=>x.json()).catch(()=>null);
 if(!r){toast('Could not load data/content.json. Make sure the "data" folder was uploaded.',1);return showLogin()}
 D=r;$('#app').dataset.user=user||'admin';$('#login').hidden=true;$('#app').hidden=false;setDirty(false);sec='dash';render()};
$('#lform').addEventListener('submit',async e=>{e.preventDefault();const b=$('#lbtn'),er=$('#lerr');er.hidden=true;b.disabled=true;b.textContent='Checking...';
 const r=await api('login',{user:$('#lu').value.trim(),pass:$('#lp').value});b.disabled=false;b.textContent='Log in';
 if(r.ok){csrf=r.csrf;meta.isDefault=r.isDefault;start(r.user)}else{er.textContent=r.error;er.hidden=false}});
(async()=>{const r=await api('status');if(!r.ok){$('#login').hidden=false;$('#lerr').textContent=r.error;$('#lerr').hidden=false;return}
 csrf=r.csrf;meta.isDefault=r.isDefault;meta.maxUpload=r.maxUpload;if(r.loggedIn)start(r.user);else showLogin()})();
})();
