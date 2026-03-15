// @task S5F3
// @description OG 메타태그 도메인 수정 — DEPLOYMENT_DOMAIN 상수 추가
// @area Frontend
// @stage S5

/**
 * AX-On Platform — Shared Configuration
 *
 * [S5F3 변경 사항]
 * DEPLOYMENT_DOMAIN 상수를 추가하여 OG 메타태그 및 소셜 공유 URL을
 * 단일 위치에서 관리할 수 있도록 함.
 *
 * 향후 도메인 변경 시 DEPLOYMENT_DOMAIN 값만 수정하면 전체 반영됨.
 *
 * 사용 예시 (JavaScript에서 동적 OG 태그 생성 시):
 *   document.querySelector('meta[property="og:url"]').content
 *     = DEPLOYMENT_DOMAIN + '/' + pagePath;
 *   document.querySelector('meta[property="og:image"]').content
 *     = DEPLOYMENT_DOMAIN + '/images/og-default.png';
 */

// 배포 도메인 상수 (도메인 변경 시 이 값만 수정)
const DEPLOYMENT_DOMAIN = 'https://ax-on.vercel.app';

const AXON_CONFIG = {
  // 배포 도메인
  DEPLOYMENT_DOMAIN,

  // OG 기본 이미지
  OG_DEFAULT_IMAGE: DEPLOYMENT_DOMAIN + '/images/og-default.png',

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
