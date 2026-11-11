/* Shared by the website and the Admin Panel: color themes, icons, social platforms. */
window.SH=(()=>{
const THEMES=[
 {id:'charcoal-orange',name:'Charcoal Orange',v:{bg:'#17181c',bg2:'#1e2026',card:'#212329',line:'#32353e',tx:'#f4f2ee',mut:'#a1a4ad',dim:'#6d717c',deep:'#101114',or:'#ff6a1a',or2:'#ff8a3d',bl:'#2f7bff',on:'#17110c'}},
 {id:'midnight-blue',name:'Midnight Blue',v:{bg:'#0b1220',bg2:'#0f1a2e',card:'#132038',line:'#243756',tx:'#eaf1ff',mut:'#90a5c8',dim:'#5d7094',deep:'#070d18',or:'#3d8bff',or2:'#6aa8ff',bl:'#22d3ee',on:'#06101f'}},
 {id:'slate-purple',name:'Slate Purple',v:{bg:'#16151f',bg2:'#1d1b29',card:'#242238',line:'#38355a',tx:'#f1effa',mut:'#a6a2c4',dim:'#716d92',deep:'#0f0e16',or:'#a78bfa',or2:'#c4b5fd',bl:'#f472b6',on:'#150f26'}},
 {id:'emerald-dark',name:'Emerald Dark',v:{bg:'#0e1713',bg2:'#13201a',card:'#182a22',line:'#284339',tx:'#ecf7f1',mut:'#93b5a5',dim:'#62806f',deep:'#09100d',or:'#34d399',or2:'#6ee7b7',bl:'#2dd4bf',on:'#06150e'}}
];
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',');
const themeCSS=id=>{const t=THEMES.find(x=>x.id===id)||THEMES[0],v=t.v;
 return ':root{'+Object.keys(v).map(k=>`--${k}:${v[k]}`).join(';')+`;--or-rgb:${rgb(v.or)};--bl-rgb:${rgb(v.bl)};--bg-rgb:${rgb(v.bg)};--bg2-rgb:${rgb(v.bg2)};--deep-rgb:${rgb(v.deep)}}`};
const applyTheme=(id,doc=document)=>{let s=doc.getElementById('cms-theme');if(!s){s=doc.createElement('style');s.id='cms-theme';doc.head.appendChild(s)}s.textContent=themeCSS(id)};
const ICONS={
 phone:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
 cube:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
 video:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/>',
 palette:'<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2-.6-1.2.2-2.5 1.6-2.5H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="M21 16l-5-5-9 9"/>',
 logo:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><circle cx="12" cy="12" r="3"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'
};
const icon=k=>`<svg viewBox="0 0 24 24">${ICONS[k]||ICONS.star}</svg>`;
const SOCIALS=[
 {k:'instagram',n:'Instagram',svg:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>'},
 {k:'youtube',n:'YouTube',svg:'<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>'},
 {k:'linkedin',n:'LinkedIn',svg:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v5M8 8v.01M12 16v-5M12 13c0-3 5-3 5 0v3"/>'},
 {k:'behance',n:'Behance',txt:'Bē'},{k:'fiverr',n:'Fiverr',txt:'Fi'},
 {k:'facebook',n:'Facebook',txt:'f'},{k:'tiktok',n:'TikTok',txt:'Tk'}
];
const WA_SVG='<path d="M3 21l1.6-4.6A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4.2-1.1z"/><path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-.9.7c-1-.4-1.9-1.3-2.3-2.3l.7-.9-1-2z"/>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>{u=String(u||'').trim();return /^(https?:\/\/|mailto:)/i.test(u)?u:(u&&!/^[a-z]+:/i.test(u)&&/\./.test(u)?'https://'+u:'')};
const waLink=n=>{const d=String(n||'').replace(/\D/g,'');return d?'https://wa.me/'+d:''};
return {THEMES,themeCSS,applyTheme,ICONS,icon,SOCIALS,WA_SVG,esc,safeUrl,waLink};
})();
