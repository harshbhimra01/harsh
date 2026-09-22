/* HARSH BHIMRA v4 — award-level interactions · light only · fast */
(function(){
"use strict";
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = window.matchMedia('(pointer: fine)').matches;
var $ = function(s,c){ return (c||document).querySelector(s); };
var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

/* boot */
var boot=$('#boot'), bf=$('#boot-fill');
function hideBoot(){ if(boot) boot.classList.add('done'); }
if(reduce){ hideBoot(); }
else{ var p=0; var bi=setInterval(function(){ p+=34; if(bf) bf.style.width=Math.min(p,100)+'%'; if(p>=100){clearInterval(bi); hideBoot();} },105); setTimeout(hideBoot,1450); }

/* year + clocks */
$('#year').textContent=new Date().getFullYear();
var istFmt=null;
try{ istFmt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'}); }catch(e){}
function tickClock(){ var el=$('#ist-clock'); if(!el) return; try{ el.textContent=(istFmt?istFmt.format(new Date()):new Date().toLocaleTimeString())+' IST'; }catch(e){} }
tickClock(); setInterval(tickClock,15000);
var t0=Date.now();
setInterval(function(){ var s=Math.floor((Date.now()-t0)/1000),u=$('#uptime'); if(u) u.textContent='UP '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); },1000);

/* cursor dot */
var cursor=$('#cursor');
if(cursor && fine && !reduce){
  var cx=0,cy=0,tx=0,ty=0;
  window.addEventListener('pointermove',function(e){ tx=e.clientX; ty=e.clientY; cursor.classList.add('on'); },{passive:true});
  (function loop(){ cx+=(tx-cx)*.22; cy+=(ty-cy)*.22; cursor.style.left=cx+'px'; cursor.style.top=cy+'px'; requestAnimationFrame(loop); })();
  document.addEventListener('pointerleave',function(){ cursor.classList.remove('on'); });
  $$('a,button,.line,.case').forEach(function(el){
    el.addEventListener('pointerenter',function(){ cursor.classList.add('big'); });
    el.addEventListener('pointerleave',function(){ cursor.classList.remove('big'); });
  });
}

/* progress + to-top + spy */
var prog=$('#progress'), toTop=$('#to-top'), links=$$('.nav a[href^="#"]'), ticking=false;
function onScroll(){
  if(ticking) return; ticking=true;
  requestAnimationFrame(function(){
    ticking=false;
    var h=document.documentElement, sc=h.scrollTop||document.body.scrollTop, max=h.scrollHeight-h.clientHeight;
    if(prog) prog.style.transform='scaleX('+(max>0?sc/max:0)+')';
    if(toTop) toTop.classList.toggle('show', sc>620);
  });
}
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
if(toTop) toTop.addEventListener('click',function(){ reduce?(location.hash='#top'):window.scrollTo({top:0,behavior:'smooth'}); });
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) links.forEach(function(a){ a.getAttribute('href')==='#'+e.target.id?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'); }); }); },{rootMargin:'-38% 0px -56% 0px'});
  links.forEach(function(a){ var s=document.getElementById(a.getAttribute('href').slice(1)); if(s) io.observe(s); });
}

/* reveal with stagger */
var rev=$$('[data-reveal]');
if('IntersectionObserver' in window && !reduce){
  var rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } }); },{threshold:.1,rootMargin:'0px 0px -4% 0px'});
  rev.forEach(function(el){ rio.observe(el); });
}else rev.forEach(function(el){ el.classList.add('in'); });

/* counters */
function anim(el,to){
  if(reduce){ el.textContent=to; return; }
  var st=0,dur=1150;
  function step(ts){ if(!st)st=ts; var pr=Math.min((ts-st)/dur,1),e=1-Math.pow(1-pr,3); el.textContent=Math.round(to*e); if(pr<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
}
if('IntersectionObserver' in window){
  var cio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ anim(e.target,parseInt(e.target.getAttribute('data-count-to'),10)); cio.unobserve(e.target); } }); },{threshold:.5});
  $$('[data-count-to]').forEach(function(el){ cio.observe(el); });
}else $$('[data-count-to]').forEach(function(el){ el.textContent=el.getAttribute('data-count-to'); });

