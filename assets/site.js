// ==========================================================
// TravelPass — 공통 스크립트 (v2)
// ==========================================================
(function(){
  // 스토어 링크 (TODO: 실제 값으로 교체)
  const STORE = {
    ios: 'https://apps.apple.com/app/id0000000000',
    android: 'https://play.google.com/store/apps/details?id=com.travelpass.app'
  };
  document.querySelectorAll('[data-store]').forEach(a => a.href = STORE[a.dataset.store]);

  // QR 삽입 (assets/qr.svg 와 동일. 스토어 분기 URL 확정 시 재생성)
  const QR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="crispEdges" class="segno"><path class="qrline" stroke="#182232" d="M1 1.5h7m2 0h2m1 0h2m1 0h1m2 0h3m1 0h7m-29 1h1m5 0h1m6 0h3m6 0h1m5 0h1m-29 1h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m3 0h2m1 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m1 0h1m5 0h2m1 0h1m2 0h1m1 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m1 0h3m4 0h1m3 0h2m1 0h1m1 0h3m1 0h1m-29 1h1m5 0h1m1 0h1m3 0h1m2 0h1m1 0h2m3 0h1m5 0h1m-29 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-21 1h1m5 0h2m2 0h3m-21 1h1m1 0h5m2 0h2m4 0h3m1 0h1m2 0h5m-26 1h3m3 0h1m3 0h4m1 0h1m1 0h2m1 0h4m3 0h1m-29 1h2m3 0h2m1 0h1m3 0h4m1 0h2m1 0h1m-21 1h1m1 0h4m3 0h2m1 0h2m1 0h1m7 0h3m1 0h1m-22 1h2m1 0h4m1 0h4m2 0h1m2 0h1m1 0h2m-27 1h1m1 0h1m1 0h1m2 0h1m2 0h2m4 0h1m1 0h2m1 0h4m3 0h1m-29 1h1m2 0h1m1 0h3m7 0h2m3 0h1m1 0h5m-27 1h1m1 0h1m1 0h2m6 0h1m1 0h2m4 0h2m2 0h1m2 0h1m-28 1h4m2 0h2m2 0h1m1 0h1m2 0h1m1 0h1m1 0h1m5 0h2m-27 1h1m2 0h3m1 0h3m1 0h1m1 0h2m1 0h4m2 0h3m1 0h1m1 0h1m-29 1h1m3 0h1m1 0h1m2 0h1m1 0h1m1 0h4m3 0h2m4 0h1m-27 1h1m2 0h2m4 0h1m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m2 0h1m2 0h1m-28 1h1m1 0h1m2 0h3m1 0h1m1 0h1m2 0h1m2 0h2m1 0h5m1 0h3m-21 1h1m2 0h2m4 0h4m3 0h5m-29 1h7m2 0h2m4 0h1m1 0h1m1 0h2m1 0h1m1 0h3m-27 1h1m5 0h1m1 0h4m2 0h2m2 0h3m3 0h1m3 0h1m-29 1h1m1 0h3m1 0h1m1 0h1m2 0h1m3 0h3m2 0h5m1 0h2m-28 1h1m1 0h3m1 0h1m1 0h2m1 0h4m1 0h1m1 0h3m2 0h1m1 0h4m-29 1h1m1 0h3m1 0h1m1 0h1m4 0h3m2 0h1m2 0h7m-28 1h1m5 0h1m5 0h1m2 0h1m3 0h3m2 0h2m1 0h1m-28 1h7m1 0h2m2 0h1m2 0h3m1 0h1m3 0h4"/></svg>`;
  document.querySelectorAll('[data-qr]').forEach(el => el.innerHTML = QR);

  // 자동 순환 화면 (data-carousel): 이미지가 로드된 슬라이드만 순환
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const slides = [...root.querySelectorAll('.slide')], caps = [...root.querySelectorAll('.cap')];
    const ph = root.querySelector('.ph');
    let i = 0, timer = null;
    const ready = () => slides.filter(s => s.naturalWidth > 0);
    const show = n => {
      const ok = ready(); if (!ok.length) return;
      i = (n + ok.length) % ok.length;
      slides.forEach(s => s.classList.toggle('on', s === ok[i]));
      caps.forEach((c, k) => c.classList.toggle('on', slides.indexOf(ok[i]) === k));
    };
    const start = () => {
      if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      clearInterval(timer); timer = setInterval(() => show(i + 1), +root.dataset.interval || 2400);
    };
    slides.forEach(s => s.addEventListener('load', () => { s.classList.add('ok'); if (ph) ph.hidden = true; show(i); start(); }));
    slides.forEach(s => s.addEventListener('error', () => { s.hidden = true; }));
    slides.forEach(s => { if (s.complete && s.naturalWidth > 0) { s.classList.add('ok'); if (ph) ph.hidden = true; } });
    if (ready().length) { show(0); start(); }
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', start);
    caps.forEach((c, k) => c.addEventListener('click', () => { const ok = ready(); const idx = ok.indexOf(slides[k]); if (idx > -1) { show(idx); start(); } }));
  });

  // 자동 진행 스테퍼 (data-stepper)
  document.querySelectorAll('[data-stepper]').forEach(root => {
    const steps = [...root.querySelectorAll('.st')], shots = [...root.querySelectorAll('.st-shot')];
    const bars = steps.map(s => s.querySelector('.st-bar i'));
    const interval = +root.dataset.interval || 3500;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    let cur = 0, timer = null, visible = false, hover = false;
    const setBar = (k, state) => {
      const b = bars[k]; if (!b) return;
      b.style.transition = 'none';
      b.style.height = state === 'done' ? '100%' : '0';
      if (state === 'fill') { void b.offsetWidth; b.style.transition = `height ${interval}ms linear`; b.style.height = '100%'; }
    };
    const show = k => {
      cur = k;
      steps.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); });
      shots.forEach((s, i) => s.classList.toggle('on', i === k));
      bars.forEach((_, i) => setBar(i, i < k ? 'done' : 'idle'));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (reduced || !visible || hover) return;
      setBar(cur, 'fill');
      timer = setInterval(() => { show((cur + 1) % steps.length); setBar(cur, 'fill'); }, interval);
    };
    steps.forEach((s, i) => s.querySelector('.st-n').addEventListener('click', () => { show(i); start(); }));
    root.addEventListener('mouseenter', () => { hover = true; stop(); setBar(cur, 'idle'); });
    root.addEventListener('mouseleave', () => { hover = false; start(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { threshold: .25 }).observe(root);
    show(0);
    if (reduced) bars.forEach((_, i) => setBar(i, 'idle'));
  });

  // 단말기 태그 장면: 화면에 보일 때만 재생, 동작 줄이기면 정지 장면
  document.querySelectorAll('[data-tap]').forEach(el => {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { el.classList.add('still'); return; }
    new IntersectionObserver(([e]) => el.classList.toggle('play', e.isIntersecting), { threshold: .3 }).observe(el);
  });

  // 앱 기능 카드 캐러셀 (data-deck): 스냅 스크롤 + 화살표 + 점 + 자동 재생
  document.querySelectorAll('[data-deck]').forEach(deck => {
    const track = deck.querySelector('.deck-track'), cards = [...deck.querySelectorAll('.dcard')];
    const dots = deck.querySelector('.dots'), playBtn = deck.querySelector('[data-play]');
    const interval = +deck.dataset.interval || 5000;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    let cur = 0, timer = null, visible = false, hover = false, paused = reduced;
    cards.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `${i + 1}번째 카드`); b.addEventListener('click', () => { go(i); restart(); }); dots.appendChild(b); });
    const dotEls = [...dots.children];
    const mark = i => { cur = i; dotEls.forEach((d, k) => d.classList.toggle('on', k === i)); };
    const go = i => { i = (i + cards.length) % cards.length; const c = cards[i]; track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' }); mark(i); };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (paused || !visible || hover) return; timer = setInterval(() => go(cur + 1), interval); };
    const restart = () => start();
    deck.querySelector('[data-prev]').addEventListener('click', () => { go(cur - 1); restart(); });
    deck.querySelector('[data-next]').addEventListener('click', () => { go(cur + 1); restart(); });
    if (playBtn) { playBtn.classList.toggle('paused', paused); playBtn.addEventListener('click', () => { paused = !paused; playBtn.classList.toggle('paused', paused); playBtn.setAttribute('aria-label', paused ? '자동 재생 시작' : '자동 재생 멈춤'); start(); }); }
    deck.addEventListener('mouseenter', () => { hover = true; stop(); });
    deck.addEventListener('mouseleave', () => { hover = false; start(); });
    // 손으로 넘겼을 때 현재 카드 갱신
    let st; track.addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(() => { const mid = track.scrollLeft + track.clientWidth / 2; let best = 0, d = Infinity; cards.forEach((c, i) => { const cm = c.offsetLeft + c.clientWidth / 2; if (Math.abs(cm - mid) < d) { d = Math.abs(cm - mid); best = i; } }); mark(best); }, 80); }, { passive: true });
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { go(cur + 1); restart(); } if (e.key === 'ArrowLeft') { go(cur - 1); restart(); } });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { threshold: .3 }).observe(deck);
    mark(0);
  });

  // 앱 스크린샷: 파일이 없으면 자리표시 유지
  document.querySelectorAll('.device img:not(.slide)').forEach(img => {
    const ph = img.nextElementSibling;
    img.addEventListener('load', () => { img.classList.add('ok'); if (ph) ph.hidden = true; });
    img.addEventListener('error', () => { img.hidden = true; });
    if (img.complete) { if (img.naturalWidth > 0) { img.classList.add('ok'); if (ph) ph.hidden = true; } else { img.hidden = true; } }
  });

  // 다운로드 팝업 (데스크톱 QR) / 하단 시트 (모바일 딥링크) / 메뉴 드로어
  const isMobile = () => matchMedia('(max-width:860px)').matches;
  const $ = s => document.querySelector(s);
  const ov = $('.ov'), modal = $('.modal'), sheet = $('.sheet'), drawer = $('.drawer');
  const layers = [ov, modal, sheet, drawer].filter(Boolean);
  const closeAll = () => { layers.forEach(x => x.classList.remove('open')); document.body.classList.remove('lock'); };
  const open = el => { closeAll(); ov && ov.classList.add('open'); el.classList.add('open'); document.body.classList.add('lock'); };
  document.querySelectorAll('[data-dl]').forEach(b => b.addEventListener('click', () => open(isMobile() ? sheet : modal)));
  document.querySelectorAll('[data-menu]').forEach(b => b.addEventListener('click', () => open(drawer)));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeAll));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  addEventListener('resize', () => {
    if (modal && modal.classList.contains('open') && isMobile()) open(sheet);
    if (sheet && sheet.classList.contains('open') && !isMobile()) open(modal);
  });

  // 우하단 QR / 하단 바: 첫 화면을 지나면 표시, 다운로드 띠가 보이면 숨김
  const fab = $('.fab'), mbar = $('.mbar');
  const first = $('[data-first]'), dl = $('#download');
  if (fab && mbar && first && dl) {
    let past = false, at = false;
    const sync = () => { const on = past && !at; fab.classList.toggle('show', on); mbar.classList.toggle('show', on); };
    new IntersectionObserver(([e]) => { past = !e.isIntersecting; sync(); }, { threshold: .15 }).observe(first);
    new IntersectionObserver(([e]) => { at = e.isIntersecting; sync(); }, { threshold: .3 }).observe(dl);
  }

  // 탭 (앱 소개 / 사용처·혜택 공용): [data-tabs] 안의 [data-tab=key] 와 [data-panel=key]
  document.querySelectorAll('[data-tabs]').forEach(root => {
    const tabs = [...root.querySelectorAll('[data-tab]')];
    const panels = [...document.querySelectorAll(`[data-panel-group="${root.dataset.tabs}"]`)];
    const useHash = root.hasAttribute('data-hash');
    const show = k => {
      tabs.forEach(t => { const on = t.dataset.tab === k; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
      panels.forEach(p => p.classList.toggle('on', p.dataset.panel === k));
      if (useHash) history.replaceState(null, '', '#' + k);
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
    const h = location.hash.replace('#', '');
    if (useHash && tabs.some(t => t.dataset.tab === h)) show(h);
  });

  // 등장 모션
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
