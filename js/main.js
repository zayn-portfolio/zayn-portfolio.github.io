const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
document.documentElement.classList.add('js');
// mobile menu
$('.burger')?.addEventListener('click',()=>$('#menu').classList.toggle('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
// counters
const count=el=>{const t=+el.dataset.to,d=+(el.dataset.dec||0),s=el.dataset.suf||'',T=1900,t0=performance.now();
 const f=n=>{const p=Math.min((n-t0)/T,1),v=t*(1-Math.pow(1-p,4));el.textContent=v.toFixed(d)+s;if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
const co=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){count(e.target);co.unobserve(e.target)}}),{threshold:.6});
CMS.ready(()=>{
// staggered scroll reveal
$$('[data-stagger]').forEach(g=>[...g.children].forEach((c,i)=>{c.classList.add('reveal');c.style.setProperty('--d',i*.13+'s')}));
$$('.reveal').forEach(el=>io.observe(el));
$$('.num').forEach(n=>co.observe(n));
// featured work slider on mobile
const wPrev=$('#w-prev'),wNext=$('#w-next'),wGrid=$('.work-grid');
if(wPrev&&wNext&&wGrid){
 wPrev.onclick=()=>wGrid.scrollBy({left:-Math.min(320,window.innerWidth*0.8),behavior:'smooth'});
 wNext.onclick=()=>wGrid.scrollBy({left:Math.min(320,window.innerWidth*0.8),behavior:'smooth'});
}
// testimonial slider
const tr=$('.t-track');
if(tr){const n=tr.children.length,dots=$('.dots');let i=0,timer;
 for(let k=0;k<n;k++){const d=document.createElement('i');d.onclick=()=>go(k,true);dots.append(d)}
 const go=(k,manual)=>{i=(k+n)%n;tr.style.transform=`translateX(-${i*100}%)`;$$('i',dots).forEach((d,x)=>d.classList.toggle('on',x===i));if(manual)start()};
 const start=()=>{clearInterval(timer);timer=setInterval(()=>go(i+1),5500)};
 $('.prev').onclick=()=>go(i-1,true);$('.next').onclick=()=>go(i+1,true);
 $('.t-slider').addEventListener('mouseenter',()=>clearInterval(timer));$('.t-slider').addEventListener('mouseleave',start);
 go(0);start()}
});
