// TravelPass — 공통 스크립트 (v3). travelpass/lib/tp.ts 에서 생성.
// TravelPass 카드소개·혜택 페이지 인터랙션. 페이지 useEffect 에서 initTp() 호출, 정리 함수 반환.

(function(){
  // 스토어 링크 (TODO: 실제 값으로 교체)
  const STORE = { ios: 'https://apps.apple.com/app/id0000000000', android: 'https://play.google.com/store/apps/details?id=com.travelpass.app' };
  const _ints = [], _ios = [], _vis = []
  const _int = (fn, ms) => { const id = setInterval(fn, ms); _ints.push(id); return id }
  const _io = (cb, opt) => { const o = new IntersectionObserver(cb, opt); _ios.push(o); return o }

  // 스토어 링크는 lib/stores.ts 단일 출처를 사용한다.
  document.querySelectorAll('[data-store]').forEach(a => a.href = STORE[a.dataset.store]);

  // QR 은 publicassets/qr.svg 한 곳만 본다. 스토어 분기 URL 이 확정되면 그 파일만 교체하면 된다.
  const QR = '<img src="assets/qr.svg" alt="" width="180" height="180" />';
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
      clearInterval(timer); timer = _int(() => show(i + 1), +root.dataset.interval || 2400);
    };
    slides.forEach(s => s.onload = (() => { s.classList.add('ok'); if (ph) ph.hidden = true; show(i); start(); }));
    slides.forEach(s => s.onerror = (() => { s.hidden = true; }));
    slides.forEach(s => { if (s.complete && s.naturalWidth > 0) { s.classList.add('ok'); if (ph) ph.hidden = true; } });
    if (ready().length) { show(0); start(); }
    root.onmouseenter = (() => clearInterval(timer));
    root.onmouseleave = (start);
    caps.forEach((c, k) => c.onclick = (() => { const ok = ready(); const idx = ok.indexOf(slides[k]); if (idx > -1) { show(idx); start(); } }));
  });

  // 자동 진행 스테퍼 (data-stepper)
  document.querySelectorAll('[data-stepper]').forEach(root => {
    const steps = [...root.querySelectorAll('.st')], shots = [...root.querySelectorAll('.st-shot')];
    const bars = steps.map(s => s.querySelector('.st-bar i'));
    const interval = +root.dataset.interval || 3500;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    let cur = 0, timer = null, visible = false;
    let startedAt = 0, remaining = interval;   // 일시정지 후 남은 시간부터 이어서 진행

    const fillBar = (k, ms) => {
      const b = bars[k]; if (!b) return;
      const from = 1 - ms / interval;          // 이미 채워진 비율에서 이어서
      b.style.transition = 'none';
      b.style.height = (from * 100) + '%';
      void b.offsetWidth;
      b.style.transition = `height ${ms}ms linear`;
      b.style.height = '100%';
    };
    const setBar = (k, state) => {
      const b = bars[k]; if (!b) return;
      b.style.transition = 'none';
      b.style.height = state === 'done' ? '100%' : '0';
    };
    const freezeBar = k => {                   // 0 으로 되돌리지 않고 그 자리에 멈춘다
      const b = bars[k]; if (!b) return;
      const h = getComputedStyle(b).height;
      b.style.transition = 'none';
      b.style.height = h;
    };
    const show = k => {
      cur = k;
      steps.forEach((s, i) => { s.classList.toggle('on', i === k); s.classList.toggle('done', i < k); });
      shots.forEach((s, i) => s.classList.toggle('on', i === k));
      bars.forEach((_, i) => setBar(i, i < k ? 'done' : 'idle'));
    };
    const stop = () => { clearTimeout(timer); timer = null; };
    const pause = () => {
      if (timer) remaining = Math.max(0, remaining - (Date.now() - startedAt));
      stop();
      freezeBar(cur);
    };
    const start = () => {
      stop();
      if (reduced || !visible) return;
      fillBar(cur, remaining);
      startedAt = Date.now();
      const tick = () => {
        show((cur + 1) % steps.length);
        remaining = interval;
        fillBar(cur, interval);
        startedAt = Date.now();
        timer = setTimeout(tick, interval);
        _ints.push(timer);
      };
      timer = setTimeout(tick, remaining);
      _ints.push(timer);
    };
    const goTo = k => { show(k); remaining = interval; start(); };

    steps.forEach((s, i) => {
      const b = s.querySelector('.st-n');
      if (b) b.onclick = (() => goTo(i));
      // 호버는 '정지'가 아니라 '이동'이다.
      //  - 진행 중인 스텝에 올리면 그대로 진행하고 순환도 계속한다.
      //  - 다른 스텝에 올리면 그 스텝으로 옮겨가 처음부터 다시 잰다.
      // 예전엔 .stepper 전체(데스크톱에서 화면 대부분)에 정지가 걸려 있어서
      // 읽거나 스크롤하는 내내 자동재생이 멈춰 있었다.
      s.onmouseenter = (() => { if (i !== cur) goTo(i); });
    });

    _io(([e]) => { visible = e.isIntersecting; visible ? start() : pause(); }, { threshold: .15 }).observe(root);
    // 탭이 숨겨져 있으면 IntersectionObserver 가 발화하지 않아 자동재생이 시작되지 않는다.
    // 배경 탭에서 열어둔 경우를 대비해 다시 보일 때 직접 깨운다.
    const onVis = () => { document.hidden ? pause() : start() };
    document.addEventListener('visibilitychange', onVis);
    _vis.push(onVis);
    show(0);
    if (reduced) bars.forEach((_, i) => setBar(i, 'idle'));
  });

  // 단말기 태그 장면: 화면에 보일 때만 재생, 동작 줄이기면 정지 장면
  document.querySelectorAll('[data-tap]').forEach(el => {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { el.classList.add('still'); return; }
    _io(([e]) => el.classList.toggle('play', e.isIntersecting), { threshold: .3 }).observe(el);
  });

  // 앱 기능 카드 캐러셀 (data-deck): 스냅 스크롤 + 화살표 + 점 + 자동 재생
  document.querySelectorAll('[data-deck]').forEach(deck => {
    const track = deck.querySelector('.deck-track'), cards = [...deck.querySelectorAll('.dcard')];
    const dots = deck.querySelector('.dots'), playBtn = deck.querySelector('[data-play]');
    const interval = +deck.dataset.interval || 5000;
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
    let cur = 0, timer = null, visible = false, hover = false, paused = reduced;
    cards.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `${i + 1}번째 카드`); b.onclick = (() => { go(i); restart(); }); dots.appendChild(b); });
    const dotEls = [...dots.children];
    const mark = i => { cur = i; dotEls.forEach((d, k) => d.classList.toggle('on', k === i)); };
    const go = i => { i = (i + cards.length) % cards.length; const c = cards[i]; track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' }); mark(i); };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (paused || !visible || hover) return; timer = _int(() => go(cur + 1), interval); };
    const restart = () => start();
    deck.querySelector('[data-prev]').onclick = (() => { go(cur - 1); restart(); });
    deck.querySelector('[data-next]').onclick = (() => { go(cur + 1); restart(); });
    if (playBtn) { playBtn.classList.toggle('paused', paused); playBtn.onclick = (() => { paused = !paused; playBtn.classList.toggle('paused', paused); playBtn.setAttribute('aria-label', paused ? '자동 재생 시작' : '자동 재생 멈춤'); start(); }); }
    deck.onmouseenter = (() => { hover = true; stop(); });
    deck.onmouseleave = (() => { hover = false; start(); });
    // 손으로 넘겼을 때 현재 카드 갱신
    let st; track.onscroll = (() => { clearTimeout(st); st = setTimeout(() => { const mid = track.scrollLeft + track.clientWidth / 2; let best = 0, d = Infinity; cards.forEach((c, i) => { const cm = c.offsetLeft + c.clientWidth / 2; if (Math.abs(cm - mid) < d) { d = Math.abs(cm - mid); best = i; } }); mark(best); }, 80); });
    track.onkeydown = (e => { if (e.key === 'ArrowRight') { go(cur + 1); restart(); } if (e.key === 'ArrowLeft') { go(cur - 1); restart(); } });
    _io(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }, { threshold: .3 }).observe(deck);
    mark(0);
  });

  // 앱 스크린샷: 파일이 없으면 자리표시 유지
  document.querySelectorAll('.device img:not(.slide)').forEach(img => {
    const ph = img.nextElementSibling;
    img.onload = (() => { img.classList.add('ok'); if (ph) ph.hidden = true; });
    img.onerror = (() => { img.hidden = true; });
    if (img.complete) { if (img.naturalWidth > 0) { img.classList.add('ok'); if (ph) ph.hidden = true; } else { img.hidden = true; } }
  });

  // 다운로드 팝업 (데스크톱 QR) / 하단 시트 (모바일 딥링크) / 메뉴 드로어
  const isMobile = () => matchMedia('(max-width:860px)').matches;
  const $ = s => document.querySelector(s);
  const ov = $('.ov'), modal = $('.modal'), sheet = $('.sheet'), drawer = $('.drawer');
  const layers = [ov, modal, sheet, drawer].filter(Boolean);
  const closeAll = () => { layers.forEach(x => x.classList.remove('open')); document.body.classList.remove('lock'); };
  const open = el => { closeAll(); ov && ov.classList.add('open'); el.classList.add('open'); document.body.classList.add('lock'); };
  document.querySelectorAll('[data-dl]').forEach(b => b.onclick = (() => open(isMobile() ? sheet : modal)));
  document.querySelectorAll('[data-menu]').forEach(b => b.onclick = (() => open(drawer)));
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = (closeAll));
  window.onkeydown = e => { if (e.key === 'Escape') closeAll(); };
  window.onresize = (() => {
    if (modal && modal.classList.contains('open') && isMobile()) open(sheet);
    if (sheet && sheet.classList.contains('open') && !isMobile()) open(modal);
  });

  // 하단 바(모바일): 첫 화면을 지나면 표시, 다운로드 띠가 보이면 숨김
  const mbar = $('.mbar');
  const first = $('[data-first]'), dl = $('#download');
  if (mbar && first && dl) {
    let past = false, at = false;
    const sync = () => { mbar.classList.toggle('show', past && !at); };
    _io(([e]) => { past = !e.isIntersecting; sync(); }, { threshold: .15 }).observe(first);
    _io(([e]) => { at = e.isIntersecting; sync(); }, { threshold: .3 }).observe(dl);
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
    tabs.forEach(t => t.onclick = (() => show(t.dataset.tab)));
    const h = location.hash.replace('#', '');
    if (useHash && tabs.some(t => t.dataset.tab === h)) show(h);
  });

  // 등장 모션
  const io = _io(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

})();
