// @task S8F5 — 이미지 Lazy Loading 최적화
// Stage: S8 | Area: F (Frontend)
// IntersectionObserver 기반 이미지 지연 로드 모듈

(function () {
  'use strict';

  // ─────────────────────────────────────────
  // 설정 상수
  // ─────────────────────────────────────────
  const OBSERVER_OPTIONS = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01,
  };

  const PLACEHOLDER_CLASS = 'lazy-placeholder';
  const LAZY_CLASS = 'lazy-image';
  const LOADED_CLASS = 'loaded';
  const ERROR_CLASS = 'lazy-error';

  const FALLBACK_SRC = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" '
    + 'width="400" height="300" viewBox="0 0 400 300"%3E'
    + '%3Crect width="400" height="300" fill="%23e2e8f0"/%3E'
    + '%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" '
    + 'fill="%2394a3b8" font-family="sans-serif" font-size="14"%3E'
    + 'Image not available%3C/text%3E'
    + '%3C/svg%3E';

  // ─────────────────────────────────────────
  // 네이티브 Lazy Loading 지원 감지
  // ─────────────────────────────────────────
  const supportsNativeLazy = 'loading' in HTMLImageElement.prototype;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;

  // ─────────────────────────────────────────
  // Placeholder 적용
  // ─────────────────────────────────────────
  function applyPlaceholder(el) {
    el.classList.add(PLACEHOLDER_CLASS);
  }

  // ─────────────────────────────────────────
  // 이미지 로드 처리
  // ─────────────────────────────────────────
  function loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src && !srcset) return;

    // 임시 Image 객체로 사전 로드
    const tempImg = new Image();

    tempImg.onload = function () {
      if (srcset) img.srcset = srcset;
      if (src) img.src = src;

      img.classList.remove(PLACEHOLDER_CLASS);
      img.classList.add(LOADED_CLASS);

      // data 속성 정리
      delete img.dataset.src;
      delete img.dataset.srcset;
    };

    tempImg.onerror = function () {
      img.src = FALLBACK_SRC;
      img.classList.remove(PLACEHOLDER_CLASS);
      img.classList.add(ERROR_CLASS);
      console.warn('[LazyLoading] Failed to load image:', src);
    };

    tempImg.src = src || srcset.split(',')[0].trim().split(' ')[0];
  }

  // ─────────────────────────────────────────
  // 배경 이미지 로드 처리
  // ─────────────────────────────────────────
  function loadBackground(el) {
    const bg = el.dataset.bg;
    if (!bg) return;

    const tempImg = new Image();

    tempImg.onload = function () {
      el.style.backgroundImage = 'url("' + bg + '")';
      el.classList.remove(PLACEHOLDER_CLASS);
      el.classList.add(LOADED_CLASS);
      delete el.dataset.bg;
    };

    tempImg.onerror = function () {
      el.classList.remove(PLACEHOLDER_CLASS);
      el.classList.add(ERROR_CLASS);
      console.warn('[LazyLoading] Failed to load background:', bg);
    };

    tempImg.src = bg;
  }

  // ─────────────────────────────────────────
  // 네이티브 Lazy Loading 적용 (지원 브라우저)
  // ─────────────────────────────────────────
  function applyNativeLazy(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (srcset) {
      img.srcset = srcset;
      delete img.dataset.srcset;
    }
    if (src) {
      img.src = src;
      delete img.dataset.src;
    }

    img.setAttribute('loading', 'lazy');
    img.classList.remove(PLACEHOLDER_CLASS);

    img.addEventListener('load', function () {
      img.classList.add(LOADED_CLASS);
    }, { once: true });

    img.addEventListener('error', function () {
      img.src = FALLBACK_SRC;
      img.classList.add(ERROR_CLASS);
    }, { once: true });
  }

  // ─────────────────────────────────────────
  // IntersectionObserver 콜백
  // ─────────────────────────────────────────
  function onIntersect(entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      observer.unobserve(el);

      if (el.tagName === 'IMG') {
        loadImage(el);
      } else if (el.dataset.bg) {
        loadBackground(el);
      }
    });
  }

  // ─────────────────────────────────────────
  // 단일 요소 관찰 등록
  // ─────────────────────────────────────────
  var sharedObserver = null;

  function getObserver() {
    if (!sharedObserver) {
      sharedObserver = new IntersectionObserver(onIntersect, OBSERVER_OPTIONS);
    }
    return sharedObserver;
  }

  function observeElement(el) {
    applyPlaceholder(el);

    // IMG 태그 + 네이티브 지원 → 네이티브 우선
    if (el.tagName === 'IMG' && supportsNativeLazy && !el.dataset.bg) {
      applyNativeLazy(el);
      return;
    }

    if (supportsIntersectionObserver) {
      getObserver().observe(el);
    } else {
      // IntersectionObserver 미지원 — 즉시 로드 (fallback)
      if (el.tagName === 'IMG') {
        loadImage(el);
      } else {
        loadBackground(el);
      }
    }
  }

  // ─────────────────────────────────────────
  // 공개 API: 동적으로 추가된 이미지 관찰
  // ─────────────────────────────────────────
  /**
   * observeNewImages(container)
   * 동적으로 DOM에 추가된 이미지나 배경 요소를 관찰 대상에 추가합니다.
   * @param {Element|Document} container - 탐색 범위 (기본값: document)
   */
  function observeNewImages(container) {
    var root = container || document;
    var targets = root.querySelectorAll('[data-src], [data-srcset], [data-bg]');

    targets.forEach(function (el) {
      // 이미 처리된 요소 제외
      if (el.classList.contains(LOADED_CLASS) || el.classList.contains(ERROR_CLASS)) return;
      observeElement(el);
    });
  }

  // ─────────────────────────────────────────
  // 공개 API: 초기화
  // ─────────────────────────────────────────
  /**
   * initLazyLoading()
   * DOMContentLoaded 이후 호출하여 페이지 내 모든 lazy 요소를 초기화합니다.
   */
  function initLazyLoading() {
    observeNewImages(document);
    console.info('[LazyLoading] Initialized.'
      + ' NativeLazy=' + supportsNativeLazy
      + ' IntersectionObserver=' + supportsIntersectionObserver);
  }

  // ─────────────────────────────────────────
  // 자동 초기화
  // ─────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }

  // ─────────────────────────────────────────
  // 전역 노출
  // ─────────────────────────────────────────
  window.LazyLoading = {
    init: initLazyLoading,
    observeNewImages: observeNewImages,
  };
})();
