// @task S6F7
// AX-On Platform — OG URL 메타태그 자동 수정 스크립트
// 각 페이지에서 로드 시 og:url 메타태그를 현재 페이지 canonical URL로 갱신

(function () {
  'use strict';

  var BASE_URL = 'https://ax-on.vercel.app';

  function fixOGUrl() {
    var ogUrlMeta = document.querySelector('meta[property="og:url"]');
    var canonicalUrl = BASE_URL + window.location.pathname;

    if (ogUrlMeta) {
      ogUrlMeta.setAttribute('content', canonicalUrl);
    } else {
      // og:url 메타태그가 없으면 생성
      var meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.setAttribute('content', canonicalUrl);
      document.head.appendChild(meta);
    }

    // og:image도 올바른 도메인으로 수정
    var ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      var currentImage = ogImageMeta.getAttribute('content');
      if (currentImage && currentImage.includes('ax-on.net')) {
        ogImageMeta.setAttribute('content', currentImage.replace('https://www.ax-on.net', BASE_URL));
      }
    }
  }

  // 즉시 실행 (head에서 로드되므로 DOM 대기 불필요)
  fixOGUrl();
})();