/* ticker */
var tr=$('#ticker-track'); if(tr) tr.innerHTML+=tr.innerHTML;

/* copy */
var btn=$('[data-copy]'), st=$('#copy-status');
if(btn&&st&&navigator.clipboard){
  btn.hidden=false; var lab=btn.textContent,tm;
  btn.addEventListener('click',function(){
    navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(
      function(){ btn.textContent='Copied ✓'; st.textContent='Email copied.'; },
      function(){ st.textContent='Copy failed — select manually.'; });
    clearTimeout(tm); tm=setTimeout(function(){ btn.textContent=lab; st.textContent=''; },2400);
  });
}

/* spotlight + tilt (transform-only, rAF) */
if(fine && !reduce){
  $$('.line,.case,.stat,.idcard').forEach(function(card){
    var raf=0;
    card.addEventListener('pointermove',function(e){
      if(raf) return;
      raf=requestAnimationFrame(function(){
        raf=0;
        var r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
        card.style.setProperty('--mx',(x*100).toFixed(1)+'%');
        card.style.setProperty('--my',(y*100).toFixed(1)+'%');
        card.style.transform='translateY(-5px) perspective(950px) rotateX('+((.5-y)*5).toFixed(2)+'deg) rotateY('+((x-.5)*6).toFixed(2)+'deg)';
      });
    },{passive:true});
    card.addEventListener('pointerleave',function(){ cancelAnimationFrame(raf); raf=0; card.style.transform=''; });
  });
  /* magnetic buttons */
  $$('.btn-dark,.btn-light').forEach(function(b){
    b.addEventListener('pointermove',function(e){
      var r=b.getBoundingClientRect();
      b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.07).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.14-2).toFixed(1)+'px)';
    },{passive:true});
    b.addEventListener('pointerleave',function(){ b.style.transform=''; });
  });
}

/* rotating role */
var words=['cloud, Kubernetes & reliability','pipelines that ship in minutes','SLOs you can actually trust','models running like services'],wi=0,rot=$('#rotator');
if(rot&&!reduce) setInterval(function(){ rot.style.opacity=0; setTimeout(function(){ wi=(wi+1)%words.length; rot.textContent=words[wi]; rot.style.opacity=1; },240); },3800);

/* filters */
var filters=$$('.filter'), cards=$$('.line');
filters.forEach(function(f){ f.addEventListener('click',function(){
  filters.forEach(function(x){ x.setAttribute('aria-pressed','false'); });
  f.setAttribute('aria-pressed','true');
  var v=f.getAttribute('data-filter');
  cards.forEach(function(c){
    var show = v==='all'||c.getAttribute('data-line')===v;
    c.classList.toggle('dim',!show);
    if(!reduce){ c.style.transform=show?'':'none'; }
  });
});});

