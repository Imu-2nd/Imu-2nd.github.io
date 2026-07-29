/* ==========================================================================
   아롱이 추모 공간 — 화면 동작
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     여기만 고치면 됩니다.
     birth / farewell 에 날짜('YYYY-MM-DD')를 넣으면
     '함께한 날' 칸이 자동으로 나타납니다. 비워 두면 표시하지 않습니다.
     ------------------------------------------------------------------ */
  var PROFILE = {
    name: '아롱이',
    birth: null,
    farewell: null,
  };

  var VIDEOS = [
    { src: 'media/videos/arong-clip-01.mp4', label: '그날의 아롱이' },
    { src: 'media/videos/arong-clip-02.mp4', label: '조금 더, 아롱이' },
  ];

  var photos = (window.ARONG_PHOTOS || []).slice();

  var $ = function (id) { return document.getElementById(id); };

  /* ── 함께한 날들 ───────────────────────────────────────── */

  function renderStats() {
    var host = $('stats');
    if (!host) return;

    var years = photos
      .filter(function (p) { return p.date; })
      .map(function (p) { return Number(p.date.slice(0, 4)); });

    var items = [];

    if (PROFILE.birth && PROFILE.farewell) {
      var days = Math.round(
        (new Date(PROFILE.farewell) - new Date(PROFILE.birth)) / 86400000
      );
      if (isFinite(days) && days > 0) {
        items.push({ num: days.toLocaleString('ko-KR'), label: '함께한 날' });
      }
    }

    items.push({ num: photos.length, label: '남은 사진' });
    items.push({ num: VIDEOS.length, label: '남은 영상' });

    if (years.length) {
      var min = Math.min.apply(null, years);
      var max = Math.max.apply(null, years);
      items.push({ num: max - min + 1 + '년', label: min + ' – ' + max + ' 의 기록' });
    }

    host.innerHTML = items
      .map(function (it) {
        return (
          '<li class="reveal"><span class="stat-num">' + it.num + '</span>' +
          '<span class="stat-label">' + it.label + '</span></li>'
        );
      })
      .join('');
  }

  /* ── 갤러리 ────────────────────────────────────────────── */

  var gallery = $('gallery');
  var chipsHost = $('yearChips');
  var visible = photos.slice();   // 현재 필터가 적용된 목록

  function yearOf(p) { return p.date ? p.date.slice(0, 4) : null; }

  function dateLabel(iso) {
    if (!iso) return '';
    var m = iso.split('-');
    return m[0] + '년 ' + Number(m[1]) + '월 ' + Number(m[2]) + '일';
  }

  function renderGallery(list) {
    visible = list;
    if (!list.length) {
      gallery.innerHTML = '<p class="gallery-empty">이 시기의 사진은 아직 없어요.</p>';
      return;
    }
    gallery.innerHTML = list
      .map(function (p, i) {
        var alt = PROFILE.name + ' 사진' + (p.caption ? ' — ' + p.caption : '');
        var cap = p.caption || dateLabel(p.date);
        return (
          '<button class="photo-card" type="button" data-index="' + i + '">' +
          '<img src="' + p.thumb + '" width="' + p.w + '" height="' + p.h + '"' +
          ' alt="' + alt.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async">' +
          (cap ? '<span class="photo-cap">' + cap + '</span>' : '') +
          '</button>'
        );
      })
      .join('');
  }

  function renderChips() {
    if (!chipsHost) return;

    var years = [];
    photos.forEach(function (p) {
      var y = yearOf(p);
      if (y && years.indexOf(y) === -1) years.push(y);
    });
    years.sort();

    var hasUndated = photos.some(function (p) { return !p.date; });

    var defs = [{ key: 'all', label: '전체' }];
    if (hasUndated) defs.push({ key: 'undated', label: '그때 그 시절' });
    years.forEach(function (y) { defs.push({ key: y, label: y }); });

    chipsHost.innerHTML = defs
      .map(function (d, i) {
        return (
          '<button class="chip" type="button" role="tab" data-key="' + d.key + '"' +
          ' aria-selected="' + (i === 0) + '">' + d.label + '</button>'
        );
      })
      .join('');

    chipsHost.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;

      chipsHost.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-selected', String(c === chip));
      });

      var key = chip.dataset.key;
      renderGallery(
        photos.filter(function (p) {
          if (key === 'all') return true;
          if (key === 'undated') return !p.date;
          return yearOf(p) === key;
        })
      );
    });
  }

  /* ── 라이트박스 ────────────────────────────────────────── */

  var lb = $('lightbox');
  var lbImg = $('lbImg');
  var lbDate = $('lbDate');
  var lbText = $('lbText');
  var lbOrig = $('lbOrig');
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + visible.length) % visible.length;
    var p = visible[current];
    lbImg.src = p.large;
    lbImg.alt = PROFILE.name + ' 사진' + (p.caption ? ' — ' + p.caption : '');
    lbDate.textContent = dateLabel(p.date);
    lbText.textContent = p.caption || '';
    lbOrig.href = p.original;
  }

  function openLightbox(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    $('lbClose').focus();
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () {
      lb.hidden = true;
      lbImg.removeAttribute('src');
    }, 220);
    if (lastFocus) lastFocus.focus();
  }

  if (gallery) {
    gallery.addEventListener('click', function (e) {
      var card = e.target.closest('.photo-card');
      if (card) openLightbox(Number(card.dataset.index));
    });
  }

  if (lb) {
    $('lbClose').addEventListener('click', closeLightbox);
    $('lbPrev').addEventListener('click', function () { show(current - 1); });
    $('lbNext').addEventListener('click', function () { show(current + 1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-figure')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });

    // 모바일 좌우 스와이프
    var touchX = null;
    lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 55) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ── 영상 (누를 때 비로소 불러오기) ────────────────────── */

  function renderVideos() {
    var host = $('videoGrid');
    if (!host) return;

    host.innerHTML = VIDEOS.map(function (v) {
      return (
        '<article class="video-card reveal" data-src="' + v.src + '">' +
        '<button class="video-poster" type="button" aria-label="' + v.label + ' 재생">' +
        '<span class="video-play" aria-hidden="true">▶</span>' +
        '<span class="video-label" aria-hidden="true">' + v.label + '</span>' +
        '</button></article>'
      );
    }).join('');

    host.addEventListener('click', function (e) {
      var btn = e.target.closest('.video-poster');
      if (!btn) return;
      var card = btn.closest('.video-card');
      var video = document.createElement('video');
      video.src = card.dataset.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      card.innerHTML = '';
      card.appendChild(video);
    });
  }

  /* ── 발자국 남기기 ─────────────────────────────────────── */

  var PAW_KEY = 'arong.paws';
  var PAW_MAX_MARKS = 36;

  function renderPaws() {
    var btn = $('pawBtn');
    var out = $('pawCount');
    var field = $('pawField');
    if (!btn) return;

    var count = 0;
    try { count = Number(localStorage.getItem(PAW_KEY)) || 0; } catch (err) { /* 저장 불가 환경 */ }

    function paint() {
      out.textContent = count
        ? '여기 발자국 ' + count.toLocaleString('ko-KR') + '개가 찍혔어요 🐾'
        : '아직 발자국이 없어요.';
    }

    function drop() {
      if (field.childElementCount >= PAW_MAX_MARKS) field.removeChild(field.firstChild);
      var mark = document.createElement('span');
      mark.className = 'paw-mark';
      mark.textContent = '🐾';
      mark.style.left = (6 + Math.random() * 88) + '%';
      mark.style.top = (10 + Math.random() * 76) + '%';
      mark.style.setProperty('--rot', Math.round(Math.random() * 90 - 45) + 'deg');
      field.appendChild(mark);
    }

    for (var i = 0; i < Math.min(count, PAW_MAX_MARKS); i++) drop();
    paint();

    btn.addEventListener('click', function () {
      count += 1;
      try { localStorage.setItem(PAW_KEY, String(count)); } catch (err) { /* 저장 불가 환경 */ }
      paint();
      drop();
      btn.classList.remove('is-pressed');
      void btn.offsetWidth;
      btn.classList.add('is-pressed');
    });
  }

  /* ── 스크롤 등장 효과 ──────────────────────────────────── */

  function observeReveals() {
    var targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── 시작 ──────────────────────────────────────────────── */

  renderStats();
  renderChips();
  renderGallery(photos);
  renderVideos();
  renderPaws();
  observeReveals();
})();
