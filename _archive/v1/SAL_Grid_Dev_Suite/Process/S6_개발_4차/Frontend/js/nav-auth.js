// @task S6F12 — 네비게이션 인증 상태 공통 모듈
// 모든 페이지에서 중복되던 checkAuth / handleLogout 로직을 통합

/**
 * HTML 특수문자를 이스케이프하여 XSS 방지
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * 네비게이션 인증 상태 초기화
 * - 로그인 상태: 사용자 이름 + 로그아웃 버튼 표시
 * - 비로그인 상태: 로그인/회원가입 버튼 유지
 *
 * @param {object} supabaseClient - Supabase 클라이언트 인스턴스
 */
async function initNavAuth(supabaseClient) {
  if (!supabaseClient) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const displayName = user.user_metadata?.full_name
      || user.user_metadata?.name
      || user.email.split('@')[0];

    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    // 로그인/회원가입 버튼 숨김
    const loginBtn = navRight.querySelector('.nav-login');
    const signupBtn = navRight.querySelector('.nav-signup');
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';

    // 사용자 이름 + 로그아웃 버튼 삽입
    const userEl = document.createElement('div');
    userEl.className = 'nav-user';
    userEl.innerHTML =
      '<span class="nav-user-name">' + escapeHtml(displayName) + '님</span>' +
      '<button class="nav-logout-btn" onclick="handleLogout()">로그아웃</button>';
    navRight.insertBefore(userEl, navRight.querySelector('.mobile-toggle'));

    // 모바일 인증 영역 업데이트
    const mobileAuth = document.querySelector('.nav-mobile-auth');
    if (mobileAuth) {
      mobileAuth.innerHTML =
        '<span style="font-size:14px;font-weight:600;color:var(--ink);padding:8px 16px;">' +
        escapeHtml(displayName) + '님</span>' +
        '<a href="#" class="nav-mobile-login" onclick="handleLogout();return false;">로그아웃</a>';
    }
  } catch (e) {
    // 미인증 상태 — 기본 UI 유지
  }
}

/**
 * 로그아웃 처리
 */
async function handleLogout() {
  if (typeof supabase !== 'undefined') {
    await supabase.auth.signOut();
    location.reload();
  }
}

// DOM 로드 완료 시 자동 초기화
document.addEventListener('DOMContentLoaded', function() {
  if (typeof supabase !== 'undefined') {
    initNavAuth(supabase);
  }
});
