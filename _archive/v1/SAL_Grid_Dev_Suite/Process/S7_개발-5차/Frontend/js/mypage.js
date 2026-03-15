// @task S7F2
// AX-On Platform — 마이페이지 공통 JS
// Supabase CRUD, 탭 전환, 프로필 업데이트, 활동내역 페이지네이션, 설정 UPSERT

'use strict';

// ────────────────────────────────────────────────
// State
// ────────────────────────────────────────────────
let db = null;
let currentUser = null;
let currentProfile = null;

// Pagination state per tab
const pagination = {
  enrollments: { page: 1, perPage: 10, total: 0 },
  posts:       { page: 1, perPage: 10, total: 0 },
  comments:    { page: 1, perPage: 10, total: 0 }
};

// ────────────────────────────────────────────────
// Init — Supabase 연결 + 인증 확인
// ────────────────────────────────────────────────
async function mypageInit(options = {}) {
  try {
    await AXON_CONFIG.init();
    const { createClient } = supabase;
    db = createClient(AXON_CONFIG.SUPABASE_URL, AXON_CONFIG.SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('[mypage] config 로드 실패, fallback 시도:', err);
    if (window.__SUPABASE_URL__ && window.__SUPABASE_ANON_KEY__) {
      const { createClient } = supabase;
      db = createClient(window.__SUPABASE_URL__, window.__SUPABASE_ANON_KEY__);
    } else {
      redirectToLogin();
      return;
    }
  }

  const { data: { session } } = await db.auth.getSession();
  if (!session) { redirectToLogin(); return; }
  currentUser = session.user;

  // 세션 변화 감지
  db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') redirectToLogin();
  });

  // 프로필 공통 로드
  await loadProfile();

  // 페이지별 추가 초기화
  if (options.onReady) await options.onReady(db, currentUser, currentProfile);
}

function redirectToLogin() {
  const base = getPathBase();
  window.location.href = base + 'pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
}

// index.html → pages/mypage 관계에서 상대 경로 계산
function getPathBase() {
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  if (depth <= 1) return './';
  return '../'.repeat(depth - 1);
}

// ────────────────────────────────────────────────
// Profile CRUD
// ────────────────────────────────────────────────
async function loadProfile() {
  if (!db || !currentUser) return null;

  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[mypage] 프로필 로드 오류:', error);
  }

  currentProfile = data || {};
  renderProfileSummary();
  return currentProfile;
}

function renderProfileSummary() {
  if (!currentProfile) return;

  const name = currentProfile.display_name
    || currentProfile.username
    || currentUser.email?.split('@')[0]
    || '사용자';

  const roleLabels = { ai_expert: 'AI 전문가', company: '기업', general: '일반' };

  // 사이드바 / 헤더 공통 요소 업데이트 (존재할 때만)
  _setText('mpUserName', name);
  _setText('mpUserRole', roleLabels[currentProfile.role] || '일반');

  const avatarInitial = document.getElementById('mpAvatarInitial');
  const avatarImg = document.getElementById('mpAvatarImg');
  if (currentProfile.avatar_url) {
    if (avatarImg) { avatarImg.src = escapeHtml(currentProfile.avatar_url); avatarImg.style.display = 'block'; }
    if (avatarInitial) avatarInitial.style.display = 'none';
  } else {
    if (avatarInitial) { avatarInitial.textContent = name.charAt(0).toUpperCase(); avatarInitial.style.display = 'flex'; }
    if (avatarImg) avatarImg.style.display = 'none';
  }
}

async function saveProfile(updates) {
  if (!db || !currentUser) throw new Error('미인증 상태');
  const payload = { id: currentUser.id, ...updates, updated_at: new Date().toISOString() };
  const { error } = await db.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
  await loadProfile();
}

// ────────────────────────────────────────────────
// Avatar Upload (FileReader 미리보기 + Storage)
// ────────────────────────────────────────────────
function initAvatarUpload({ inputId, previewImgId, previewInitialId, onSuccess, onError }) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError?.('JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError?.('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // FileReader 미리보기
    const reader = new FileReader();
    reader.onload = (ev) => {
      const previewImg = document.getElementById(previewImgId);
      const previewInitial = document.getElementById(previewInitialId);
      if (previewImg) { previewImg.src = ev.target.result; previewImg.style.display = 'block'; }
      if (previewInitial) previewInitial.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Supabase Storage 업로드
    if (!db || !currentUser) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const path = `avatars/${currentUser.id}/avatar.${ext}`;

    const { error: uploadError } = await db.storage
      .from('community-images')
      .upload(path, file, { upsert: true });

    if (uploadError) { onError?.('업로드 실패: ' + uploadError.message); return; }

    const { data: urlData } = db.storage.from('community-images').getPublicUrl(path);
    if (!urlData?.publicUrl) { onError?.('URL 조회 실패'); return; }

    const { error: updateError } = await db.from('profiles')
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('id', currentUser.id);

    if (updateError) { onError?.('프로필 업데이트 실패: ' + updateError.message); return; }

    currentProfile.avatar_url = urlData.publicUrl;
    onSuccess?.('프로필 사진이 변경되었습니다.');
  });
}

