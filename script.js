document.addEventListener('DOMContentLoaded',()=>{
// TOPBAR — data dinâmica com dia da semana em português
(function(){
  const dias=['DOMINGO','SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA','QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO'];
  const hoje=new Date();
  const diaSemana=dias[hoje.getDay()];
  const dd=String(hoje.getDate()).padStart(2,'0');
  const mm=String(hoje.getMonth()+1).padStart(2,'0');
  const aaaa=hoje.getFullYear();
  const el=document.getElementById('topbar-oferta');
  if(el)el.textContent=`🔥 OFERTA SOMENTE HOJE — ${diaSemana} ${dd}/${mm}/${aaaa}`;
})();

// UTM PROPAGATION — captura parâmetros de rastreamento e repassa a todos os links de checkout
const _TRACK=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','src','fbclid','gclid','ttclid','sck'];
const _sp=new URLSearchParams(window.location.search);
const _tp=new URLSearchParams();
_TRACK.forEach(k=>{const v=_sp.get(k);if(v)_tp.set(k,v);});
function appendUtms(url){if(!_tp.toString())return url;try{const u=new URL(url);_tp.forEach((v,k)=>u.searchParams.set(k,v));return u.toString();}catch(e){return url;}}
// UTMs propagados via data-checkout e href (plataforma detecta pelo link explícito no DOM)
document.querySelectorAll('[data-checkout]').forEach(el=>{
  const url=appendUtms(el.dataset.checkout);
  el.dataset.checkout=url;
  if(el.tagName==='A')el.href=url;
});

// InitiateCheckout disparado APENAS nos 3 botões autorizados — navegação fica com o <a target="_blank">
function _fireCheckout(){if(typeof window.ltq==='function')window.ltq('track','InitiateCheckout');}
// Botão 1: Plano Completo R$19,90 (página principal)
const btnPlanoCompleto=document.getElementById('btn-plano-completo');
if(btnPlanoCompleto)btnPlanoCompleto.addEventListener('click',()=>{_fireCheckout();});

// COUNTDOWN
const endTime=Date.now()+600000;
const $m=document.getElementById('cd-m');
const $s=document.getElementById('cd-s');
function updateCD(){const d=Math.max(0,endTime-Date.now());if($m)$m.textContent=String(Math.floor(d/60000)).padStart(2,'0');if($s)$s.textContent=String(Math.floor(d%60000/1000)).padStart(2,'0');}
updateCD();setInterval(updateCD,1000);

// STICKY CTA
const stickyCta=document.getElementById('sticky-cta');
const heroSection=document.getElementById('hero');
let stickyShown=false;
function checkSticky(){if(!heroSection||!stickyCta)return;const b=heroSection.getBoundingClientRect().bottom;if(b<0&&!stickyShown){stickyCta.classList.add('visible');stickyShown=true;}else if(b>=0&&stickyShown){stickyCta.classList.remove('visible');stickyShown=false;}}
window.addEventListener('scroll',checkSticky,{passive:true});

// FAQ
document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{const ans=btn.nextElementSibling;const was=btn.classList.contains('active');document.querySelectorAll('.faq-question.active').forEach(q=>{q.classList.remove('active');q.nextElementSibling.classList.remove('open');});if(!was){btn.classList.add('active');ans.classList.add('open');}});});

// FADE-IN
const fadeObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');fadeObs.unobserve(e.target);}});},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>fadeObs.observe(el));

// MODAL
const modal=document.getElementById('modal-upsell');
const btnBasico=document.getElementById('btn-basico');
const modalCloseBtn=document.getElementById('modal-close');
const btnSkip=document.getElementById('btn-skip');
const btnModalYes=document.getElementById('modal-yes');
let _cdInt=null;
function _startModalCD(){
  clearInterval(_cdInt);
  let s=60;
  const el=document.getElementById('modal-cd-timer');
  if(!el)return;
  el.textContent='1:00';
  _cdInt=setInterval(()=>{
    s--;
    if(s<=0){el.textContent='0:00';clearInterval(_cdInt);return;}
    el.textContent='0:'+String(s).padStart(2,'0');
  },1000);
}
if(btnBasico)btnBasico.addEventListener('click',e=>{e.preventDefault();if(modal){modal.classList.add('active');_startModalCD();}});
if(modalCloseBtn)modalCloseBtn.addEventListener('click',()=>{modal.classList.remove('active');clearInterval(_cdInt);});
// Botão 2: Plano Premium R$15,90 (pop-up)
if(btnModalYes)btnModalYes.addEventListener('click',()=>{_fireCheckout();});
// Botão 3: Plano Básico R$10,00 (pop-up)
if(btnSkip)btnSkip.addEventListener('click',()=>{modal.classList.remove('active');clearInterval(_cdInt);_fireCheckout();});
if(modal)modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('active');clearInterval(_cdInt);}});

// LIGHTBOX
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightbox-img');
document.querySelectorAll('.testimonial-card img').forEach(img=>{img.addEventListener('click',()=>{if(lightbox&&lightboxImg){lightboxImg.src=img.src;lightboxImg.alt=img.alt;lightbox.classList.add('active');}});});
if(lightbox)lightbox.addEventListener('click',()=>lightbox.classList.remove('active'));

