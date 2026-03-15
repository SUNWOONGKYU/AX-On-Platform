// @task S6F11, S6F7
// @description 이메일 하드코딩 제거 — CONTACT_EMAIL, SUPPORT_EMAIL 상수 추가
// @area Frontend
// @stage S6

/**
 * AX-On Platform — Shared Configuration
 *
 * [S5F3 변경 사항]
 * DEPLOYMENT_DOMAIN 상수를 추가하여 OG 메타태그 및 소셜 공유 URL을
 * 단일 위치에서 관리할 수 있도록 함.
 *
 * [S6F11 변경 사항]
 * CONTACT_EMAIL, SUPPORT_EMAIL 상수를 추가하여 프로덕션 코드에
 * 하드코딩된 이메일 주소를 단일 위치에서 관리하도록 함.
 *
 * 향후 이메일 변경 시 아래 값만 수정하면 전체 반영됨.
 *
 * 사용 예시 (JavaScript에서 동적 이메일 삽입 시):
 *   document.querySelector('.contact-email').textContent = AXON_CONFIG.CONTACT_EMAIL;
 *   document.querySelector('a.mailto').href = 'mailto:' + AXON_CONFIG.CONTACT_EMAIL;
 */

// 배포 도메인 상수 (도메인 변경 시 이 값만 수정)
const DEPLOYMENT_DOMAIN = 'https://ax-on.vercel.app';

const AXON_CONFIG = {
  // 배포 도메인
  DEPLOYMENT_DOMAIN,

  // OG 기본 이미지
  OG_DEFAULT_IMAGE: DEPLOYMENT_DOMAIN + '/images/og-default.png',

  // 연락처 이메일 (이메일 변경 시 이 값만 수정)
  CONTACT_EMAIL: 'contact@ax-on.net',
  SUPPORT_EMAIL: 'support@ax-on.net',

  // OG URL 헬퍼 — 페이지 경로를 받아 정식 OG URL 반환
  getOGUrl: function (path) {
    if (!path) path = '/';
    if (path.charAt(0) !== '/') path = '/' + path;
    return DEPLOYMENT_DOMAIN + path;
  },

  // Vercel 환경변수에서 주입 (api/env-config.js 엔드포인트 또는 HTML meta 태그)
  SUPABASE_URL: document.querySelector('meta[name="supabase-url"]')?.content || '',
  SUPABASE_ANON_KEY: document.querySelector('meta[name="supabase-anon-key"]')?.content || '',
};

// 유틸리티 함수
function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isSafeUrl(url) {
  try { return /^https?:\/\//i.test(new URL(url).href); } catch { return false; }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateKoreanPhone(phone) {
  return /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone);
}
