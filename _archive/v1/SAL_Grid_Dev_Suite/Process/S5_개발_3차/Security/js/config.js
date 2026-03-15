// @task S5S1
// @description Supabase 키를 환경 변수로 분리
// @area Security
// @stage S5

/**
 * AX-On Platform — Shared Configuration (보안 개선 버전)
 *
 * [변경 사항] 하드코딩된 Supabase 키를 제거하고
 * Vercel 환경변수에서 주입하는 방식으로 전환.
 *
 * 주입 방식:
 *   1) HTML <head>에 meta 태그로 주입 (권장):
 *      <meta name="supabase-url"      content="{{ process.env.SUPABASE_URL }}">
 *      <meta name="supabase-anon-key" content="{{ process.env.SUPABASE_ANON_KEY }}">
 *
 *   2) api/env-config.js 서버리스 함수로 런타임 fetch:
 *      const cfg = await fetch('/api/env-config').then(r => r.json());
 */

const AXON_CONFIG = {
  // Vercel 환경변수에서 주입 (api/env-config.js 엔드포인트 또는 HTML meta 태그)
  SUPABASE_URL: document.querySelector('meta[name="supabase-url"]')?.content || '',
  SUPABASE_ANON_KEY: document.querySelector('meta[name="supabase-anon-key"]')?.content || '',
};

// 유틸리티 함수 (기존 그대로 유지)
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
