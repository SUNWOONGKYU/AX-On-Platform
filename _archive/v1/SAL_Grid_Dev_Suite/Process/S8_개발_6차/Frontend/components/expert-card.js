// @task S8F3
// expert-card.js — 전문가 카드 UI 컴포넌트
// AX-On Platform | 다크 테마 기반 전문가 카드 렌더링

// ─────────────────────────────────────────────
// 디자인 토큰 (다크 테마)
// ─────────────────────────────────────────────
const THEME = {
  bg: '#1a1a2e',
  bgCard: '#16213e',
  bgCardHover: '#0f3460',
  accent: '#6c5ce7',
  accentLight: '#a29bfe',
  textPrimary: '#e0e0e0',
  textSecondary: '#a0a0b0',
  badgeBg: 'rgba(108, 92, 231, 0.18)',
  badgeBorder: 'rgba(108, 92, 231, 0.45)',
  ratingColor: '#fdcb6e',
  availableColor: '#00b894',
  unavailableColor: '#636e72',
};

// ─────────────────────────────────────────────
// 내부 헬퍼
// ─────────────────────────────────────────────

/**
 * 평점을 별 아이콘 문자열로 변환한다 (최대 5개).
 * @param {number} rating
 * @returns {string}
 */
function _renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '★'.repeat(full) +
    (half ? '½' : '') +
    '☆'.repeat(empty)
  );
}

/**
 * 숫자에 천 단위 쉼표를 적용한다.
 * @param {number} n
 * @returns {string}
 */
function _fmt(n) {
  return Number(n).toLocaleString('ko-KR');
}

/**
 * XSS 방지를 위해 문자열을 이스케이프한다.
 * @param {string} str
 * @returns {string}
 */
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────
// Public: 단일 카드 HTML 생성
// ─────────────────────────────────────────────

/**
 * 전문가 객체로부터 카드 HTML 문자열을 생성한다.
 * @param {object} expert
 * @returns {string} HTML
 */
function renderExpertCard(expert) {
  const availableLabel = expert.available
    ? `<span class="ax-badge ax-badge--available">상담 가능</span>`
    : `<span class="ax-badge ax-badge--unavailable">상담 불가</span>`;

  const specialtyBadges = (expert.specialty || [])
    .map((s) => `<span class="ax-tag">${_esc(s)}</span>`)
    .join('');

  const tagBadges = (expert.tags || [])
    .map((t) => `<span class="ax-tag ax-tag--sm">${_esc(t)}</span>`)
    .join('');

  return `
<article class="ax-expert-card" data-expert-id="${_esc(expert.id)}" style="
  background: ${THEME.bgCard};
  border: 1px solid rgba(108, 92, 231, 0.2);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
  color: ${THEME.textPrimary};
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  cursor: pointer;
" onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(108,92,231,0.25)'"
   onmouseleave="this.style.transform='';this.style.boxShadow=''">

  <!-- 헤더: 이미지 + 이름 + 직함 -->
  <div class="ax-card-header" style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
    <img
      src="${_esc(expert.image)}"
      alt="${_esc(expert.name)} 프로필"
      onerror="this.src='/assets/images/experts/default-avatar.png'"
      style="
        width: 72px; height: 72px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid ${THEME.accent};
        background: ${THEME.bg};
      "
    />
    <div>
      <h3 style="margin:0 0 4px; font-size:1.1rem; font-weight:700; color:${THEME.textPrimary};">
        ${_esc(expert.name)}
      </h3>
      <p style="margin:0; font-size:0.85rem; color:${THEME.textSecondary};">
        ${_esc(expert.title)}
      </p>
      <div style="margin-top:6px;">${availableLabel}</div>
    </div>
  </div>

  <!-- 전문 분야 태그 -->
  <div class="ax-specialty-tags" style="margin-bottom:12px; display:flex; flex-wrap:wrap; gap:6px;">
    ${specialtyBadges}
  </div>

  <!-- 바이오 -->
  <p class="ax-bio" style="
    font-size:0.85rem;
    color:${THEME.textSecondary};
    line-height:1.6;
    margin:0 0 16px;
    display:-webkit-box;
    -webkit-line-clamp:3;
    -webkit-box-orient:vertical;
    overflow:hidden;
  ">${_esc(expert.bio)}</p>

  <!-- 통계 -->
  <div class="ax-stats" style="
    display:grid; grid-template-columns:repeat(3, 1fr);
    gap:8px; margin-bottom:16px;
    background:rgba(255,255,255,0.04);
    border-radius:10px; padding:12px;
  ">
    <div style="text-align:center;">
      <div style="font-size:1.1rem; font-weight:700; color:${THEME.accentLight};">
        ${_fmt(expert.experience_years)}년
      </div>
      <div style="font-size:0.72rem; color:${THEME.textSecondary};">경력</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:1.1rem; font-weight:700; color:${THEME.accentLight};">
        ${_fmt(expert.projects_count)}건
      </div>
      <div style="font-size:0.72rem; color:${THEME.textSecondary};">프로젝트</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:1.1rem; font-weight:700; color:${THEME.ratingColor};">
        ${expert.rating}
      </div>
      <div style="font-size:0.72rem; color:${THEME.textSecondary};">${_renderStars(expert.rating)}</div>
    </div>
  </div>

  <!-- 태그 -->
  <div class="ax-tags" style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:16px;">
    ${tagBadges}
  </div>

  <!-- 문의하기 버튼 -->
  <a
    href="mailto:${_esc(expert.social?.email || '')}"
    class="ax-btn-inquiry"
    style="
      display:block; text-align:center;
      background: ${expert.available ? THEME.accent : THEME.unavailableColor};
      color:#fff;
      border:none; border-radius:8px;
      padding:10px 0; font-size:0.9rem; font-weight:600;
      text-decoration:none;
      pointer-events:${expert.available ? 'auto' : 'none'};
      opacity:${expert.available ? '1' : '0.5'};
      transition:background 0.2s;
    "
    ${!expert.available ? 'aria-disabled="true"' : ''}
  >
    ${expert.available ? '문의하기' : '현재 상담 불가'}
  </a>
</article>
  `.trim();
}

