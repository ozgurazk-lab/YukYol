/* Motion and app-feel layer: page transitions, staggered content, count-ups, toasts, splash. */
(function(){
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

 // Splash on a cold open (once per tab session)
 let fresh=false;try{fresh=!sessionStorage.getItem('sv_splash');sessionStorage.setItem('sv_splash','1')}catch(e){}
 if(fresh&&!reduce){
  const s=document.createElement('div');s.id='mSplash';s.innerHTML='<img src="assets/logo.svg" alt="Sevkio"><i></i>';document.body.appendChild(s);
  const t0=Date.now(),hide=()=>{setTimeout(()=>{s.classList.add('gone');setTimeout(()=>s.remove(),500)},Math.max(0,700-(Date.now()-t0)))};
  if(document.readyState==='complete')hide();else addEventListener('load',hide);setTimeout(hide,2500);
 }

 // Toasts instead of browser alert boxes
 let toastEl,toastTimer;
 window.toast=function(msg){
  if(!toastEl){toastEl=document.createElement('div');toastEl.className='m-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.textContent=String(msg);toastEl.classList.remove('show');void toastEl.offsetWidth;toastEl.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),Math.min(6000,2200+String(msg).length*45));
 };
 window.alert=window.toast;

 if(reduce)return;

 const STAGGER='.title,.hero,.stats>.stat,.driver-status,.driver-simple-card,.card,.driver-actions>.btn,.driver-tools>.btn,.visual-link,.support-btn,.nextload,.item,.group-title';
 function stagger(root){
  if(!root)return;
  const els=[...root.querySelectorAll(STAGGER)].filter(el=>{const up=el.parentElement&&el.parentElement.closest(STAGGER);return !up||!root.contains(up)}).slice(0,28);
  els.forEach(el=>el.classList.remove('m-in'));void root.offsetWidth;
  els.forEach((el,i)=>{el.style.setProperty('--i',i);el.classList.add('m-in')});
 }

 // Count numbers up when a page opens
 function countUp(root){
  root.querySelectorAll('.stat b,.kpi b,.profile-rating span').forEach(el=>{
   const final=el.textContent.trim(),m=final.match(/^([^\d]*)([\d.,]+)(.*)$/);if(!m)return;
   const raw=m[2],isDec=/,\d+$/.test(raw),num=parseFloat(raw.replace(/\./g,'').replace(',','.'));if(!isFinite(num)||num===0)return;
   const dp=isDec?raw.split(',')[1].length:0,fmt=v=>m[1]+v.toLocaleString('tr-TR',{minimumFractionDigits:dp,maximumFractionDigits:dp})+m[3];
   const dur=Math.min(1100,500+num.toString().length*90),t0=performance.now();let last=null;
   const step=now=>{if(last!==null&&el.textContent!==last)return; // re-rendered meanwhile: stop
    const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);last=p<1?fmt(num*e):final;el.textContent=last;if(p<1)requestAnimationFrame(step)};
   requestAnimationFrame(step);
  });
 }

 // Pulsing dot on live chips
 function live(root){root.querySelectorAll('.chip,.gps').forEach(c=>{const t=c.textContent.trim();c.classList.toggle('m-live',/^(Canlı|Yolda|GPS)/.test(t))})}

 // Keep the driver tab bar in step when a page is opened from elsewhere
 function syncTabs(id){const btns=[...document.querySelectorAll('.driver-bottom button')],hit=btns.find(b=>(b.getAttribute('onclick')||'').includes("'"+id+"'"));if(hit)btns.forEach(b=>b.classList.toggle('active',b===hit))}

 function animatePage(id){const el=document.getElementById(id);if(!el)return;stagger(el);countUp(el);live(el)}

 if(typeof window.go==='function'){
  const baseGo=window.go;
  window.go=function(id){const r=baseGo.apply(this,arguments);const a=document.querySelector('.section.active');if(a){animatePage(a.id);syncTabs(a.id)}return r};
 }

 // Fade the login screen away instead of cutting
 if(typeof window.setAuthGate==='function'){
  const baseGate=window.setAuthGate;
  window.setAuthGate=function(show){
   const g=document.getElementById('authGate');
   if(!show&&g&&getComputedStyle(g).display!=='none'){
    baseGate(false);g.style.display='';g.classList.add('m-leave');
    setTimeout(()=>{g.classList.remove('m-leave');if(!document.documentElement.classList.contains('auth-open'))g.style.display='none'},380);return;
   }
   g&&g.classList.remove('m-leave');return baseGate(show);
  };
 }

 // Drawer items stagger
 document.querySelectorAll('.nav button').forEach((b,i)=>b.style.setProperty('--i',i));

 // Light haptic tick on big driver buttons (Android; ignored elsewhere)
 document.addEventListener('click',e=>{if(e.target.closest('.driver-big-btn,.driver-bottom button')&&navigator.vibrate)try{navigator.vibrate(8)}catch(_){}},{passive:true});

 const first=document.querySelector('.section.active');if(first)animatePage(first.id);
})();
