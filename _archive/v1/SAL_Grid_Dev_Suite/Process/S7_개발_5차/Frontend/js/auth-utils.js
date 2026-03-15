// @task S7S1
// 역할 확인 유틸리티 함수

import { supabase } from '/js/config.js';

/**
 * 현재 로그인한 사용자의 역할을 반환합니다.
 * @returns {Promise<string|null>} 'user' | 'moderator' | 'admin' | null (비로그인)
 */
export async function getCurrentUserRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return 'user';
  return data.role;
}

/**
 * 현재 사용자가 admin인지 확인합니다.
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const role = await getCurrentUserRole();
  return role === 'admin';
}

/**
 * 현재 사용자가 moderator 이상인지 확인합니다.
 * (admin도 moderator 권한 포함)
 * @returns {Promise<boolean>}
 */
export async function isModerator() {
  const role = await getCurrentUserRole();
  return role === 'moderator' || role === 'admin';
}

/**
 * 주어진 역할이 requiredRole 이상의 권한을 가지는지 확인합니다.
 * 역할 계층: user(0) < moderator(1) < admin(2)
 * @param {string} userRole - 현재 사용자 역할
 * @param {string} requiredRole - 필요한 최소 역할
 * @returns {boolean}
 */
export function hasRole(userRole, requiredRole) {
  const hierarchy = { user: 0, moderator: 1, admin: 2 };
  return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0);
}

/**
 * 주어진 역할로 특정 라우트에 접근할 수 있는지 확인합니다.
 * - adminRoutes: admin 전용 (moderatorRoutes 제외)
 * - moderatorRoutes: moderator 이상 접근 가능
 * - 그 외 라우트: 모두 접근 가능
 * @param {string} userRole - 현재 사용자 역할
 * @param {string} route - 접근하려는 경로
 * @returns {boolean}
 */
export function canAccess(userRole, route) {
  const adminRoutes = [
    '/admin/enrollments', '/admin/inquiries', '/admin/reports',
    '/admin/blocked-users', '/admin/users', '/admin/courses',
    '/admin/analytics', '/admin/dashboard'
  ];
  const moderatorRoutes = ['/admin/reports', '/admin/inquiries'];

  if (adminRoutes.includes(route)) {
    if (moderatorRoutes.includes(route)) return hasRole(userRole, 'moderator');
    return hasRole(userRole, 'admin');
  }
  return true;
}
