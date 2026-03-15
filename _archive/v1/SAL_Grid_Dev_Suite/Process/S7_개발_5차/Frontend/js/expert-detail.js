// @task S7F5
// @description 전문가 상세 페이지 로직 — URL slug 기반 데이터 로드, SEO 업데이트, 소셜 공유

'use strict';

/* ═══════════════════════════════════════════════
   전역 상태
═══════════════════════════════════════════════ */
let supabaseClient = null;
let currentExpert = null;

/* ═══════════════════════════════════════════════
   초기화
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  initNavAuth();
  initMobileNav();
  initShareButtons();

  const slug = getSlugFromUrl();
  if (!slug) {
    showError('잘못된 접근', '전문가 정보를 찾을 수 없습니다.');
    return;
  }

  await loadExpertData(slug);
});

/* ═══════════════════════════════════════════════
   Supabase 초기화
═══════════════════════════════════════════════ */
function initSupabase() {
  try {
    if (typeof window.supabase !== 'undefined' && typeof AXON_CONFIG !== 'undefined') {
      supabaseClient = window.supabase.createClient(
        AXON_CONFIG.SUPABASE_URL,
        AXON_CONFIG.SUPABASE_ANON_KEY
      );
    }
  } catch (e) {
    console.error('[expert-detail] Supabase 초기화 실패:', e);
  }
}

/* ═══════════════════════════════════════════════
   URL에서 slug 파라미터 추출
═══════════════════════════════════════════════ */
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

/* ═══════════════════════════════════════════════
   Supabase experts 테이블에서 전문가 조회
═══════════════════════════════════════════════ */
async function loadExpertData(slug) {
  showLoading(true);

  try {
    let expert = null;

    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('experts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[expert-detail] Supabase 조회 오류:', error);
      }
      expert = data;
    }

    // Supabase 조회 실패 또는 미연결 시 목업 데이터 사용
    if (!expert) {
      expert = getMockExpert(slug);
    }

    if (!expert) {
      showError('전문가를 찾을 수 없습니다', '요청하신 전문가 프로필이 존재하지 않거나 삭제되었을 수 있습니다.');
      return;
    }

    currentExpert = expert;
    renderExpertPage(expert);
    updateSeoForExpert(expert);

  } catch (err) {
    console.error('[expert-detail] 데이터 로드 실패:', err);
    showError('오류가 발생했습니다', '잠시 후 다시 시도해주세요.');
  } finally {
    showLoading(false);
  }
}

/* ═══════════════════════════════════════════════
   SEO 메타 태그 + JSON-LD 업데이트
═══════════════════════════════════════════════ */
function updateSeoForExpert(expert) {
  const SeoUtils = window.SeoUtils;
  if (!SeoUtils) {
    console.warn('[expert-detail] SeoUtils를 찾을 수 없습니다.');
    return;
  }

  const pageUrl = generateCanonicalUrlForExpert(expert.slug);
  const imageUrl = expert.profile_image || 'https://ax-on.vercel.app/images/og-default.png';
  const title = `${expert.name} — AI 전문가 | AX-On Platform`;
  const description = expert.tagline || expert.bio || `${expert.name} 전문가의 프로필을 확인하세요.`;

  // 메타 태그 업데이트
  SeoUtils.updateMetaTags({
    title,
    description,
    image: imageUrl,
    url: pageUrl,
    type: 'profile',
    twitterCard: 'summary_large_image'
  });

  // Canonical URL 설정
  SeoUtils.generateCanonicalUrl(pageUrl);

  // Person JSON-LD
  const sameAsLinks = buildSameAsLinks(expert);
  SeoUtils.generateExpertJsonLd({
    name: expert.name,
    jobTitle: expert.job_title || expert.tagline || '',
    description: expert.bio || expert.tagline || '',
    image: imageUrl,
    url: pageUrl,
    sameAs: sameAsLinks,
    worksFor: expert.organization || null
  });

  // Breadcrumb JSON-LD
  SeoUtils.generateBreadcrumbJsonLd([
    { name: 'AX-On Platform', url: 'https://ax-on.vercel.app' },
    { name: 'AI 전문가', url: 'https://ax-on.vercel.app/expert.html' },
    { name: expert.name, url: pageUrl }
  ]);
}

/** 전문가 canonical URL 생성 */
function generateCanonicalUrlForExpert(slug) {
  return `https://ax-on.vercel.app/pages/experts/expert-detail.html?slug=${slug}`;
}

