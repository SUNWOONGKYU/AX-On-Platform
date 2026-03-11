// @task S5S1
// AX-On Platform — Shared Configuration
// Supabase 키는 환경 변수로 분리 — /api/config 엔드포인트에서 동적 로드

const AXON_CONFIG = {
  SUPABASE_URL: null,
  SUPABASE_ANON_KEY: null,
  _initialized: false,
  _initPromise: null,

  async init() {
    if (this._initialized) return this;
    if (this._initPromise) return this._initPromise;

    this._initPromise = fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error('Config fetch failed: ' + res.status);
        return res.json();
      })
      .then(data => {
        this.SUPABASE_URL = data.supabaseUrl;
        this.SUPABASE_ANON_KEY = data.supabaseAnonKey;
        this._initialized = true;
        return this;
      })
      .catch(err => {
        console.error('[AXON_CONFIG] 설정 로드 실패:', err);
        throw err;
      });

    return this._initPromise;
  }
};

// Shared utility functions
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
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

// 관리자 Nav 링크 삽입 (admin이면 Nav에 "관리자" 링크 표시)
function injectAdminLink(user, basePath) {
  if (!user || user.app_metadata?.role !== 'admin') return;
  const prefix = basePath || '';
  // 데스크톱: nav-links 마지막에 추가
  const navLinksEl = document.querySelector('.nav-links');
  if (navLinksEl && !navLinksEl.querySelector('.nav-admin-link')) {
    const a = document.createElement('a');
    a.href = prefix + 'pages/admin/admin.html';
    a.className = 'nav-admin-link';
    a.textContent = '관리자';
    a.style.cssText = 'color:#e85d4a;font-weight:700;';
    // nav-mobile-auth 앞에 삽입
    const mobileAuth = navLinksEl.querySelector('.nav-mobile-auth');
    if (mobileAuth) navLinksEl.insertBefore(a, mobileAuth);
    else navLinksEl.appendChild(a);
  }
}
