// To receive messages by email, paste a form service URL here (for example a Formspree endpoint).
// While this is empty, the form works in demo mode: it shows the success message but does not send anything.
const FORM_ENDPOINT='';
const f=$('#cform'),ok=$('#ok'),err=$('#err'),btn=$('#send');
f.addEventListener('submit',async e=>{
 e.preventDefault();err.hidden=true;btn.disabled=true;btn.textContent='Sending...';
 const data=new FormData(f),first=(data.get('name')||'').trim().split(' ')[0];
 try{
  if(FORM_ENDPOINT){const r=await fetch(FORM_ENDPOINT,{method:'POST',headers:{Accept:'application/json'},body:data});if(!r.ok)throw new Error('send failed')}
  else await new Promise(r=>setTimeout(r,700));
  f.reset();f.style.display='none';$('#ok-name').textContent=first;ok.classList.add('show');
 }catch(x){err.hidden=false}
 btn.disabled=false;btn.textContent='Send message';
});
$('#again').addEventListener('click',()=>{ok.classList.remove('show');f.style.display='';$('#f-name').focus()});
