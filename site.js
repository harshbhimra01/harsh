
'use strict';
(function(){
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(id){ return document.getElementById(id); }
function $q(s,r){ return (r||document).querySelector(s); }
function $a(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function safe(fn){ try{ fn(); }catch(e){ var er=$('deploy-err'); if(er){ er.style.display='block'; er.textContent='Something hiccupped: '+e.message; } } }
/* boot */
safe(function(){
  var boot=$('boot'), bf=$('boot-fill');
  function done(){ if(boot) boot.classList.add('done'); }
  if(reduce || !boot){ done(); return; }
  var p=0, barDone=false, pageDone=false;
  function maybe(){ if(barDone&&pageDone) done(); }
  var bi=setInterval(function(){ p+=8; if(bf) bf.style.width=Math.min(p,100)+'%'; if(p>=100){ clearInterval(bi); barDone=true; maybe(); } },140);
  function loaded(){ pageDone=true; maybe(); }
  if(document.readyState==='complete'){ loaded(); } else { addEventListener('load',loaded); }
  setTimeout(done,4500);
});
/* year + clocks */
safe(function(){
  $('year').textContent = new Date().getFullYear();
  var F=null; try{ F=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'}); }catch(e){}
  function txt(){ try{ return (F?F.format(new Date()):new Date().toLocaleTimeString())+' IST'; }catch(e){ return ''; } }
  function tick(){
    var t=txt();
    $a('#ist-clock').forEach(function(el){ el.textContent=t; });
    $a('#strip-clock').forEach(function(el){ el.textContent=t; });
  }
  tick(); setInterval(tick,15000);
  var t0=Date.now();
  setInterval(function(){ var s=Math.floor((Date.now()-t0)/1000), txt='UP '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); $a('#uptime').forEach(function(u){ u.textContent=txt; }); },1000);
});
/* progress + top + spy */
safe(function(){
  var prog=$('progress'), tp=$('to-top'), links=$a('.nav a[href^="#"]'), tk=false;
  function os(){
    if(tk) return; tk=true;
    requestAnimationFrame(function(){
      tk=false;
      var h=document.documentElement, sc=h.scrollTop||document.body.scrollTop, mx=h.scrollHeight-h.clientHeight;
      if(prog) prog.style.transform='scaleX('+(mx>0?sc/mx:0)+')';
      if(tp) tp.classList.toggle('show', sc>620);
    });
  }
  window.addEventListener('scroll',os,{passive:true}); os();
  if(tp) tp.addEventListener('click',function(){ if(reduce){ location.hash='#top'; } else { window.scrollTo({top:0,behavior:'smooth'}); } });
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) links.forEach(function(a){ if(a.getAttribute('href')==='#'+e.target.id){ a.setAttribute('aria-current','true'); } else { a.removeAttribute('aria-current'); } }); }); },{rootMargin:'-38% 0px -56% 0px'});
    links.forEach(function(a){ var s=document.getElementById(a.getAttribute('href').slice(1)); if(s) io.observe(s); });
  }
});
/* reveal */
safe(function(){
  var rv=$a('[data-reveal]'); if(!rv.length) return;
  if('IntersectionObserver' in window && !reduce){
    var rio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } }); },{threshold:.1});
    rv.forEach(function(el){ rio.observe(el); });
  } else { rv.forEach(function(el){ el.classList.add('in'); }); }
});
/* counters */
safe(function(){
  function an(el,to){
    if(reduce){ el.textContent=to; return; }
    var st=0;
    function s(t){ if(!st)st=t; var pr=Math.min((t-st)/1150,1),e=1-Math.pow(1-pr,3); el.textContent=Math.round(to*e); if(pr<1) requestAnimationFrame(s); }
    requestAnimationFrame(s);
  }
  var els=$a('[data-count-to]'); if(!els.length) return;
  if('IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ an(e.target,parseInt(e.target.getAttribute('data-count-to'),10)); cio.unobserve(e.target); } }); },{threshold:.5});
    els.forEach(function(el){ cio.observe(el); });
  } else { els.forEach(function(el){ el.textContent=el.getAttribute('data-count-to'); }); }
});
/* marquees */
safe(function(){ ['strip','ticker-track','giant'].forEach(function(id){ var el=$(id); if(el) el.innerHTML+=el.innerHTML; }); });
/* copy with fallback — always visible, always works */
safe(function(){
  var btn=$('copy-btn')||$q('[data-copy]'), msg=$('copy-status');
  if(!btn) return;
  function say(t){ if(msg) msg.textContent=t; }
  btn.addEventListener('click',function(){
    var val=btn.getAttribute('data-copy')||'harsh.bhimra@gmail.com';
    function doneOk(){ var o=btn.textContent; btn.textContent='Copied ✓'; say('Email copied to clipboard.'); setTimeout(function(){ btn.textContent=o; say(''); },2200); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(val).then(doneOk,function(){ fallback(); });
    } else { fallback(); }
    function fallback(){
      try{
        var ta=document.createElement('textarea'); ta.value=val; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); doneOk();
      }catch(e){ say('Copy failed — long-press the email above.'); }
    }
  });
});
/* rotator */
safe(function(){
  var words=['cloud, Kubernetes & reliability','pipelines that ship in minutes','SLOs you can actually trust','models running like services'],wi=0,rot=$('rotator');
  if(!rot||reduce) return;
  setInterval(function(){ rot.style.opacity=0; setTimeout(function(){ wi=(wi+1)%words.length; rot.textContent=words[wi]; rot.style.opacity=1; },2000); },7000);
});
/* filters */
safe(function(){
  var fs=$a('.filter'), cs=$a('.card'); if(!fs.length||!cs.length) return;
  fs.forEach(function(f){ f.addEventListener('click',function(){
    fs.forEach(function(x){ x.setAttribute('aria-pressed','false'); }); f.setAttribute('aria-pressed','true');
    var v=f.getAttribute('data-filter');
    cs.forEach(function(c){ c.classList.toggle('dim', v!=='all'&&c.getAttribute('data-line')!==v); });
  }); });
});
/* pointer-reactive air + water glow (full-page mist follows you, hero water surges) */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches; if(reduce) return;
  var root=document.documentElement, raf=0, mx=innerWidth/2, my=innerHeight/3, tx=mx, ty=my, idle=0, last=0;
  function loop(){ tx+=(mx-tx)*.07; ty+=(my-ty)*.07;
    root.style.setProperty('--mx',Math.round(tx)+'px'); root.style.setProperty('--my',Math.round(ty)+'px');
    raf=requestAnimationFrame(loop); }
  addEventListener('pointermove',function(e){
    mx=e.clientX; my=e.clientY;
    if(!raf) raf=requestAnimationFrame(loop);
    clearTimeout(idle); idle=setTimeout(function(){ cancelAnimationFrame(raf); raf=0; },2600);
    var now=Date.now();
    if(now-last>450){ last=now; try{ SEA.surge=Math.min(1.3,(SEA.surge||0)+.25); }catch(err){} }
  },{passive:true});
  document.addEventListener('click',function(e){
    try{ SEA.surge=1.4; }catch(err){}
    var hero=e.target&&e.target.closest?e.target.closest('.hero'):null; if(!hero) return;
    var s=document.createElement('span'); s.className='ripple'; s.setAttribute('aria-hidden','true');
    var r=hero.getBoundingClientRect();
    s.style.left=(e.clientX-r.left)+'px'; s.style.top=(e.clientY-r.top)+'px';
    hero.appendChild(s); setTimeout(function(){ s.remove(); },1100);
  });
})();
/* WATER + AIR canvas */
var SEA = { surge: 0 };
safe(function(){
  var cv=$('sea'); if(!cv) return;
  var ctx=cv.getContext('2d'), W=0, H=0, run=!reduce, raf=0;
  var dpr=Math.min(window.devicePixelRatio||1,1.5);
  var motes=[], bubbles=[];
  function size(){ var r=cv.parentElement.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); }
  size(); var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(size,160); },{passive:true});
  var i;
  for(i=0;i<46;i++) motes.push({x:Math.random(),y:Math.random(),s:.4+Math.random()*1.6,v:.0002+Math.random()*.0006,o:.12+Math.random()*.3});
  for(i=0;i<22;i++) bubbles.push({x:Math.random(),y:.55+Math.random()*.45,r:1+Math.random()*3.2,v:.0006+Math.random()*.0014,w:Math.random()*6.28});
  function wave(yBase,amp,f1,f2,ph,color){
    ctx.beginPath(); ctx.moveTo(0,H);
    for(var x=0;x<=W;x+=8){
      var y=yBase + Math.sin(x*f1+ph)*amp + Math.sin(x*f2-ph*.7)*amp*.5;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle=color; ctx.fill();
  }
  function frame(t){
    raf=0; if(!run) return;
    ctx.clearRect(0,0,W,H);
    var time=t*.0006, amp=1+SEA.surge*2.2;
    /* air */
    var m; for(var k=0;k<motes.length;k++){ m=motes[k]; m.x+=m.v; m.y-=m.v*.35; if(m.x>1.02){m.x=-.02;m.y=Math.random()} if(m.y<-.02){m.y=1.02;m.x=Math.random()}
      ctx.globalAlpha=m.o; ctx.fillStyle='#0E1B22'; ctx.beginPath(); ctx.arc(m.x*W,m.y*H,m.s,0,6.283); ctx.fill(); }
    ctx.globalAlpha=1;
    /* bubbles rise */
    for(var b=0;b<bubbles.length;b++){ var u=bubbles[b]; u.y-=u.v*(1+SEA.surge*2); u.w+=.02; if(u.y<.42){u.y=.98;u.x=Math.random()}
      ctx.globalAlpha=.28; ctx.strokeStyle='#0B7A75'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(u.x*W+Math.sin(u.w)*8,u.y*H,u.r,0,6.283); ctx.stroke(); }
    ctx.globalAlpha=1;
    /* water — three translucent layers */
    wave(H*.86,(10+SEA.surge*22)*amp,.008,.021,time,'rgba(127,216,204,.30)');
    wave(H*.90,(12+SEA.surge*26)*amp,.006,.017,time*1.2+2,'rgba(43,107,255,.16)');
    wave(H*.94,(14+SEA.surge*30)*amp,.005,.013,time*.8+4,'rgba(11,122,117,.20)');
    SEA.surge*=0.965;
    raf=requestAnimationFrame(frame);
  }
  function kick(){ if(!raf&&run) raf=requestAnimationFrame(frame); }
  if(reduce){ run=false; ctx.clearRect(0,0,W,H); wave(H*.9,10,.008,.021,1,'rgba(127,216,204,.3)'); wave(H*.95,12,.006,.017,2,'rgba(43,107,255,.14)'); }
  else {
    kick();
    if('IntersectionObserver' in window) new IntersectionObserver(function(e){ run=e[0].isIntersecting&&!reduce; if(run) kick(); else if(raf){cancelAnimationFrame(raf);raf=0;} }).observe(cv);
    document.addEventListener('visibilitychange',function(){ if(document.hidden){run=false;if(raf){cancelAnimationFrame(raf);raf=0;}} else if(!reduce){run=true;kick();} });
  }
});
/* DEPLOY — isolated, null-proof, always wired */
safe(function(){
  var log=$('term-log'), db=$('deploy-btn'), ps=$('pipe-state'), pk=$('packet'), pf=$('fill'), tstat=$('term-status');
  var nodes=$a('.node'); if(!log||!db) return;
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function line(h){ var d=document.createElement('div'); d.className='t-line'; d.innerHTML=h; log.appendChild(d); while(log.children.length>13) log.removeChild(log.firstChild); }
  function say(t,c){ return '<span class="'+c+'">'+esc(t)+'</span>'; }
  log.innerHTML='';
  line(say('user@prod:~$ ','t-p')+'whoami');
  line(say('harsh-bhimra — devops · cloud · sre','t-d'));
  line(say('user@prod:~$ ','t-p')+'tide deploy --prod');
  line(say('water: calm · air: clear · pipeline: ready','t-o'));
  var busy=false;
  var stages=[
    ['01','Commit','git push origin main','tests green · 42s'],
    ['02','Build','docker build -t app:flow','image pushed · SBOM ok'],
    ['03','Test','pytest -q && e2e','214 passed · 0 flaky'],
    ['04','Scan','trivy + gitleaks','0 critical · clean'],
    ['05','Deploy','argo sync prod','rollout 3/3 · Helm v42'],
    ['06','Observe','check-slo.sh','SLO 99.95% · MTTD <3m']
  ];
  function reset(){ nodes.forEach(function(n){ n.classList.remove('active','done'); }); if(pf) pf.style.width='0'; if(pk){ pk.classList.remove('go'); pk.style.left='4%'; } if(ps) ps.textContent='● STILL WATER'; }
  window.__tideSurge = function(){ SEA.surge = 1; };
  function runDeploy(){
    if(busy) return; busy=true;
    db.disabled=true; db.textContent='● FLOWING…';
    reset(); SEA.surge=1;
    if(ps) ps.textContent='● FLOWING'; if(tstat) tstat.textContent='Deploy running.';
    if(pk) pk.classList.add('go');
    var i=0;
    (function step(){
      if(i>=stages.length){
        line(say('✓ LIVE ','t-o')+say(new Date().toLocaleTimeString()+' — fluid and calm','t-d'));
        if(ps) ps.textContent='● FLOWING CLEAR'; if(tstat) tstat.textContent='Deploy complete.';
        db.disabled=false; db.textContent='↻ FLOW AGAIN'; busy=false;
        if(pk) pk.style.left='96%'; SEA.surge=1; return;
      }
      var s=stages[i];
      nodes.forEach(function(n,ix){ n.classList.toggle('active',ix===i); n.classList.toggle('done',ix<i); });
      if(pf) pf.style.width=(i/5*92)+'%';
      if(pk) pk.style.left=(4+i/5*92)+'%';
      SEA.surge=Math.min(1.4,SEA.surge+.35);
      line(say('user@prod:~$ ','t-p')+esc(s[2]));
      setTimeout(function(){ line(say('['+s[0]+' '+s[1]+'] ','t-k')+say(s[3],'t-o')); i++; setTimeout(step,reduce?80:1000); },reduce?80:1000);
    })();
  }
  db.addEventListener('click',runDeploy);
  window.__runDeploy = runDeploy;
});
/* palette + shortcuts — wired to the same deploy */
safe(function(){
  var pal=$('palette'), pin=$('palette-input'), pl=$('palette-list');
  var copyBtn=$('copy-btn');
  var acts=[
    {t:'Home — hero',h:'index.html',k:'H'},
    {t:'Deploy room — live terminal',h:'deploy.html',k:'D'},
    {t:'Stack — four currents',h:'stack.html',k:'S'},
    {t:'Work — tide marks',h:'work.html',k:'W'},
    {t:'About — operator',h:'about.html',k:'A'},
    {t:'Method — how I work',h:'about.html#journey',k:'J'},
    {t:'Contact — email',h:'contact.html',k:'C'},
    {t:'Lab — downtime math',h:'lab.html',k:'L'},
    {t:'Ship log',h:'log.html',k:'G'},
    {t:'File 001 — deploy speed',h:'work-deploy-speed.html',k:'1'},
    {t:'File 002 — k8s platform',h:'work-k8s-platform.html',k:'2'},
    {t:'File 003 — SLO alerts',h:'work-slo-alerts.html',k:'3'},
    {t:'Copy email',h:'copy',k:'M'}
  ];
  function esc2(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function render(f){
    if(!pl) return; pl.innerHTML='';
    var q=(f||'').toLowerCase();
    acts.filter(function(a){ return a.t.toLowerCase().indexOf(q)>-1; }).forEach(function(a){
      var b=document.createElement('button'); b.type='button';
      b.innerHTML='<span>'+esc2(a.t)+'</span><kbd>'+a.k+'</kbd>';
      b.addEventListener('click',function(){ go(a); }); pl.appendChild(b);
    });
  }
  function go(a){
    close();
    if(a.h==='copy'){ if(copyBtn){ copyBtn.click(); } else { location.href='contact.html'; } return; }
    if(a.h==='deploy.html'&&window.__runDeploy&&/(^|\/)deploy\.html$/.test(location.pathname)){ window.__runDeploy(); return; }
    location.href=a.h;
  }
  function open(){ if(!pal) return; pal.hidden=false; render(''); if(pin){ pin.value=''; setTimeout(function(){ pin.focus(); },30); } }
  function close(){ if(pal) pal.hidden=true; }
  render(''); if(pin) pin.addEventListener('input',function(){ render(pin.value); });
  document.addEventListener('keydown',function(e){
    var t=(document.activeElement||{}).tagName||'', typing=/INPUT|TEXTAREA/.test(t);
    if(e.key==='/'&&!typing){ e.preventDefault(); open(); }
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); if(pal){ pal.hidden?open():close(); } }
    else if(e.key==='Escape'&&pal&&!pal.hidden){ close(); }
    else if(pal&&!pal.hidden&&e.key==='Enter'){ var b=pl.children[0]; if(b) b.click(); }
    else if(!typing&&e.key.toLowerCase()==='d'){ if(window.__runDeploy){ window.__runDeploy(); } else { location.href='deploy.html'; } }
  });
  if(pal) pal.addEventListener('click',function(e){ if(e.target===pal) close(); });
});
/* lab: downtime math + snippet copy */
safe(function(){
  var rev=$('calc-rev'), min=$('calc-min'), out=$('calc-cost');
  if(rev&&min&&out){
    function fmt(n){ return '≈ '+Math.round(n).toLocaleString('en-IN'); }
    function go(){
      var r=parseFloat(rev.value)||0, m=parseFloat(min.value)||0;
      out.textContent=fmt(r/60*m)+' gone';
    }
    rev.addEventListener('input',go); min.addEventListener('input',go); go();
  }
  $a('[data-snip]').forEach(function(b){
    b.addEventListener('click',function(){
      var pre=document.getElementById(b.getAttribute('data-snip')); if(!pre) return;
      var txt=pre.innerText||pre.textContent;
      function ok(){ var o=b.textContent; b.textContent='Copied ✓'; setTimeout(function(){ b.textContent=o; },2000); }
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok,function(){ fb(); }); } else { fb(); }
      function fb(){ try{ var ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); ok(); }catch(e){} }
    });
  });
});
})();