/** sameAs 링크 배열 빌드 */
function buildSameAsLinks(expert) {
  const links = [];
  if (expert.linkedin_url) links.push(expert.linkedin_url);
  if (expert.github_url) links.push(expert.github_url);
  if (expert.twitter_url) links.push(expert.twitter_url);
  if (expert.website_url) links.push(expert.website_url);
  return links;
}

/* ═══════════════════════════════════════════════
   전문가 프로필 UI 렌더링
═══════════════════════════════════════════════ */
function renderExpertPage(expert) {
  const content = document.getElementById('pageContent');
  if (!content) return;

  content.innerHTML = buildProfileHtml(expert);

  // 렌더 후 배지 섹션 표시
  const badgeSection = document.getElementById('badgeSection');
  if (badgeSection) badgeSection.style.display = '';

  // 섹션 페이드인 애니메이션
  requestAnimationFrame(() => {
    content.querySelectorAll('.fade-in').forEach((el, idx) => {
      el.style.animationDelay = `${idx * 0.08}s`;
    });
  });
}

/** 전체 프로필 HTML 생성 */
function buildProfileHtml(e) {
  return `
    <!-- 프로필 히어로 -->
    <section class="profile-hero fade-in">
      <div class="profile-hero-inner">
        <div class="profile-avatar-wrap">
          <img
            class="profile-avatar"
            src="${escHtml(e.profile_image || '')}"
            alt="${escHtml(e.name)} 프로필 사진"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23e8f4f8%22/%3E%3Ctext x=%2250%22 y=%2256%22 text-anchor=%22middle%22 font-size=%2240%22 fill=%22%235a5f7d%22%3E${encodeURIComponent((e.name || '?')[0])}%3C/text%3E%3C/svg%3E'"
            loading="eager"
          >
          <div class="profile-badge" aria-hidden="true">✓</div>
        </div>

        <h1 class="profile-name">${escHtml(e.name)}</h1>
        <p class="profile-tagline">${escHtml(e.tagline || e.job_title || '')}</p>

        ${buildTagsHtml(e)}

        <div class="profile-actions">
          <a href="../../enrollment.html?expert=${escHtml(e.slug)}" class="btn btn-primary">
            📩 수업 신청
          </a>
          <a href="../../expert.html" class="btn btn-outline">← 전문가 목록</a>
        </div>
      </div>
    </section>

    <hr class="section-divider">

    <!-- 소개 -->
    ${e.bio ? `
    <section class="section fade-in">
      <h2 class="section-title">소개</h2>
      <p class="about-text">${escHtmlMultiline(e.bio)}</p>
    </section>
    <hr class="section-divider">
    ` : ''}

    <!-- 전문 분야 -->
    ${buildExpertiseSection(e)}

    <!-- 자격/인증 -->
    ${buildCertSection(e)}

    <!-- 경력 -->
    ${buildCareerSection(e)}

    <!-- 활동 내역 (강의/프로젝트) -->
    ${buildActivitiesSection(e)}

    <!-- 소셜 공유 -->
    <section class="section fade-in">
      <h2 class="section-title">이 전문가 공유하기</h2>
      <div class="share-buttons" role="group" aria-label="소셜 공유">
        <button class="share-btn share-kakao" data-platform="kakao" aria-label="카카오톡으로 공유">
          <span class="share-icon">💬</span> 카카오톡
        </button>
        <button class="share-btn share-facebook" data-platform="facebook" aria-label="페이스북으로 공유">
          <span class="share-icon">📘</span> 페이스북
        </button>
        <button class="share-btn share-twitter" data-platform="twitter" aria-label="트위터로 공유">
          <span class="share-icon">🐦</span> 트위터
        </button>
        <button class="share-btn share-clipboard" data-platform="clipboard" aria-label="링크 복사">
          <span class="share-icon">🔗</span> 링크 복사
        </button>
      </div>
      <p class="share-copy-msg" id="shareCopyMsg" aria-live="polite"></p>
    </section>
    <hr class="section-divider">
  `;
}

/** 태그 HTML */
function buildTagsHtml(e) {
  const industryTags = (e.industry_tags || []).map(t =>
    `<span class="profile-tag industry">${escHtml(t)}</span>`).join('');
  const fnTags = (e.function_tags || []).map(t =>
    `<span class="profile-tag function">${escHtml(t)}</span>`).join('');

  if (!industryTags && !fnTags) return '';
  return `<div class="profile-tags">${industryTags}${fnTags}</div>`;
}