/* constellation canvas — light, capped, pausable */
var cv=$('#net');
if(cv){
  var ctx=cv.getContext('2d',{alpha:true}),W=0,H=0,nodes=[],run=!reduce,raf2=0,dpr=Math.min(window.devicePixelRatio||1,1.5);
  function size(){ var r=cv.parentElement.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
  size(); var rT; window.addEventListener('resize',function(){ clearTimeout(rT); rT=setTimeout(size,160); },{passive:true});
  var N=window.innerWidth<700?26:56;
  for(var i=0;i<N;i++) nodes.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0006,vy:(Math.random()-.5)*.0006});
  var cols=['#2B59FF','#0C7A57','#C93A4D','#B98A00'];
  function draw(){
    raf2=0; if(!run) return;
    ctx.clearRect(0,0,W,H);
    for(var a=0;a<nodes.length;a++){ var n=nodes[a]; n.x+=n.vx; n.y+=n.vy; if(n.x<0||n.x>1)n.vx*=-1; if(n.y<0||n.y>1)n.vy*=-1; }
    ctx.lineWidth=1;
    for(var k=0;k<nodes.length;k++) for(var j=k+1;j<nodes.length;j++){
      var b=nodes[j],c=nodes[k],dx=(c.x-b.x)*W,dy=(c.y-b.y)*H;
      if(dx>140||dx<-140||dy>140||dy<-140) continue;
      var d=Math.sqrt(dx*dx+dy*dy);
      if(d<140){ ctx.strokeStyle='rgba(43,89,255,'+(0.13*(1-d/140)).toFixed(3)+')'; ctx.beginPath(); ctx.moveTo(c.x*W,c.y*H); ctx.lineTo(b.x*W,b.y*H); ctx.stroke(); }
    }
    for(var q=0;q<nodes.length;q++){ var pt=nodes[q]; ctx.fillStyle=cols[q%4]; ctx.globalAlpha=.7; ctx.beginPath(); ctx.arc(pt.x*W,pt.y*H,2,0,6.283); ctx.fill(); }
    ctx.globalAlpha=1;
    raf2=requestAnimationFrame(draw);
  }
  function kick(){ if(!raf2&&run&&!reduce) raf2=requestAnimationFrame(draw); }
  kick();
  if('IntersectionObserver' in window) new IntersectionObserver(function(e){ run=e[0].isIntersecting&&!reduce; if(run) kick(); else if(raf2){cancelAnimationFrame(raf2); raf2=0;} }).observe(cv);
  document.addEventListener('visibilitychange',function(){ if(document.hidden){ run=false; if(raf2){cancelAnimationFrame(raf2); raf2=0;} } else if(!reduce){ run=true; kick(); } });
  /* gentle parallax on hero */
  if(!reduce){
    var hero=$('.hero'), px=0,py=0;
    window.addEventListener('pointermove',function(e){
      px=(e.clientX/window.innerWidth-.5); py=(e.clientY/window.innerHeight-.5);
      if(cv) cv.style.transform='translate3d('+(px*14).toFixed(1)+'px,'+(py*10).toFixed(1)+'px,0)';
    },{passive:true});
  }
}

