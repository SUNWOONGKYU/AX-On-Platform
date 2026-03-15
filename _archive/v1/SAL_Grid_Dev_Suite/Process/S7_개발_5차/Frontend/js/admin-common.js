// @task S7F11
// @description 관리자 공통 JS — 인증 체크, 사이드바 활성화, 공통 유틸
// @reused-by S7F6, S7F7, S7F8, S7F12, S7F13

'use strict';

/* =====================================================
   전역 상태
   ===================================================== */
let _supabase = null;
let _currentAdmin = null;

/**
 * Supabase 클라이언트 초기화 (lazy)
 * @returns {object} Supabase client
 */
function getSupabaseClient() {
  if (_supabase) return _supabase;
  if (!window.supabase) {
    console.error('[AdminCommon] Supabase JS client not loaded');
    return null;
  }
  _supabase = window.supabase.createClient(
    AXON_CONFIG.SUPABASE_URL,
    AXON_CONFIG.SUPABASE_ANON_KEY
  );
  return _supabase;
}

/* =====================================================
   인증 체크
   ===================================================== */

/**
 * checkAdminAuth()
 * - 로그인 여부 확인
 * - profiles 테이블에서 role === 'admin' 확인
 * - 비관리자/비로그인 → 메인으로 리다이렉트
 * @returns {Promise<object|null>} 관리자 프로필 객체 또는 null
 */
async function checkAdminAuth() {
  const sb = getSupabaseClient();
  if (!sb) {
    window.location.href = '/';
    return null;
  }

  try {
    const { data: { session }, error: sessionErr } = await sb.auth.getSession();

    if (sessionErr || !session) {
      _redirectToMain('로그인이 필요합니다.');
      return null;
    }

    const { data: profile, error: profileErr } = await sb
      .from('profiles')
      .select('id, email, full_name, role, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (profileErr || !profile) {
      _redirectToMain('프로필 정보를 불러올 수 없습니다.');
      return null;
    }

    if (profile.role !== 'admin') {
      _redirectToMain('관리자 권한이 필요합니다.');
      return null;
    }

    _currentAdmin = profile;

    // 헤더 관리자 이름 업데이트
    const nameEl = document.getElementById('adminName');
    if (nameEl) {
      nameEl.textContent = profile.full_name || profile.email || '관리자';
    }

    const avatarEl = document.getElementById('adminAvatar');
    if (avatarEl) {
      const initials = _getInitials(profile.full_name || profile.email || 'A');
      avatarEl.textContent = initials;
      if (profile.avatar_url) {
        avatarEl.style.backgroundImage = `url(${profile.avatar_url})`;
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.textContent = '';
      }
    }

    return profile;
  } catch (err) {
    console.error('[AdminCommon] checkAdminAuth error:', err);
    _redirectToMain();
    return null;
  }
}

/**
 * 현재 로그인한 관리자 정보 반환 (캐시)
 * @returns {object|null}
 */
function getCurrentAdmin() {
  return _currentAdmin;
}

/**
 * 로그아웃
 */
async function adminLogout() {
  const sb = getSupabaseClient();
  if (sb) {
    await sb.auth.signOut();
  }
  window.location.href = '/pages/auth/login.html';
}

function _redirectToMain(msg) {
  if (msg) sessionStorage.setItem('ax_redirect_msg', msg);
  window.location.href = '/';
}

function _getInitials(name) {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/* =====================================================
   사이드바
   ===================================================== */

/**
 * initSidebar()
 * - 현재 URL 기반으로 사이드바 활성 항목 표시
 * - 토글(접기/펼치기) 이벤트 연결
 * - 모바일 오버레이 처리
 */
function initSidebar() {
  _markActiveSidebarItem();
  _bindSidebarToggle();
  _bindLogoutBtn();
  _bindMobileMenu();
}

/**
 * 현재 경로에 맞는 사이드바 항목 활성화
 */
function _markActiveSidebarItem() {
  const path = window.location.pathname;
  const items = document.querySelectorAll('.sidebar-item[data-path]');

  items.forEach(item => {
    item.classList.remove('active');
    const itemPath = item.getAttribute('data-path');
    if (!itemPath) return;

    // 정확히 일치하거나 해당 경로로 시작하는 경우
    if (path === itemPath || (itemPath !== '/pages/admin/' && path.startsWith(itemPath))) {
      item.classList.add('active');
    }
  });

  // data-path 없이 href로 처리하는 경우
  const links = document.querySelectorAll('.sidebar-item[href]');
  links.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href) return;
    if (path === href || (href !== '/pages/admin/' && path.startsWith(href))) {
      link.classList.add('active');
    }
  });
}

