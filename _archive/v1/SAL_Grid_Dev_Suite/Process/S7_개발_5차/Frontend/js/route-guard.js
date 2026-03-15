// @task S7S1
// 관리자 라우트 보호 (페이지 접근 제어)

import { getCurrentUserRole, canAccess } from './auth-utils.js';
import { supabase } from '/js/config.js';

/**
 * 현재 페이지 경로에 대해 접근 권한을 확인합니다.
 * - /admin 경로가 아니면 항상 통과
 * - 로그인되지 않은 경우 로그인 페이지로 리디렉션
 * - 역할이 부족한 경우 403 페이지로 리디렉션
 * @returns {Promise<boolean>} 접근 허용 여부
 */
export async function guardRoute() {
  const currentPath = window.location.pathname;

  // 관리자 경로가 아니면 통과
  if (!currentPath.startsWith('/admin')) return true;

  // 로그인 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(currentPath);
    return false;
  }

  // 역할 확인
  const role = await getCurrentUserRole();
  if (!canAccess(role, currentPath)) {
    window.location.href = '/pages/403.html';
    return false;
  }

  return true;
}

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', async () => {
  await guardRoute();
});