/* terminal + deploy with travelling packet */
var log=$('#term-log'),tstat=$('#term-status'),dbtn=$('#deploy-btn'),pnodes=$$('.pipe-node'),pstate=$('#pipe-state'),packet=$('#packet');
var pfill=document.querySelector('.pipe-fill');
if(!pfill){ pfill=document.createElement('div'); pfill.className='pipe-fill'; pfill.setAttribute('aria-hidden','true'); var ptx=$('#pipe-track'); if(ptx) ptx.appendChild(pfill); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function addLine(html){ var d=document.createElement('div'); d.className='t-line'; d.innerHTML=html; log.appendChild(d); while(log.children.length>13) log.removeChild(log.firstChild); }
function say(t,c){ return '<span class="'+c+'">'+esc(t)+'</span>'; }
if(log){
  addLine(say('user@prod:~$ ','t-prompt')+say('whoami','t-cmd'));
  addLine(say('harsh-bhimra — devops · cloud · sre','t-dim'));
  addLine(say('user@prod:~$ ','t-prompt')+say('kubectl get lines -A','t-cmd'));
  addLine(say('platform    running   3/3','t-ok'));
  addLine(say('delivery    running   4/4','t-ok'));
  addLine(say('reliability running   3/3','t-ok'));
  addLine(say('frontier    running   4/4','t-ok'));
}
var deploying=false;
var stages=[
  ['01','Commit','git push origin main','Lint + unit tests green (42s)'],
  ['02','Build','docker build -t app:sha','Image pushed · SBOM attached'],
  ['03','Test','pytest -q && e2e','214 passed · 0 flaky'],
  ['04','Scan','trivy + gitleaks','0 critical · secrets clean'],
  ['05','Deploy','argo sync prod','K8s rollout 3/3 · Helm v42'],
  ['06','Observe','check-slo.sh','SLO 99.95% · MTTD < 3 min']
];
function resetPipe(){ pnodes.forEach(function(n){ n.classList.remove('active','done'); }); if(pfill) pfill.style.width='0'; if(packet){ packet.classList.remove('go'); packet.style.left='4%'; } if(pstate) pstate.textContent='● IDLE'; }
function runDeploy(){
  if(deploying||!dbtn) return; deploying=true;
  dbtn.disabled=true; dbtn.textContent='● DEPLOYING…';
  resetPipe(); if(pstate) pstate.textContent='● RUNNING'; if(tstat) tstat.textContent='Deploy running.';
  if(packet) packet.classList.add('go');
  var i=0;
  (function step(){
    if(i>=stages.length){
      addLine(say('✓ DEPLOY LIVE ','t-ok')+say(new Date().toLocaleTimeString()+' — all systems operational','t-dim'));
      if(pstate) pstate.textContent='● LIVE';
      dbtn.disabled=false; dbtn.textContent='↻ DEPLOY AGAIN'; deploying=false;
      if(tstat) tstat.textContent='Deploy complete.';
      if(packet) packet.style.left='96%';
      return;
    }
    var s=stages[i];
    pnodes.forEach(function(n,ix){ n.classList.toggle('active',ix===i); n.classList.toggle('done',ix<i); });
    if(pfill) pfill.style.width=(i/(stages.length-1)*92)+'%';
    if(packet) packet.style.left=(4+i/(stages.length-1)*92)+'%';
    addLine(say('user@prod:~$ ','t-prompt')+say(s[2],'t-cmd'));
    setTimeout(function(){ addLine(say('['+s[0]+' '+s[1]+'] ','t-key')+say(s[3],'t-ok')); i++; setTimeout(step,reduce?60:480); },reduce?60:600);
  })();
}
if(dbtn) dbtn.addEventListener('click',runDeploy);

/* palette */
var pal=$('#palette'),pin=$('#palette-input'),plist=$('#palette-list'),sel=0;
var acts=[
  {t:'Stack — four lines',h:'#skills',k:'S'},
  {t:'Work — before / after',h:'#work',k:'W'},
  {t:'About — operator',h:'#about',k:'A'},
  {t:'Method — how I work',h:'#journey',k:'J'},
  {t:'Contact — email me',h:'#contact',k:'C'},
  {t:'Copy email address',h:'copy',k:'M'},
  {t:'Run deploy simulation',h:'deploy',k:'D'}
];
function renderPal(f){
  if(!plist) return; plist.innerHTML='';
  var q=(f||'').toLowerCase();
  acts.filter(function(a){ return a.t.toLowerCase().indexOf(q)>-1; }).forEach(function(a,ix){
    var b=document.createElement('button'); b.type='button'; b.setAttribute('role','option');
    b.setAttribute('aria-selected',ix===sel?'true':'false');
    b.innerHTML='<span>'+esc(a.t)+'</span><kbd>'+a.k+'</kbd>';
    b.addEventListener('click',function(){ go(a); }); plist.appendChild(b);
  });
}
function go(a){ closePal(); if(a.h==='copy'&&btn) btn.click(); else if(a.h==='deploy') runDeploy(); else location.hash=a.h; }
function openPal(){ if(!pal) return; pal.hidden=false; sel=0; renderPal(''); pin.value=''; setTimeout(function(){ pin.focus(); },30); }
function closePal(){ if(pal) pal.hidden=true; }
renderPal('');
if(pin) pin.addEventListener('input',function(){ sel=0; renderPal(pin.value); });
document.addEventListener('keydown',function(e){
  var tag=(document.activeElement&&document.activeElement.tagName)||'',typing=/INPUT|TEXTAREA/.test(tag);
  if(e.key==='/'&&!typing){ e.preventDefault(); openPal(); }
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); if(pal) pal.hidden?openPal():closePal(); }
  else if(e.key==='Escape'&&pal&&!pal.hidden){ closePal(); }
  else if(pal&&!pal.hidden&&(e.key==='ArrowDown'||e.key==='ArrowUp')){ e.preventDefault(); var n=plist.children.length; if(n){ sel=(sel+(e.key==='ArrowDown'?1:-1)+n)%n; renderPal(pin.value); } }
  else if(pal&&!pal.hidden&&e.key==='Enter'){ var b=plist.children[sel]; if(b) b.click(); }
  else if(!typing){ if(e.key.toLowerCase()==='d') runDeploy(); }
});
if(pal) pal.addEventListener('click',function(e){ if(e.target===pal) closePal(); });
console.log('%c HARSH.BHIMRA %c D = deploy · / = jump ','background:#10141B;color:#fff;font-weight:bold','background:#E9C46A;color:#10141B');
})();
