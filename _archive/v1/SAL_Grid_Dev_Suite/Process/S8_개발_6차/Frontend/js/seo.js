// @task S8F4 — SEO 메타태그 전체 페이지 적용
// SEO 메타태그 자동 주입 모듈
// AX-On Platform | Vanilla JS SEO Module

(function () {
  'use strict';

  const SEO_CONFIG_PATH = '/public/data/seo-config.json';

  // ─────────────────────────────────────────
  // 내부 유틸리티
  // ─────────────────────────────────────────

  /**
   * <head> 내 기존 메타태그를 name 또는 property 기준으로 조회하거나 새로 생성한다.
   * @param {'name'|'property'} attr
   * @param {string} value
   * @returns {HTMLMetaElement}
   */
  function getOrCreateMeta(attr, value) {
    let el = document.querySelector(`meta[${attr}="${value}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, value);
      document.head.appendChild(el);
    }
    return el;
  }

  /**
   * <head> 내 기존 링크 태그를 rel 기준으로 조회하거나 새로 생성한다.
   * @param {string} rel
   * @returns {HTMLLinkElement}
   */
  function getOrCreateLink(rel) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    return el;
  }

  /**
   * 현재 페이지의 pathname을 반환한다.
   * 로컬 파일 시스템(file://)에서 실행 시 파일명만 추출한다.
   * @returns {string} e.g. "/" | "/startup.html"
   */
  function getCurrentPath() {
    const { pathname, protocol } = window.location;
    if (protocol === 'file:') {
      const match = pathname.match(/\/([^/]+\.html)$/i);
      return match ? '/' + match[1] : '/';
    }
    // 루트 경로 또는 index.html → "/"로 정규화
    if (pathname === '/' || /\/index\.html$/i.test(pathname)) return '/';
    return pathname;
  }

  /**
   * 현재 페이지의 절대 URL을 반환한다.
   * @param {string} [baseUrl] organization.url (fallback)
   * @returns {string}
   */
  function getCanonicalHref(baseUrl) {
    const path = getCurrentPath();
    if (window.location.protocol === 'file:') {
      return baseUrl ? baseUrl.replace(/\/$/, '') + path : '';
    }
    return window.location.origin + path;
  }

  // ─────────────────────────────────────────
  // 공개 API
  // ─────────────────────────────────────────

  /**
   * Open Graph + Twitter Card 메타태그를 주입한다.
   * @param {Object} tags
   * @param {string} [tags.title]
   * @param {string} [tags.description]
   * @param {string} [tags.image]
   * @param {string} [tags.url]
   * @param {string} [tags.type]
   * @param {string} [tags.site_name]
   * @param {string} [tags.locale]
   * @param {string} [tags.twitter_card]
   */
  function setMetaTags(tags) {
    const {
      title = '',
      description = '',
      image = '',
      url = '',
      type = 'website',
      site_name = '',
      locale = 'ko_KR',
      twitter_card = 'summary_large_image',
    } = tags;

    // ── Open Graph ──
    if (type)        getOrCreateMeta('property', 'og:type').setAttribute('content', type);
    if (title)       getOrCreateMeta('property', 'og:title').setAttribute('content', title);
    if (description) getOrCreateMeta('property', 'og:description').setAttribute('content', description);
    if (image)       getOrCreateMeta('property', 'og:image').setAttribute('content', image);
    if (url)         getOrCreateMeta('property', 'og:url').setAttribute('content', url);
    if (site_name)   getOrCreateMeta('property', 'og:site_name').setAttribute('content', site_name);
    if (locale)      getOrCreateMeta('property', 'og:locale').setAttribute('content', locale);

    // ── Twitter Card ──
    if (twitter_card) getOrCreateMeta('name', 'twitter:card').setAttribute('content', twitter_card);
    if (title)        getOrCreateMeta('name', 'twitter:title').setAttribute('content', title);
    if (description)  getOrCreateMeta('name', 'twitter:description').setAttribute('content', description);
    if (image)        getOrCreateMeta('name', 'twitter:image').setAttribute('content', image);

    // ── 기본 description ──
    if (description) getOrCreateMeta('name', 'description').setAttribute('content', description);
  }

  /**
   * JSON-LD 구조화 데이터를 <head>에 주입한다.
   * Organization, WebSite, WebPage 세 가지 스키마를 지원한다.
   * @param {Object} data
   * @param {Object} data.organization  — Organization 스키마 데이터
   * @param {Object} [data.website]     — WebSite 스키마 데이터 (optional override)
   * @param {Object} [data.webpage]     — WebPage 스키마 데이터 (optional override)
   */
  function setStructuredData(data) {
    const { organization = {}, website = {}, webpage = {} } = data;

    // 기존 주입된 JSON-LD 스크립트 제거 (중복 방지)
    document.querySelectorAll('script[type="application/ld+json"][data-seo]').forEach(function (el) {
      el.parentNode.removeChild(el);
    });

    const schemas = [];

    // ── Organization ──
    if (organization.name) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: organization.name,
        url: organization.url || '',
        logo: {
          '@type': 'ImageObject',
          url: organization.logo || '',
        },
        description: organization.description || '',
        sameAs: organization.sameAs || [],
      });
    }

    // ── WebSite ──
    const websiteSchema = Object.assign(
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: organization.name || '',
        url: organization.url || '',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: (organization.url || '') + '/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      website
    );
    schemas.push(websiteSchema);

    // ── WebPage ──
    const webpageSchema = Object.assign(
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: getCanonicalHref(organization.url),
        name: document.title || '',
        description: '',
        isPartOf: { '@type': 'WebSite', url: organization.url || '' },
        inLanguage: 'ko',
      },
      webpage
    );
    schemas.push(webpageSchema);

    // DOM 삽입
    schemas.forEach(function (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', '');
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });
  }

  /**
   * canonical 링크 태그를 설정한다.
   * @param {string} [baseUrl] — organization.url (file:// 환경 fallback)
   */
  function setCanonicalURL(baseUrl) {
    const href = getCanonicalHref(baseUrl);
    if (!href) return;
    const link = getOrCreateLink('canonical');
    link.setAttribute('href', href);
  }

  /**
   * 동적으로 페이지 <title>을 업데이트한다.
   * @param {string} title
   */
  function setPageTitle(title) {
    if (title) document.title = title;
  }

  /**
   * seo-config.json을 fetch하여 현재 페이지에 맞는 설정을 반환한다.
   * @param {string} [configPath] — 설정 파일 경로 (기본: SEO_CONFIG_PATH)
   * @returns {Promise<Object>} resolved config
   */
  function loadConfig(configPath) {
    const path = configPath || SEO_CONFIG_PATH;
    return fetch(path)
      .then(function (res) {
        if (!res.ok) throw new Error('[SEO] Config fetch failed: ' + res.status);
        return res.json();
      });
  }

  /**
   * 페이지별 SEO 설정을 적용하는 메인 초기화 함수.
   *
   * 사용 예시 (페이지별 오버라이드):
   *   initSEO({ pageOverride: { title: '커스텀 제목', description: '커스텀 설명' } });
   *
   * @param {Object} [config]
   * @param {string} [config.configPath]      — seo-config.json 경로 오버라이드
   * @param {Object} [config.pageOverride]    — 현재 페이지 설정 오버라이드
   * @param {boolean} [config.skipStructuredData] — JSON-LD 주입 건너뜀
   * @returns {Promise<void>}
   */
  function initSEO(config) {
    config = config || {};

    return loadConfig(config.configPath)
      .then(function (seoConfig) {
        const defaults = seoConfig.default || {};
        const pages    = seoConfig.pages   || {};
        const org      = seoConfig.organization || {};

        const currentPath = getCurrentPath();
        const pageCfg    = pages[currentPath] || {};

        // 페이지별 오버라이드 병합 (우선순위: override > pageCfg > defaults)
        const merged = Object.assign({}, defaults, pageCfg, config.pageOverride || {});

        // 1. 페이지 제목
        if (merged.title) setPageTitle(merged.title);

        // 2. canonical URL
        setCanonicalURL(org.url);

        // 3. OG + Twitter Card 메타태그
        setMetaTags(
          Object.assign({}, merged, {
            url: getCanonicalHref(org.url),
            site_name: merged.site_name || org.name || defaults.site_name || '',
          })
        );

        // 4. JSON-LD 구조화 데이터
        if (!config.skipStructuredData) {
          setStructuredData({
            organization: org,
            webpage: {
              name: merged.title || document.title,
              description: merged.description || '',
            },
          });
        }
      })
      .catch(function (err) {
        console.warn('[SEO] 초기화 실패 — SEO 태그가 적용되지 않았습니다.', err);
      });
  }

  // ─────────────────────────────────────────
  // 전역 노출
  // ─────────────────────────────────────────
  window.SEO = {
    initSEO: initSEO,
    setMetaTags: setMetaTags,
    setStructuredData: setStructuredData,
    setCanonicalURL: setCanonicalURL,
    setPageTitle: setPageTitle,
  };
})();
