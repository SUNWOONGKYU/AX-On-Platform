// @task S8F3
// experts-data.js — 전문가 데이터 관리 모듈
// AX-On Platform | 중앙 JSON 기반 전문가 데이터 로드 및 유틸리티

const EXPERTS_JSON_PATH = '/public/data/experts.json';
const CACHE_KEY = 'axon_experts_cache';

// ─────────────────────────────────────────────
// 내부 유틸
// ─────────────────────────────────────────────

/**
 * sessionStorage 캐시에서 데이터를 읽어온다.
 * @returns {object|null}
 */
function _getCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 데이터를 sessionStorage 캐시에 저장한다.
 * @param {object} data
 */
function _setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // 저장 실패 시 무시 (용량 초과 등)
  }
}

/**
 * fetch 실패 시 반환할 기본 빈 데이터
 * @returns {object}
 */
function _fallbackData() {
  return {
    experts: [],
    categories: [],
    updated_at: null,
    _fallback: true,
  };
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * JSON 파일에서 전문가 목록을 로드한다.
 * sessionStorage 캐시를 우선 사용하며, 없으면 fetch 후 캐싱한다.
 * @returns {Promise<object>} { experts, categories, updated_at }
 */
async function fetchExperts() {
  const cached = _getCache();
  if (cached) return cached;

  try {
    const response = await fetch(EXPERTS_JSON_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    _setCache(data);
    return data;
  } catch (err) {
    console.warn('[experts-data] fetch 실패, 기본 데이터 반환:', err.message);
    return _fallbackData();
  }
}

/**
 * id로 특정 전문가를 조회한다.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function getExpertById(id) {
  const { experts } = await fetchExperts();
  return experts.find((e) => e.id === id) ?? null;
}

/**
 * 전문 분야(specialty)로 전문가 목록을 필터링한다.
 * @param {string} specialty — 분야명 (부분 일치)
 * @returns {Promise<object[]>}
 */
async function filterBySpecialty(specialty) {
  const { experts } = await fetchExperts();
  if (!specialty) return experts;
  const lower = specialty.toLowerCase();
  return experts.filter((e) =>
    e.specialty.some((s) => s.toLowerCase().includes(lower))
  );
}

/**
 * 이름, 전문 분야, 태그를 대상으로 키워드 검색한다.
 * @param {string} query — 검색어
 * @returns {Promise<object[]>}
 */
async function searchExperts(query) {
  const { experts } = await fetchExperts();
  if (!query || !query.trim()) return experts;

  const lower = query.trim().toLowerCase();
  return experts.filter((e) => {
    const inName = e.name.toLowerCase().includes(lower);
    const inSpecialty = e.specialty.some((s) => s.toLowerCase().includes(lower));
    const inTags = e.tags.some((t) => t.toLowerCase().includes(lower));
    const inTitle = e.title.toLowerCase().includes(lower);
    return inName || inSpecialty || inTags || inTitle;
  });
}

/**
 * 전문가 목록을 지정 필드 기준으로 정렬한다.
 * @param {string} field — 'experience_years' | 'rating' | 'projects_count'
 * @param {'asc'|'desc'} order — 정렬 방향 (기본 desc)
 * @returns {Promise<object[]>}
 */
async function sortExperts(field = 'rating', order = 'desc') {
  const { experts } = await fetchExperts();
  const allowedFields = ['experience_years', 'rating', 'projects_count'];
  if (!allowedFields.includes(field)) {
    console.warn(`[experts-data] 정렬 불가 필드: ${field}. 허용: ${allowedFields.join(', ')}`);
    return experts;
  }

  return [...experts].sort((a, b) => {
    const diff = (a[field] ?? 0) - (b[field] ?? 0);
    return order === 'asc' ? diff : -diff;
  });
}

/**
 * sessionStorage 캐시를 수동으로 초기화한다.
 * (관리자 도구 또는 테스트 용도)
 */
function clearExpertsCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

// ─────────────────────────────────────────────
// 모듈 Export (ESM & CommonJS 겸용 guard)
// ─────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchExperts,
    getExpertById,
    filterBySpecialty,
    searchExperts,
    sortExperts,
    clearExpertsCache,
  };
}