/** 전문 분야 섹션 */
function buildExpertiseSection(e) {
  const items = e.expertise || [];
  if (!items.length) return '';

  const html = items.map(item => `
    <div class="expertise-item">
      <span class="expertise-icon">${escHtml(item.icon || '🔹')}</span>
      <span>${escHtml(item.name || item)}</span>
    </div>
  `).join('');

  return `
    <section class="section fade-in">
      <h2 class="section-title">전문 분야</h2>
      <div class="expertise-grid">${html}</div>
    </section>
    <hr class="section-divider">
  `;
}

/** 자격/인증 섹션 */
function buildCertSection(e) {
  const certs = e.certifications || [];
  if (!certs.length) return '';

  const html = certs.map(cert => `
    <div class="cert-item">
      <div class="cert-icon">🏅</div>
      <div class="cert-content">
        <div class="cert-name">${escHtml(cert.name || cert)}</div>
        ${cert.issuer ? `<div class="cert-issuer">${escHtml(cert.issuer)}</div>` : ''}
        ${cert.year ? `<div class="cert-year">${escHtml(String(cert.year))}</div>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <section class="section fade-in">
      <h2 class="section-title">보유 자격 / 인증</h2>
      <div class="cert-list">${html}</div>
    </section>
    <hr class="section-divider">
  `;
}

/** 경력 섹션 */
function buildCareerSection(e) {
  const careers = e.careers || [];
  if (!careers.length) return '';

  const html = careers.map(c => `
    <div class="career-item">
      <div class="career-period">${escHtml(c.period || '')}</div>
      <div class="career-content">
        <div class="career-company">${escHtml(c.company || '')}</div>
        <div class="career-role">${escHtml(c.role || '')}</div>
      </div>
    </div>
  `).join('');

  return `
    <section class="section fade-in">
      <h2 class="section-title">경력</h2>
      <div class="career-list">${html}</div>
    </section>
    <hr class="section-divider">
  `;
}

/** 활동 내역 섹션 */
function buildActivitiesSection(e) {
  const activities = e.activities || [];
  if (!activities.length) return '';

  const html = activities.map(a => `
    <div class="portfolio-card">
      <div class="portfolio-emoji">${escHtml(a.emoji || '📌')}</div>
      <div class="portfolio-title">${escHtml(a.title || '')}</div>
      <p class="portfolio-desc">${escHtml(a.description || '')}</p>
      ${(a.tags || []).length ? `
        <div class="portfolio-tags">
          ${a.tags.map(t => `<span class="portfolio-tag">${escHtml(t)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <section class="section fade-in">
      <h2 class="section-title">활동 내역</h2>
      <div class="portfolio-grid">${html}</div>
    </section>
    <hr class="section-divider">
  `;
}

/* ═══════════════════════════════════════════════
   소셜 공유 버튼 이벤트
═══════════════════════════════════════════════ */
function initShareButtons() {
  // 동적 렌더링 후 이벤트 위임
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-platform]');
    if (!btn) return;

    const platform = btn.dataset.platform;
    if (!currentExpert) return;

    const pageUrl = generateCanonicalUrlForExpert(currentExpert.slug);

    if (window.SeoUtils) {
      window.SeoUtils.shareToSocial(platform, {
        title: `${currentExpert.name} — AI 전문가 | AX-On Platform`,
        description: currentExpert.tagline || currentExpert.bio || '',
        url: pageUrl,
        image: currentExpert.profile_image || 'https://ax-on.vercel.app/images/og-default.png'
      });
    }
  });

  // 클립보드 복사 성공/실패 피드백
  document.addEventListener('seo:copy-success', () => showShareMsg('링크가 복사되었습니다!', 'success'));
  document.addEventListener('seo:copy-error', () => showShareMsg('복사 실패. 직접 URL을 복사해주세요.', 'error'));
}

function showShareMsg(msg, type) {
  const el = document.getElementById('shareCopyMsg');
  if (!el) return;
  el.textContent = msg;
  el.className = `share-copy-msg ${type}`;
  setTimeout(() => {
    el.textContent = '';
    el.className = 'share-copy-msg';
  }, 3000);
}

/* ═══════════════════════════════════════════════
   Nav 인증 상태
═══════════════════════════════════════════════ */
async function initNavAuth() {
  if (!supabaseClient) return;
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const navRight = document.getElementById('navRight');
    if (!navRight) return;

    if (session?.user) {
      const displayName = session.user.user_metadata?.full_name ||
                          session.user.email?.split('@')[0] || '사용자';
      navRight.innerHTML = `
        <span class="nav-user-name">${escHtml(displayName)}</span>
        <button class="nav-logout-btn" id="logoutBtn">로그아웃</button>
      `;
      document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
      });
    }
  } catch (err) {
    console.error('[expert-detail] auth 초기화 실패:', err);
  }
}

/* ═══════════════════════════════════════════════
   모바일 Nav 토글
═══════════════════════════════════════════════ */
function initMobileNav() {
  const toggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ═══════════════════════════════════════════════
   로딩 / 에러 상태
═══════════════════════════════════════════════ */
function showLoading(show) {
  const loadingEl = document.getElementById('loadingState');
  if (loadingEl) loadingEl.style.display = show ? '' : 'none';
}

function showError(title, desc) {
  const content = document.getElementById('pageContent');
  if (!content) return;
  content.innerHTML = `
    <div class="page-error">
      <div class="page-error-icon">😕</div>
      <div class="page-error-title">${escHtml(title)}</div>
      <p class="page-error-desc">${escHtml(desc)}</p>
      <a href="../../expert.html" class="page-error-link">← AI 전문가 목록으로</a>
    </div>
  `;
}

/* ═══════════════════════════════════════════════
   목업 데이터 (Supabase 미연결 시 개발/데모용)
═══════════════════════════════════════════════ */
function getMockExpert(slug) {
  const mockExperts = {
    'kim-ai-expert': {
      slug: 'kim-ai-expert',
      name: '김AI전문',
      job_title: 'AI 비즈니스 전략가',
      tagline: '기업 AI 전환(AX)을 이끄는 실전 전문가',
      bio: '20년 이상 IT 및 경영 컨설팅 경력을 바탕으로, 다수의 기업 AI 전환 프로젝트를 성공적으로 이끌었습니다. 특히 중소·중견기업의 실질적인 AI 도입 전략 수립에 강점이 있습니다.',
      profile_image: '',
      organization: 'AX-On Platform',
      industry_tags: ['제조', '유통/물류'],
      function_tags: ['AI 전략', '자동화'],
      expertise: [
        { icon: '🤖', name: 'AI 전략 컨설팅' },
        { icon: '📊', name: '데이터 분석' },
        { icon: '🏭', name: '제조 스마트화' },
        { icon: '📋', name: '업무 자동화 (RPA)' }
      ],
      certifications: [
        { name: 'PMP (Project Management Professional)', issuer: 'PMI', year: 2018 },
        { name: 'AWS Certified Solutions Architect', issuer: 'Amazon', year: 2022 }
      ],
      careers: [
        { period: '2020 — 현재', company: 'AX-On Platform', role: 'AI 전문가 / 수석 컨설턴트' },
        { period: '2015 — 2020', company: '대한IT그룹', role: 'IT 전략 팀장' },
        { period: '2008 — 2015', company: 'McKinsey & Company', role: '시니어 컨설턴트' }
      ],
      activities: [
        {
          emoji: '🎓',
          title: '시니어 AI 창업 실전 과정',
          description: 'AI 툴을 활용한 사업 아이디어 발굴부터 MVP 출시까지의 전 과정을 커버하는 8주 집중 교육 프로그램.',
          tags: ['AI 창업', '비즈니스 모델', 'MVP']
        },
        {
          emoji: '🏗️',
          title: '중견 물류기업 AX 프로젝트',
          description: '물류 센터 입출고 자동화 및 수요 예측 AI 모델 구축. 운영 비용 23% 절감 달성.',
          tags: ['물류 AI', '예측 모델', '자동화']
        }
      ],
      linkedin_url: 'https://linkedin.com/in/kim-ai-expert',
      github_url: '',
      twitter_url: '',
      website_url: ''
    }
  };

  return mockExperts[slug] || null;
}

/* ═══════════════════════════════════════════════
   유틸리티
═══════════════════════════════════════════════ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escHtmlMultiline(str) {
  return escHtml(str).replace(/\n/g, '<br>');
}