// ─────────────────────────────────────────────
// Public: 목록 렌더링
// ─────────────────────────────────────────────

/**
 * 전문가 배열을 지정 컨테이너에 카드 목록으로 렌더링한다.
 * @param {object[]} experts
 * @param {HTMLElement|string} container — DOM 요소 또는 CSS 선택자
 */
function renderExpertList(experts, container) {
  const el =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!el) {
    console.warn('[expert-card] 컨테이너를 찾을 수 없습니다:', container);
    return;
  }

  if (!experts || experts.length === 0) {
    el.innerHTML = `
      <div style="
        text-align:center; padding:64px 24px;
        color:${THEME.textSecondary}; font-size:0.95rem;
      ">
        조건에 맞는 전문가가 없습니다.
      </div>
    `;
    return;
  }

  el.innerHTML = experts.map(renderExpertCard).join('');
}

// ─────────────────────────────────────────────
// Public: 상세 프로필 렌더링
// ─────────────────────────────────────────────

/**
 * 전문가 상세 프로필 HTML 문자열을 생성한다.
 * @param {object} expert
 * @returns {string} HTML
 */
function renderExpertDetail(expert) {
  const specialtyBadges = (expert.specialty || [])
    .map((s) => `<span class="ax-tag">${_esc(s)}</span>`)
    .join('');

  const tagBadges = (expert.tags || [])
    .map((t) => `<span class="ax-tag ax-tag--sm">${_esc(t)}</span>`)
    .join('');

  const linkedinLink =
    expert.social?.linkedin && expert.social.linkedin !== '#'
      ? `<a href="${_esc(expert.social.linkedin)}" target="_blank" rel="noopener" style="color:${THEME.accentLight};">LinkedIn 프로필</a>`
      : '';

  return `
<section class="ax-expert-detail" style="
  background: ${THEME.bgCard};
  border-radius: 20px;
  padding: 40px;
  color: ${THEME.textPrimary};
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  max-width: 720px;
  margin: 0 auto;
">
  <!-- 상단: 이미지 + 기본 정보 -->
  <div style="display:flex; gap:32px; align-items:flex-start; margin-bottom:32px; flex-wrap:wrap;">
    <img
      src="${_esc(expert.image)}"
      alt="${_esc(expert.name)} 프로필"
      onerror="this.src='/assets/images/experts/default-avatar.png'"
      style="
        width:120px; height:120px;
        border-radius:50%; object-fit:cover;
        border:3px solid ${THEME.accent};
        flex-shrink:0;
      "
    />
    <div style="flex:1; min-width:200px;">
      <h2 style="margin:0 0 6px; font-size:1.6rem; font-weight:800;">
        ${_esc(expert.name)}
      </h2>
      <p style="margin:0 0 12px; color:${THEME.textSecondary}; font-size:1rem;">
        ${_esc(expert.title)}
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
        ${specialtyBadges}
      </div>
      <div style="display:flex; gap:16px; font-size:0.85rem; color:${THEME.textSecondary};">
        <span>경력 <strong style="color:${THEME.accentLight};">${_fmt(expert.experience_years)}년</strong></span>
        <span>프로젝트 <strong style="color:${THEME.accentLight};">${_fmt(expert.projects_count)}건</strong></span>
        <span>평점 <strong style="color:${THEME.ratingColor};">${expert.rating} ${_renderStars(expert.rating)}</strong></span>
      </div>
    </div>
  </div>

  <!-- 소개 -->
  <div style="margin-bottom:28px;">
    <h4 style="margin:0 0 10px; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.08em; color:${THEME.accent};">소개</h4>
    <p style="margin:0; line-height:1.8; color:${THEME.textSecondary};">${_esc(expert.bio)}</p>
  </div>

  <!-- 태그 -->
  <div style="margin-bottom:32px;">
    <h4 style="margin:0 0 10px; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.08em; color:${THEME.accent};">태그</h4>
    <div style="display:flex; flex-wrap:wrap; gap:6px;">${tagBadges}</div>
  </div>

  <!-- SNS / 연락처 -->
  <div style="margin-bottom:32px; font-size:0.9rem; display:flex; gap:16px; flex-wrap:wrap;">
    ${linkedinLink}
    <a href="mailto:${_esc(expert.social?.email || '')}" style="color:${THEME.accentLight};">
      ${_esc(expert.social?.email || '')}
    </a>
  </div>

  <!-- 문의하기 버튼 -->
  <a
    href="mailto:${_esc(expert.social?.email || '')}"
    style="
      display:inline-block;
      background:${expert.available ? THEME.accent : THEME.unavailableColor};
      color:#fff; border-radius:10px;
      padding:14px 40px; font-size:1rem; font-weight:700;
      text-decoration:none;
      pointer-events:${expert.available ? 'auto' : 'none'};
      opacity:${expert.available ? '1' : '0.5'};
    "
    ${!expert.available ? 'aria-disabled="true"' : ''}
  >
    ${expert.available ? '프로젝트 문의하기' : '현재 상담 불가'}
  </a>
</section>
  `.trim();
}

