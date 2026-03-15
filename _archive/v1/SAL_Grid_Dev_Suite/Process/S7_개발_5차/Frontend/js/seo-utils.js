// @task S7F5
// @description SEO 유틸리티 — 메타 태그 동적 업데이트, JSON-LD 생성, Canonical URL, 소셜 공유

'use strict';

/* ─────────────────────────────────────────────
   updateMetaTags(data)
   동적으로 <head>의 SEO 메타 태그를 업데이트합니다.

   @param {Object} data
     - title       {string}  페이지 제목
     - description {string}  페이지 설명
     - image       {string}  OG 이미지 URL
     - url         {string}  현재 페이지 URL (canonical)
     - type        {string}  OG type (기본: 'profile')
     - twitterCard {string}  트위터 카드 타입 (기본: 'summary_large_image')
───────────────────────────────────────────── */
function updateMetaTags(data) {
  const {
    title = 'AX-On Platform',
    description = '',
    image = 'https://ax-on.vercel.app/images/og-default.png',
    url = window.location.href,
    type = 'profile',
    twitterCard = 'summary_large_image'
  } = data;

  // <title>
  document.title = title;

  // <meta name="description">
  _setMeta('name', 'description', description);

  // Open Graph
  _setMeta('property', 'og:title', title);
  _setMeta('property', 'og:description', description);
  _setMeta('property', 'og:image', image);
  _setMeta('property', 'og:url', url);
  _setMeta('property', 'og:type', type);

  // Twitter Card
  _setMeta('name', 'twitter:card', twitterCard);
  _setMeta('name', 'twitter:title', title);
  _setMeta('name', 'twitter:description', description);
  _setMeta('name', 'twitter:image', image);
}

/** 내부 헬퍼: meta 태그 속성을 찾거나 생성하여 content를 설정 */
function _setMeta(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/* ─────────────────────────────────────────────
   generateJsonLd(type, data)
   JSON-LD 구조화 데이터 스크립트를 <head>에 삽입합니다.

   @param {string} type  'Person' | 'WebPage' | 'BreadcrumbList' 등
   @param {Object} data  schema.org 데이터 객체
   @returns {HTMLScriptElement}
───────────────────────────────────────────── */
function generateJsonLd(type, data) {
  // 기존 동일 type의 JSON-LD 제거 (중복 방지)
  const existing = document.querySelector(`script[data-jsonld="${type}"]`);
  if (existing) existing.remove();

  const schema = Object.assign({ '@context': 'https://schema.org', '@type': type }, data);

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-jsonld', type);
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
  return script;
}

/* ─────────────────────────────────────────────
   generateCanonicalUrl(path)
   canonical <link> 태그를 설정하고 URL 문자열을 반환합니다.

   @param {string} [path]  경로 (없으면 현재 URL 사용)
   @returns {string}       완전한 canonical URL
───────────────────────────────────────────── */
function generateCanonicalUrl(path) {
  const base = 'https://ax-on.vercel.app';
  const canonicalPath = path || window.location.pathname + window.location.search;
  const canonicalUrl = path
    ? (path.startsWith('http') ? path : base + '/' + path.replace(/^\//, ''))
    : window.location.href;

  // 기존 canonical 제거 후 재설정
  let linkEl = document.querySelector('link[rel="canonical"]');
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.rel = 'canonical';
    document.head.appendChild(linkEl);
  }
  linkEl.href = canonicalUrl;
  return canonicalUrl;
}

/* ─────────────────────────────────────────────
   shareToSocial(platform, data)
   소셜 미디어 공유 및 클립보드 복사를 처리합니다.

   @param {string} platform  'kakao' | 'facebook' | 'twitter' | 'clipboard'
   @param {Object} data
     - title       {string}  공유 제목
     - description {string}  공유 설명
     - url         {string}  공유 URL
     - image       {string}  OG 이미지 URL (카카오 전용)
───────────────────────────────────────────── */
function shareToSocial(platform, data) {
  const {
    title = document.title,
    description = '',
    url = window.location.href,
    image = 'https://ax-on.vercel.app/images/og-default.png'
  } = data;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  switch (platform) {
    case 'kakao':
      _shareKakao({ title, description, url, image });
      break;

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        '_blank',
        'width=600,height=400,noopener,noreferrer'
      );
      break;

    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        '_blank',
        'width=600,height=400,noopener,noreferrer'
      );
      break;

    case 'clipboard':
      _copyToClipboard(url);
      break;

    default:
      console.warn('[seo-utils] shareToSocial: 알 수 없는 플랫폼', platform);
  }
}

/** 카카오 SDK를 통한 공유 */
function _shareKakao({ title, description, url, image }) {
  if (typeof Kakao === 'undefined' || !Kakao.isInitialized()) {
    // 카카오 SDK 미로드 시 fallback: 카카오링크 웹 공유
    const fallbackUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
    window.open(fallbackUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    return;
  }

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: title,
      description: description,
      imageUrl: image,
      link: {
        mobileWebUrl: url,
        webUrl: url
      }
    },
    buttons: [
      {
        title: '자세히 보기',
        link: { mobileWebUrl: url, webUrl: url }
      }
    ]
  });
}

/** 클립보드 복사 — 성공/실패 시 커스텀 이벤트 발행 */
async function _copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // 구형 브라우저 fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    document.dispatchEvent(new CustomEvent('seo:copy-success', { detail: { text } }));
  } catch (err) {
    console.error('[seo-utils] 클립보드 복사 실패:', err);
    document.dispatchEvent(new CustomEvent('seo:copy-error', { detail: { err } }));
  }
}

/* ─────────────────────────────────────────────
   전문가(Person) JSON-LD 전용 헬퍼
   generateExpertJsonLd(expert)

   @param {Object} expert  전문가 데이터 객체
───────────────────────────────────────────── */
function generateExpertJsonLd(expert) {
  const {
    name = '',
    jobTitle = '',
    description = '',
    image = '',
    url = window.location.href,
    sameAs = [],
    worksFor = null
  } = expert;

  const personSchema = {
    name,
    jobTitle,
    description,
    image,
    url
  };

  if (sameAs && sameAs.length > 0) {
    personSchema.sameAs = sameAs;
  }

  if (worksFor) {
    personSchema.worksFor = {
      '@type': 'Organization',
      name: worksFor
    };
  }

  return generateJsonLd('Person', personSchema);
}

/* ─────────────────────────────────────────────
   BreadcrumbList JSON-LD 헬퍼
   generateBreadcrumbJsonLd(items)

   @param {Array} items  [{ name, url }, ...]
───────────────────────────────────────────── */
function generateBreadcrumbJsonLd(items) {
  const itemListElement = items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: item.url
  }));

  return generateJsonLd('BreadcrumbList', { itemListElement });
}

// 전역 노출 (모듈 시스템 없는 vanilla 환경)
window.SeoUtils = {
  updateMetaTags,
  generateJsonLd,
  generateCanonicalUrl,
  shareToSocial,
  generateExpertJsonLd,
  generateBreadcrumbJsonLd
};