// ────────────────────────────────────────────────
// Tab Switch (공통)
// ────────────────────────────────────────────────
function initTabs({ tabSelector, contentSelector, onChange }) {
  const tabs = document.querySelectorAll(tabSelector);
  const contents = document.querySelectorAll(contentSelector);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetEl = document.getElementById('tab-' + target);
      if (targetEl) targetEl.classList.add('active');

      onChange?.(target);
    });
  });
}

// ────────────────────────────────────────────────
// Activity — 수강 내역
// ────────────────────────────────────────────────
async function loadEnrollments(page = 1) {
  if (!db || !currentUser) return;
  const state = pagination.enrollments;
  state.page = page;

  const from = (page - 1) * state.perPage;
  const to = from + state.perPage - 1;

  const { data, error, count } = await db
    .from('course_enrollments')
    .select('*, courses(title, thumbnail_url, category)', { count: 'exact' })
    .eq('user_id', currentUser.id)
    .order('enrolled_at', { ascending: false })
    .range(from, to);

  state.total = count || 0;

  return { data: data || [], error, total: state.total };
}

// ────────────────────────────────────────────────
// Activity — 작성 게시글
// ────────────────────────────────────────────────
async function loadPosts(page = 1) {
  if (!db || !currentUser) return;
  const state = pagination.posts;
  state.page = page;

  const from = (page - 1) * state.perPage;
  const to = from + state.perPage - 1;

  const { data, error, count } = await db
    .from('community_posts')
    .select('id, title, category, created_at, view_count, like_count', { count: 'exact' })
    .eq('author_id', currentUser.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  state.total = count || 0;

  return { data: data || [], error, total: state.total };
}

// ────────────────────────────────────────────────
// Activity — 작성 댓글
// ────────────────────────────────────────────────
async function loadComments(page = 1) {
  if (!db || !currentUser) return;
  const state = pagination.comments;
  state.page = page;

  const from = (page - 1) * state.perPage;
  const to = from + state.perPage - 1;

  const { data, error, count } = await db
    .from('community_comments')
    .select('id, content, created_at, community_posts(id, title)', { count: 'exact' })
    .eq('author_id', currentUser.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to);

  state.total = count || 0;

  return { data: data || [], error, total: state.total };
}

// ────────────────────────────────────────────────
// Pagination 렌더링 헬퍼
// ────────────────────────────────────────────────
function renderPagination(containerId, state, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(state.total / state.perPage);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '<div class="pagination">';

  // 이전
  if (state.page > 1) {
    html += `<button class="page-btn" onclick="${onPageChange}(${state.page - 1})">&#8249;</button>`;
  }

  // 페이지 번호 (최대 7개 표시)
  const start = Math.max(1, state.page - 3);
  const end = Math.min(totalPages, start + 6);

  for (let i = start; i <= end; i++) {
    const active = i === state.page ? ' active' : '';
    html += `<button class="page-btn${active}" onclick="${onPageChange}(${i})">${i}</button>`;
  }

  // 다음
  if (state.page < totalPages) {
    html += `<button class="page-btn" onclick="${onPageChange}(${state.page + 1})">&#8250;</button>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

// ────────────────────────────────────────────────
// Settings — 알림 설정 UPSERT
// ────────────────────────────────────────────────
async function loadUserSettings() {
  if (!db || !currentUser) return null;

  const { data, error } = await db
    .from('user_settings')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[mypage] 설정 로드 오류:', error);
    return null;
  }
  return data || {};
}

async function saveUserSettings(settings) {
  if (!db || !currentUser) throw new Error('미인증 상태');

  const payload = {
    user_id: currentUser.id,
    ...settings,
    updated_at: new Date().toISOString()
  };

  const { error } = await db
    .from('user_settings')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) throw error;
}

// ────────────────────────────────────────────────
// Account Deletion (소프트 삭제)
// ────────────────────────────────────────────────
async function softDeleteAccount() {
  if (!db || !currentUser) throw new Error('미인증 상태');

  // profiles 테이블 소프트 삭제
  const { error: profileErr } = await db
    .from('profiles')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      display_name: '탈퇴한 사용자',
      username: null,
      avatar_url: null,
      bio: null
    })
    .eq('id', currentUser.id);

  if (profileErr) throw profileErr;

  // Supabase Auth 로그아웃
  await db.auth.signOut();
}

// ────────────────────────────────────────────────
// Logout
// ────────────────────────────────────────────────
async function handleLogout() {
  if (!db) return;
  await db.auth.signOut();
  redirectToLogin();
}

// ────────────────────────────────────────────────
// UI Helpers
// ────────────────────────────────────────────────
function showAlert(id, message, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = message;
  setTimeout(() => el.classList.remove('show'), 5000);
}

function showToast(message, type = 'success') {
  let toast = document.getElementById('mpToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mpToast';
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
      'padding:14px 20px', 'border-radius:12px', 'font-size:14px',
      'font-weight:600', 'box-shadow:0 8px 32px rgba(0,0,0,.15)',
      'transition:all .3s ease', 'max-width:320px'
    ].join(';');
    document.body.appendChild(toast);
  }
  const styles = {
    success: 'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7',
    error:   'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5',
    info:    'background:#dbeafe;color:#1e40af;border:1px solid #93c5fd'
  };
  toast.style.cssText += ';' + styles[type] || styles.success;
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 4000);
}

function setLoading(btnId, loading, label = '저장하기') {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? '처리 중...' : label;
}

function _setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', '년 ').replace('.', '월 ').replace('.', '일');
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
