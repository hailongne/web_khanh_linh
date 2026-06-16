// Enhanced interactions for prototype (accessibility, focus trap, dots, polish)
document.addEventListener('DOMContentLoaded', function(){
  // header shadow
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', ()=> header.classList.toggle('scrolled', window.scrollY > 10));

  // timeline fade-in
  const steps = document.querySelectorAll('.timeline .step');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  },{threshold:0.18});
  steps.forEach(s=>io.observe(s));

  // Tabs with ARIA
  const tabs = Array.from(document.querySelectorAll('.tab'));
  tabs.forEach((btn, idx)=>{
    btn.setAttribute('role','tab');
    if(!btn.id) btn.id = `tab-btn-${idx+1}`;
    const target = btn.dataset.target;
    if(target) btn.setAttribute('aria-controls', target);
    btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
    btn.addEventListener('click', ()=>{
      tabs.forEach(t=>{ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      const panel = document.getElementById(target);
      if(panel) panel.classList.add('active');
    });
  });

  // FAQ accordion (accessible)
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  faqItems.forEach((item,i)=>{
    const panel = item.nextElementSibling;
    const pid = panel.id || `faq-panel-${i+1}`;
    panel.id = pid;
    item.setAttribute('aria-controls', pid);
    item.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';
    item.addEventListener('click', ()=>{
      const expanded = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', String(!expanded));
      item.classList.toggle('open', !expanded);
      panel.setAttribute('aria-hidden', String(expanded));
      panel.style.display = expanded ? 'none' : 'block';
    });
  });

  // CAROUSEL: dots and scroll sync
  const carCarousel = document.getElementById('car-carousel');
  const carDots = document.getElementById('car-dots');
  if(carCarousel && carDots){
    const cards = Array.from(carCarousel.querySelectorAll('.car-card'));
    cards.forEach((c,i)=>{
      const d = document.createElement('button');
      d.className = 'dot'; d.type = 'button'; d.setAttribute('aria-label', `Slide ${i+1}`);
      d.addEventListener('click', ()=> carCarousel.scrollTo({left: c.offsetLeft - 8, behavior:'smooth'}));
      carDots.appendChild(d);
    });
    // initial active
    if(carDots.firstElementChild) carDots.firstElementChild.classList.add('active');
    carCarousel.addEventListener('scroll', ()=>{
      const cardsList = carCarousel.querySelectorAll('.car-card');
      const idx = Math.round(carCarousel.scrollLeft / (cardsList[0].offsetWidth + 12));
      Array.from(carDots.children).forEach((b,bi)=> b.classList.toggle('active', bi===idx));
    });
  }

  // USP dots (keyboard accessible)
  const usp = document.getElementById('usp-scroll');
  const uspDots = document.getElementById('usp-dots');
  if(usp && uspDots){
    const items = Array.from(usp.querySelectorAll('.usp-item'));
    items.forEach((it,i)=>{
      const d = document.createElement('button'); d.className='dot-mini'; d.type='button'; d.setAttribute('aria-label', `Ưu điểm ${i+1}`);
      d.addEventListener('click', ()=> usp.scrollTo({left: it.offsetLeft, behavior:'smooth'}));
      uspDots.appendChild(d);
    });
    if(uspDots.firstElementChild) uspDots.firstElementChild.classList.add('active');
    usp.addEventListener('scroll', ()=>{
      const idx = Math.round(usp.scrollLeft / (items[0].offsetWidth + 12));
      Array.from(uspDots.children).forEach((d, i)=> d.classList.toggle('active', i===idx));
    });
  }

  // Testimonials autoplay (pause on interaction)
  const testi = document.getElementById('testi-carousel');
  if(testi){
    let tIndex = 0;
    let autoplay = setInterval(()=>{
      const cards = Array.from(testi.children); if(cards.length===0) return;
      tIndex = (tIndex+1) % cards.length;
      testi.scrollTo({left: tIndex * (cards[0].clientWidth + 12), behavior:'smooth'});
    },4000);
    ['touchstart','pointerdown','wheel'].forEach(ev=> testi.addEventListener(ev, ()=> clearInterval(autoplay), {once:true}));
  }

  // Modal with focus trap + ESC
  const floating = document.getElementById('floating-book');
  const modal = document.getElementById('booking-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('close-modal');
  const ctaBook = document.getElementById('cta-book');
  let previousFocus = null;
  function getFocusable(container){
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(el => el.offsetParent !== null);
  }
  function openModal(){
    previousFocus = document.activeElement;
    modal.classList.add('show'); modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    const focusables = getFocusable(modal);
    setTimeout(()=>{ if(focusables[0]) focusables[0].focus(); }, 260);
    document.addEventListener('keydown', onKeydown);
  }
  function closeModal(){
    modal.classList.remove('show'); modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if(previousFocus && previousFocus.focus) previousFocus.focus();
    document.removeEventListener('keydown', onKeydown);
  }
  function onKeydown(e){
    if(e.key === 'Escape') { closeModal(); }
    if(e.key === 'Tab'){
      const focusables = getFocusable(modal);
      if(focusables.length === 0) { e.preventDefault(); return; }
      const idx = focusables.indexOf(document.activeElement);
      if(e.shiftKey && idx === 0){ e.preventDefault(); focusables[focusables.length-1].focus(); }
      else if(!e.shiftKey && idx === focusables.length-1){ e.preventDefault(); focusables[0].focus(); }
    }
  }
  if(floating) floating.addEventListener('click', openModal);
  if(ctaBook) ctaBook.addEventListener('click', openModal);
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(backdrop) backdrop.addEventListener('click', closeModal);

  // cta-prices scroll to pricing
  const ctaPrices = document.getElementById('cta-prices');
  if(ctaPrices){ ctaPrices.addEventListener('click', ()=>{ const el = document.querySelector('.pricing'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }); }

  // booking form
  const form = document.getElementById('booking-form');
  if(form) form.addEventListener('submit', (e)=>{ e.preventDefault(); alert('Cảm ơn! Yêu cầu của bạn đã được gửi.'); closeModal(); form.reset(); });

  // safety: prevent horizontal overflow
  document.documentElement.style.overflowX = 'hidden';
});