// ─────────────────────────────────────────────
// 공통 스타일 (document.head 자동 주입)
// ─────────────────────────────────────────────

(function _injectStyles() {
  if (
    typeof document === 'undefined' ||
    document.getElementById('ax-expert-card-styles')
  )
    return;

  const style = document.createElement('style');
  style.id = 'ax-expert-card-styles';
  style.textContent = `
    .ax-tag {
      display: inline-block;
      background: ${THEME.badgeBg};
      border: 1px solid ${THEME.badgeBorder};
      color: ${THEME.accentLight};
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .ax-tag--sm {
      padding: 2px 8px;
      font-size: 0.72rem;
    }
    .ax-badge {
      display: inline-block;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .ax-badge--available {
      background: rgba(0, 184, 148, 0.15);
      color: ${THEME.availableColor};
      border: 1px solid rgba(0, 184, 148, 0.35);
    }
    .ax-badge--unavailable {
      background: rgba(99, 110, 114, 0.15);
      color: ${THEME.unavailableColor};
      border: 1px solid rgba(99, 110, 114, 0.35);
    }
  `;
  document.head.appendChild(style);
})();

// ─────────────────────────────────────────────
// 모듈 Export (ESM & CommonJS 겸용 guard)
// ─────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderExpertCard,
    renderExpertList,
    renderExpertDetail,
  };
}
