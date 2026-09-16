// Payal Group — fixed header + dynamic interactions
const WA_NUMBER = '918855588610';
const $ = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];

/* ---------- Mobile top dropdown (FIXED) ---------- */
function toggleMenu(force){
  const m = $('#mobileMenu'); if(!m) return false;
  const open = force !== undefined ? force : !m.classList.contains('open');
  if(open){ // pin menu exactly below the (sticky) header — visible from any scroll position
    const h = document.querySelector('header.site');
    if(h) m.style.top = Math.max(0, Math.round(h.getBoundingClientRect().bottom)) + 'px';
  }
  m.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  const btn = $('#hamburger');
  if(btn){ btn.textContent = open ? '✕' : '☰'; btn.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); }
  return open;
}
window.toggleMenu = toggleMenu;

/* ---------- Dynamic chrome: progress + back-to-top + shrink + parallax ---------- */
function initChrome(){
  // scroll progress
  let bar = $('#scrollProgress');
  if(!bar){ bar = document.createElement('div'); bar.id='scrollProgress'; document.body.prepend(bar); }
  // back to top
  let bt = $('#backTop');
  if(!bt){ bt = document.createElement('button'); bt.id='backTop'; bt.innerHTML='↑'; bt.setAttribute('aria-label','Back to top'); document.body.appendChild(bt); bt.onclick=()=>window.scrollTo({top:0,behavior:'smooth'}); }
  const header = $('header.site');
  // fixed header: offset page content by exact header height (works on every device)
  const fitBody = ()=>{ if(header) document.body.style.paddingTop = header.offsetHeight + 'px'; };
  fitBody(); window.addEventListener('resize', fitBody); window.addEventListener('load', fitBody);
  const heroBg = $('.hero-bg img');
  const onScroll = ()=>{
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h>0 ? (y/h*100) : 0) + '%';
    if(header) header.classList.toggle('scrolled', y>24);
    bt.classList.toggle('show', y>600);
    if(heroBg && y < innerHeight*1.2) heroBg.style.translate = `0 ${y*0.12}px`; // subtle parallax
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  // stagger reveals
  $$('.grid3 .reveal, .grid4 .reveal').forEach((el,i)=> el.style.setProperty('--d', ((i%4)*0.08)+'s'));
  // card tilt (desktop only, subtle)
  if(matchMedia('(pointer:fine)').matches){
    $$('.card').forEach(card=>{
      card.addEventListener('pointermove', e=>{
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY-r.top)/r.height-0.5)*-5, ry = ((e.clientX-r.left)/r.width-0.5)*5;
        card.style.transform = `translateY(-6px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave', ()=> card.style.transform='');
    });
  }
  // FAQ accordion (if present)
  $$('.faq-q').forEach(q=> q.onclick=()=> q.parentElement.classList.toggle('open'));
}

/* ---------- Reveal + counters ---------- */
const io = new IntersectionObserver(es=>{
  es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target);
    if(en.target.classList.contains('stat')) animateCount(en.target);
  }});
},{threshold:.15});

function animateCount(stat){
  const el = stat.querySelector('strong[data-count]'); if(!el || el.dataset.done) return; el.dataset.done=1;
  const target = parseFloat(el.dataset.count); const suffix = el.dataset.suffix||'';
  const dur=1400, t0=performance.now();
  const step = t=>{
    const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
    el.textContent = (Number.isInteger(target)? Math.round(target*e) : (target*e).toFixed(1)) + suffix;
    if(p<1) requestAnimationFrame(step);
  }; requestAnimationFrame(step);
}

window.addEventListener('DOMContentLoaded', ()=>{
  initChrome();
  $$('.reveal').forEach(el=>io.observe(el));
  $$('.stat').forEach(el=>io.observe(el));
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.links a, .mobile-menu a').forEach(a=>{ if(a.getAttribute('href')===page) a.classList.add('active'); });
  // close menu on link click + on resize to desktop
  $$('#mobileMenu a').forEach(a=> a.addEventListener('click', ()=>toggleMenu(false)));
  window.addEventListener('resize', ()=>{ if(innerWidth>980){ toggleMenu(false); } else { const m=$('#mobileMenu'), h=document.querySelector('header.site'); if(m && m.classList.contains('open') && h) m.style.top = Math.max(0, Math.round(h.getBoundingClientRect().bottom)) + 'px'; } });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ toggleMenu(false); window.closeLightbox && window.closeLightbox(); }});
  initViewer(); initGalleryLB(); initForms();
});
document.addEventListener('click', e=>{
  const m = $('#mobileMenu');
  if(m && m.classList.contains('open') && !e.target.closest('#mobileMenu') && !e.target.closest('#hamburger')) toggleMenu(false);
});

/* ---------- Layout viewer ---------- */
function initViewer(){
  const v = $('#planViewer'); if(!v) return;
  const img = $('#planViewerImg'); let scale=1, x=0, y=0, dragging=false, sx=0, sy=0;
  const apply = ()=>{ img.style.transform = `translate(${x}px,${y}px) scale(${scale})`; };
  const zin = ()=>{ scale=Math.min(5, scale+0.4); apply(); };
  const zout = ()=>{ scale=Math.max(0.6, scale-0.4); if(scale<=1){x=0;y=0;} apply(); };
  const reset = ()=>{ scale=1;x=0;y=0; apply(); };
  window.planFull = ()=>{ const f=$('#planFrame'); if(document.fullscreenElement) document.exitFullscreen(); else f && f.requestFullscreen && f.requestFullscreen(); };
  $$('[data-zoom-in]').forEach(b=>b.onclick=zin);
  $$('[data-zoom-out]').forEach(b=>b.onclick=zout);
  $$('[data-zoom-reset]').forEach(b=>b.onclick=reset);
  $$('[data-full]').forEach(b=>b.onclick=window.planFull);
  v.addEventListener('pointerdown', e=>{dragging=true;sx=e.clientX-x;sy=e.clientY-y;v.setPointerCapture(e.pointerId);v.style.cursor='grabbing';});
  v.addEventListener('pointermove', e=>{ if(!dragging) return; x=e.clientX-sx; y=e.clientY-sy; apply(); });
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>v.addEventListener(ev,()=>{dragging=false;v.style.cursor='grab';}));
  v.addEventListener('wheel', e=>{e.preventDefault(); scale += e.deltaY<0?0.15:-0.15; scale=Math.min(5,Math.max(.6,scale)); if(scale<=1){x=0;y=0;} apply();},{passive:false});
  let d0=0;
  v.addEventListener('touchmove', e=>{
    if(e.touches.length===2){ e.preventDefault();
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      if(d0) scale=Math.min(5,Math.max(.6, scale+(d-d0)/300)), apply();
      d0=d;
    }
  },{passive:false});
  v.addEventListener('touchend', ()=>d0=0);
  const lb = $('#lightbox'), lbImg = $('#lightboxImg');
  window.openPlanLightbox = ()=>{
    if(!lb) return; lbImg.src = img.currentSrc || img.src;
    lb.classList.add('open'); document.body.style.overflow='hidden';
  };
  window.closeLightbox = ()=>{ lb && lb.classList.remove('open'); document.body.style.overflow=''; };
  if(lb) lb.addEventListener('click', e=>{ if(e.target===lb || e.target===lbImg) window.closeLightbox(); });
  img.addEventListener('error', ()=>{ const f=$('#planFallback'); if(f) f.style.display='block'; img.style.display='none'; }, {once:true});
  // double-tap to zoom on mobile
  let lastTap=0;
  v.addEventListener('touchend', e=>{ const now=Date.now(); if(now-lastTap<300){ scale = scale>1.5?1:2.2; x=0;y=0; apply(); } lastTap=now; });
}

/* ---------- Gallery lightbox with prev/next ---------- */
let gList=[], gIdx=0;
function initGalleryLB(){
  const lb=$('#lightbox'), lbImg=$('#lightboxImg'); if(!lb) return;
  if(!window.closeLightbox) window.closeLightbox = ()=>{ lb.classList.remove('open'); document.body.style.overflow=''; };
  lb.addEventListener('click', e=>{ if(e.target===lb || e.target===lbImg) window.closeLightbox(); });
  gList = $$('.gitem img');
  if(!gList.length) return;
  if(!$('#lbPrev')){
    const p=document.createElement('button'); p.id='lbPrev'; p.className='lb-prev'; p.textContent='‹'; p.onclick=e=>{e.stopPropagation();gNav(-1);}; lb.appendChild(p);
    const n=document.createElement('button'); n.id='lbNext'; n.className='lb-next'; n.textContent='›'; n.onclick=e=>{e.stopPropagation();gNav(1);}; lb.appendChild(n);
  }
  gList.forEach((im,i)=> im.parentElement.addEventListener('click', ()=>{
    gIdx=i; lbImg.src=im.src; lb.classList.add('open'); document.body.style.overflow='hidden';
  }));
  document.addEventListener('keydown', e=>{
    if(!lb.classList.contains('open')) return;
    if(e.key==='ArrowRight') gNav(1); if(e.key==='ArrowLeft') gNav(-1);
  });
}
function gNav(d){
  if(!gList.length) return;
  gIdx=(gIdx+d+gList.length)%gList.length;
  $('#lightboxImg').src=gList[gIdx].src;
}

/* ---------- Forms → WhatsApp ---------- */
function sendToWhatsApp(data){
  const msg = `New Property Enquiry%0AName: ${encodeURIComponent(data.name||'')}%0AMobile: ${encodeURIComponent(data.mobile||'')}%0AEmail: ${encodeURIComponent(data.email||'')}%0ARequirement: ${encodeURIComponent(data.interest||data.requirement||'')}%0APreferred Plot: ${encodeURIComponent(data.plot||data.preferred||'')}%0AMessage: ${encodeURIComponent(data.message||'')}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`,'_blank');
}
function initForms(){
  $$('form[data-wa]').forEach(f=>{
    f.addEventListener('submit', e=>{
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f).entries());
      if(!d.name || !d.mobile){ alert('Please enter your Name and Mobile Number.'); return; }
      if(!/^[6-9]\d{9}$/.test(String(d.mobile).replace(/\D/g,'').slice(-10))){ alert('Please enter a valid 10-digit mobile number.'); return; }
      const btn = f.querySelector('[type=submit]'); if(btn){ btn.textContent='Opening WhatsApp…'; setTimeout(()=>btn.textContent='Send Enquiry on WhatsApp',2500); }
      sendToWhatsApp(d);
    });
  });
}