// TESTIMONIALS MARQUEE — JS-driven, draggable
(function(){
  var track=document.getElementById('testimonials-track');
  if(!track)return;
  var STEP=296,TOTAL=STEP*6,SPEED=65;
  var x=0,raf=null,lastTs=null,resumeTimer=null,hovered=false;

  function applyX(val){x=val;track.style.transform='translateX('+val+'px)';}

  function step(ts){
    if(!lastTs)lastTs=ts;
    var dt=Math.min((ts-lastTs)/1000,0.1);lastTs=ts;
    var nx=x-SPEED*dt;
    if(nx<-TOTAL)nx+=TOTAL;
    applyX(nx);
    raf=requestAnimationFrame(step);
  }

  function play(){
    if(raf)return;
    while(x<-TOTAL)x+=TOTAL;
    lastTs=null;
    raf=requestAnimationFrame(step);
  }

  function pause(){
    if(raf){cancelAnimationFrame(raf);raf=null;}
    lastTs=null;
  }

  function scheduleResume(delay){
    clearTimeout(resumeTimer);
    resumeTimer=setTimeout(function(){if(!hovered)play();},delay||1500);
  }

  // Hover pause (desktop)
  var wrap=track.parentElement;
  if(wrap){
    wrap.addEventListener('mouseenter',function(){hovered=true;clearTimeout(resumeTimer);pause();});
    wrap.addEventListener('mouseleave',function(){hovered=false;scheduleResume(800);});
  }

  // Mouse drag
  track.addEventListener('mousedown',function(e){
    if(e.button!==0)return;
    var sx=e.clientX,sp=x;
    clearTimeout(resumeTimer);pause();
    track.style.cursor='grabbing';
    function move(e){applyX(sp+e.clientX-sx);}
    function up(){
      document.removeEventListener('mousemove',move);
      document.removeEventListener('mouseup',up);
      track.style.cursor='grab';
      scheduleResume();
    }
    document.addEventListener('mousemove',move);
    document.addEventListener('mouseup',up);
  });

  // Touch drag with direction detection
  var tSX,tSY,tSP,tDir;
  track.addEventListener('touchstart',function(e){
    tSX=e.touches[0].clientX;tSY=e.touches[0].clientY;tSP=x;tDir=null;
    clearTimeout(resumeTimer);pause();
  },{passive:true});
  track.addEventListener('touchmove',function(e){
    var dx=e.touches[0].clientX-tSX,dy=e.touches[0].clientY-tSY;
    if(tDir===null){
      if(Math.abs(dx)<5&&Math.abs(dy)<5)return;
      tDir=Math.abs(dx)>=Math.abs(dy)?'h':'v';
      if(tDir==='v'){scheduleResume(800);return;}
    }
    if(tDir!=='h')return;
    e.preventDefault();
    applyX(tSP+dx);
  },{passive:false});
  track.addEventListener('touchend',function(){
    if(tDir==='h')scheduleResume();
  },{passive:true});

  play();
})();

// NON-CRITICAL — deferred to idle time
const idleInit=()=>{
const names=['Ana C.','Mariana L.','Fernanda S.','Camila R.','Patrícia M.','Juliana A.','Carla B.','Renata F.','Luciana T.','Beatriz N.','Simone G.','Vanessa D.','Tatiane O.','Priscila V.','Débora K.','Amanda P.','Cristina H.','Roberta E.','Sandra Q.','Michele J.'];
const cities=['São Paulo','Rio de Janeiro','Belo Horizonte','Curitiba','Salvador','Fortaleza','Recife','Porto Alegre','Goiânia','Manaus','Brasília','Campinas','Guarulhos','Belém','Florianópolis'];
const actions=['acabou de comprar o Plano Completo','garantiu o acesso agora','fez a compra do Plano Completo','acabou de entrar na oferta','comprou o Método Marmitas Congeladas','garantiu o Plano Completo','acabou de liberar o acesso'];
const times=['agora','há 1 min','há 2 min','há 3 min','há 5 min'];
const notifEl=document.getElementById('notif');
const notifText=document.getElementById('notif-text');
const notifTime=document.getElementById('notif-time');
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
function showNotif(){if(!notifEl)return;notifText.innerHTML='<strong>'+pick(names)+'</strong> de '+pick(cities)+' '+pick(actions);notifTime.textContent=pick(times);notifEl.classList.add('show');setTimeout(()=>notifEl.classList.remove('show'),4500);}
setTimeout(showNotif,8000);
setInterval(()=>showNotif(),18000+Math.random()*12000);
const viewersEl=document.getElementById('viewers-count');
if(viewersEl){let c=47+Math.floor(Math.random()*30);viewersEl.textContent=c;setInterval(()=>{c+=Math.floor(Math.random()*5)-2;if(c<30)c=30+Math.floor(Math.random()*10);if(c>120)c=80+Math.floor(Math.random()*15);viewersEl.textContent=c;},5000);}
};
if('requestIdleCallback' in window)requestIdleCallback(idleInit,{timeout:2000});
else setTimeout(idleInit,1000);
});