/**
 * 사이드바 토글 바인딩
 */
function _bindSidebarToggle() {
  const sidebar = document.getElementById('adminSidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  if (!sidebar || !toggleBtn) return;

  const STORAGE_KEY = 'ax_admin_sidebar_collapsed';
  const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const collapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem(STORAGE_KEY, collapsed);
  });
}

/**
 * 로그아웃 버튼 바인딩
 */
function _bindLogoutBtn() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await adminLogout();
    }
  });
}

/**
 * 모바일 메뉴 바인딩
 */
function _bindMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!menuBtn || !sidebar) return;

  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }
}

/* =====================================================
   숫자 / 날짜 포맷 유틸
   ===================================================== */

/**
 * formatNumber(n)
 * 숫자를 천 단위 콤마 형식으로 반환
 * @param {number|string} n
 * @returns {string} "1,234,567"
 */
function formatNumber(n) {
  const num = Number(n);
  if (isNaN(num)) return '0';
  return num.toLocaleString('ko-KR');
}

/**
 * formatCompactNumber(n)
 * 큰 숫자 축약 (1200 → 1.2k, 1500000 → 1.5M)
 * @param {number} n
 * @returns {string}
 */
function formatCompactNumber(n) {
  const num = Number(n);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

/**
 * formatDate(dateStr, options)
 * 날짜 문자열을 사람이 읽기 좋은 형식으로 변환
 * @param {string} dateStr
 * @param {'short'|'long'|'relative'} [mode='short']
 * @returns {string}
 */
function formatDate(dateStr, mode = 'short') {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';

  if (mode === 'relative') {
    return _relativeTime(d);
  }

  const opts = mode === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };

  return d.toLocaleDateString('ko-KR', opts);
}

/**
 * 상대 시간 반환 ("3분 전", "2시간 전" 등)
 * @param {Date} d
 * @returns {string}
 */
function _relativeTime(d) {
  const now = Date.now();
  const diff = now - d.getTime(); // ms

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60)  return '방금 전';
  if (min < 60)  return `${min}분 전`;
  if (hr < 24)   return `${hr}시간 전`;
  if (day < 7)   return `${day}일 전`;
  return formatDate(d.toISOString(), 'short');
}

/**
 * formatDateTime(dateStr)
 * "YYYY.MM.DD HH:mm" 포맷
 * @param {string} dateStr
 * @returns {string}
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* =====================================================
   트렌드 계산
   ===================================================== */

/**
 * calcTrend(current, previous)
 * 이전 기간 대비 증감률 계산
 * @param {number} current
 * @param {number} previous
 * @returns {{ pct: number, direction: 'up'|'down'|'neutral', label: string }}
 */
function calcTrend(current, previous) {
  if (!previous || previous === 0) {
    return { pct: 0, direction: 'neutral', label: '-' };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(pct) * 10) / 10;
  const direction = pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'neutral';
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—';
  return { pct: rounded, direction, label: `${arrow} ${rounded}%` };
}

/* =====================================================
   토스트 알림
   ===================================================== */

/**
 * showToast(message, type, duration)
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 * @param {number} [duration=3000]
 */
function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  // 강제 reflow → 애니메이션 트리거
  void toast.offsetHeight;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, duration);
}

/* =====================================================
   Supabase 쿼리 헬퍼
   ===================================================== */

