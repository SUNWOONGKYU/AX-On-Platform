/* ============================================================
   AX-On Platform — Vercel Analytics 그룹 퍼널 트래킹
   A0 Task 1 (2026-04-28~) — 4주 베이스라인 측정
   ============================================================
   - 4그룹 자동 분류: Conversion / Content / Community / Legal
   - Hero CTA 클릭 추적 (data-cta 속성 기반)
   - 단일 진입점: 모든 HTML이 이 파일을 참조
   ============================================================ */

(function () {
  'use strict';

  // ── 1) 페이지 그룹 자동 분류 ──
  function classifyGroup(pathname) {
    var p = pathname.toLowerCase();
    if (/index|ax-project|contact/.test(p)) return 'conversion';
    if (/about-ax|methodology/.test(p))      return 'content';
    if (/community|pool/.test(p))            return 'community';
    if (/terms|privacy|legal/.test(p))       return 'legal';
    return 'unknown';
  }

  var path  = window.location.pathname;
  var group = classifyGroup(path);

  // ── 2) Vercel Analytics 안전 호출 헬퍼 ──
  function track(eventName, props) {
    try {
      if (window.va && typeof window.va === 'function') {
        window.va('event', Object.assign({ name: eventName, group: group, path: path }, props || {}));
      }
    } catch (e) {
      // 트래킹 실패는 사용자 경험에 영향을 주면 안 됨
    }
  }

  // ── 3) 페이지뷰 + 그룹 태그 ──
  window.addEventListener('DOMContentLoaded', function () {
    track('pageview_group', {});
  });

  // ── 4) Hero CTA 클릭 (data-cta 속성 기반, Conversion 그룹 우선) ──
  document.addEventListener('click', function (e) {
    var target = e.target.closest && e.target.closest('[data-cta]');
    if (!target) return;
    track('cta_click', {
      cta:        target.dataset.cta || '',
      cta_group:  target.dataset.ctaGroup || group,
      href:       target.getAttribute('href') || ''
    });
  });

  // ── 5) Form 제출 추적 (전환 깔때기) ──
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    track('form_submit', {
      form_id:   form.id || '',
      form_name: form.name || ''
    });
  });

  // ── 6) 외부 링크 클릭 (이탈 추적) ──
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="http"]');
    if (!a) return;
    var hostname = a.hostname || '';
    if (hostname && hostname !== window.location.hostname) {
      track('external_link', { href: a.href, hostname: hostname });
    }
  });

  // 디버그 모드 (?debug=analytics)
  if (/[?&]debug=analytics/.test(window.location.search)) {
    console.log('[AX-On Analytics] group:', group, '| path:', path);
  }
})();
