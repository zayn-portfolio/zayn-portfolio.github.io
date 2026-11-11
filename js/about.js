CMS.ready(()=>{
// skill percentages count up in time with the bars filling
const po=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const d=parseFloat(e.target.closest('.skill').style.getPropertyValue('--d'))||0;setTimeout(()=>count(e.target),(d+.3)*1000);po.unobserve(e.target)}}),{threshold:.6});
$$('.pct').forEach(p=>po.observe(p));

});