/**
 * fetchCount(table, filter)
 * Supabase 테이블 COUNT 쿼리
 * @param {string} table - 테이블명
 * @param {object|null} filter - 예) { status: 'pending' }
 * @returns {Promise<number>}
 */
async function fetchCount(table, filter = null) {
  const sb = getSupabaseClient();
  if (!sb) return 0;
  try {
    let query = sb.from(table).select('*', { count: 'exact', head: true });
    if (filter) {
      Object.entries(filter).forEach(([col, val]) => {
        query = query.eq(col, val);
      });
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error(`[AdminCommon] fetchCount(${table}) error:`, err);
    return 0;
  }
}

/**
 * fetchRows(table, options)
 * 일반 데이터 패치
 * @param {string} table
 * @param {{ select, filter, order, limit }} options
 * @returns {Promise<Array>}
 */
async function fetchRows(table, {
  select = '*',
  filter = null,
  order = null,
  limit = 50,
} = {}) {
  const sb = getSupabaseClient();
  if (!sb) return [];
  try {
    let query = sb.from(table).select(select).limit(limit);
    if (filter) {
      Object.entries(filter).forEach(([col, val]) => {
        query = query.eq(col, val);
      });
    }
    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? false });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error(`[AdminCommon] fetchRows(${table}) error:`, err);
    return [];
  }
}

/* =====================================================
   DOM 유틸
   ===================================================== */

/**
 * el(selector, ctx)
 * querySelector 단축
 */
function el(selector, ctx = document) {
  return ctx.querySelector(selector);
}

/**
 * els(selector, ctx)
 * querySelectorAll 단축 → 배열
 */
function els(selector, ctx = document) {
  return [...ctx.querySelectorAll(selector)];
}

/**
 * setText(selector, text, ctx)
 * 요소의 텍스트 설정 (없으면 무시)
 */
function setText(selector, text, ctx = document) {
  const elem = ctx.querySelector(selector);
  if (elem) elem.textContent = text;
}

/**
 * HTML 이스케이프
 * config.js에 정의되어 있으나 독립 사용 보장용 로컬 정의
 */
function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* =====================================================
   KPI 카드 업데이트 헬퍼
   ===================================================== */

/**
 * updateKpiCard(id, value, trend)
 * KPI 카드 수치 및 트렌드 업데이트
 * @param {string} id - 카드의 data-kpi 값
 * @param {number} value
 * @param {{ direction, label }} [trendInfo]
 */
function updateKpiCard(id, value, trendInfo = null) {
  const card = document.querySelector(`[data-kpi="${id}"]`);
  if (!card) return;

  const valueEl = card.querySelector('.kpi-value');
  if (valueEl) valueEl.textContent = formatNumber(value);

  if (trendInfo) {
    const trendEl = card.querySelector('.kpi-trend');
    if (trendEl) {
      trendEl.textContent = trendInfo.label;
      trendEl.className = `kpi-trend ${trendInfo.direction}`;
    }
  }
}

/* =====================================================
   페이지 초기화 헬퍼
   ===================================================== */

/**
 * initAdminPage(options)
 * 관리자 페이지 공통 초기화
 * - 인증 체크 → 사이드바 초기화 → 콜백 실행
 * @param {{ onReady }} options
 */
async function initAdminPage({ onReady } = {}) {
  const profile = await checkAdminAuth();
  if (!profile) return; // 리다이렉트 처리됨

  initSidebar();

  if (typeof onReady === 'function') {
    await onReady(profile);
  }
}

/* =====================================================
   공개 API (전역 노출)
   ===================================================== */
window.AdminCommon = {
  // 인증
  checkAdminAuth,
  getCurrentAdmin,
  adminLogout,

  // 사이드바
  initSidebar,

  // 포맷
  formatNumber,
  formatCompactNumber,
  formatDate,
  formatDateTime,
  calcTrend,

  // UI
  showToast,
  updateKpiCard,

  // Supabase
  getSupabaseClient,
  fetchCount,
  fetchRows,

  // DOM
  el,
  els,
  setText,
  escapeHtml,

  // 통합 초기화
  initAdminPage,
};
