// @task S7F9
// 지식허브 JS — 카테고리 필터, 태그 클라우드, 검색, 정렬, 뷰 토글, 관련 콘텐츠 추천

'use strict';

/* ── Supabase 초기화 ──────────────────────────────── */
const SUPABASE_URL = window.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'your-anon-key';

let supabaseClient = null;
try {
  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn('[KnowledgeHub] Supabase init failed:', e.message);
}

/* ── 카테고리 구조 정의 ────────────────────────────── */
const CATEGORIES = [
  {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    slug: 'programming',
    children: [
      { id: 'javascript', name: 'JavaScript', slug: 'javascript', parentId: 'programming' },
      { id: 'python',     name: 'Python',     slug: 'python',     parentId: 'programming' },
      { id: 'java',       name: 'Java',        slug: 'java',       parentId: 'programming' },
      { id: 'cpp',        name: 'C++',         slug: 'cpp',        parentId: 'programming' }
    ]
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: '📊',
    slug: 'data-science',
    children: [
      { id: 'ml',            name: 'ML',            slug: 'ml',            parentId: 'data-science' },
      { id: 'deep-learning', name: 'Deep Learning', slug: 'deep-learning', parentId: 'data-science' },
      { id: 'data-analysis', name: 'Data Analysis', slug: 'data-analysis', parentId: 'data-science' }
    ]
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    icon: '🌐',
    slug: 'web-dev',
    children: [
      { id: 'frontend', name: 'Frontend', slug: 'frontend', parentId: 'web-dev' },
      { id: 'backend',  name: 'Backend',  slug: 'backend',  parentId: 'web-dev' },
      { id: 'devops-w', name: 'DevOps',   slug: 'devops-w', parentId: 'web-dev' }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: '🔧',
    slug: 'devops',
    children: [
      { id: 'docker', name: 'Docker', slug: 'docker', parentId: 'devops' },
      { id: 'k8s',    name: 'K8s',    slug: 'k8s',    parentId: 'devops' },
      { id: 'cicd',   name: 'CI/CD',  slug: 'cicd',   parentId: 'devops' }
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud',
    icon: '☁️',
    slug: 'cloud',
    children: [
      { id: 'aws',   name: 'AWS',   slug: 'aws',   parentId: 'cloud' },
      { id: 'gcp',   name: 'GCP',   slug: 'gcp',   parentId: 'cloud' },
      { id: 'azure', name: 'Azure', slug: 'azure', parentId: 'cloud' }
    ]
  }
];

/* ── 상태 관리 ─────────────────────────────────────── */
const state = {
  posts: [],
  filteredPosts: [],
  currentCategory: null,      // 선택된 대분류 slug
  currentSubCategory: null,   // 선택된 소분류 slug
  selectedTags: [],           // 선택된 태그 배열 (OR 필터)
  searchQuery: '',
  sortBy: 'latest',           // 'latest' | 'views' | 'likes'
  viewMode: 'card',           // 'card' | 'list'
  currentPage: 1,
  postsPerPage: 10,
  categoryCounts: {},         // { categorySlug: count }
  allTags: [],                // [{ id, name, slug, usage_count }]
  loading: false
};

/* ── 모의 데이터 (Supabase 연결 전 fallback) ─────── */
const MOCK_POSTS = [
  {
    id: '1', title: 'JavaScript async/await 완전 정복',
    excerpt: 'Promise 기반 비동기 처리를 async/await 문법으로 간결하게 작성하는 방법을 단계별로 알아봅니다.',
    category_slug: 'javascript', parent_category_slug: 'programming',
    author_name: '김철수', author_initials: '김',
    created_at: '2026-03-06T09:00:00Z', view_count: 1240, like_count: 87,
    tags: ['JavaScript', 'async', 'Promise'],
    url: '#post-1'
  },
  {
    id: '2', title: 'Python 데이터 분석 입문 — Pandas 기초',
    excerpt: 'Pandas DataFrame을 활용한 데이터 정제, 집계, 시각화 기초를 실습 중심으로 소개합니다.',
    category_slug: 'python', parent_category_slug: 'programming',
    author_name: '이영희', author_initials: '이',
    created_at: '2026-03-05T14:30:00Z', view_count: 980, like_count: 65,
    tags: ['Python', 'Pandas', 'DataAnalysis'],
    url: '#post-2'
  },
  {
    id: '3', title: 'Docker 컨테이너 네트워크 이해하기',
    excerpt: 'Docker bridge, host, overlay 네트워크 모드의 차이점과 올바른 사용 시나리오를 정리합니다.',
    category_slug: 'docker', parent_category_slug: 'devops',
    author_name: '박지민', author_initials: '박',
    created_at: '2026-03-04T11:00:00Z', view_count: 756, like_count: 42,
    tags: ['Docker', 'DevOps', 'Network'],
    url: '#post-3'
  },
  {
    id: '4', title: 'AWS Lambda + API Gateway 서버리스 패턴',
    excerpt: 'Lambda 함수와 API Gateway를 조합해 비용 효율적인 서버리스 백엔드를 구성하는 방법을 다룹니다.',
    category_slug: 'aws', parent_category_slug: 'cloud',
    author_name: '최유진', author_initials: '최',
    created_at: '2026-03-03T08:15:00Z', view_count: 1560, like_count: 110,
    tags: ['AWS', 'Lambda', 'Serverless'],
    url: '#post-4'
  },
  {
    id: '5', title: '딥러닝 첫걸음 — CNN 이미지 분류 실습',
    excerpt: 'TensorFlow/Keras로 합성곱 신경망을 구성하고 CIFAR-10 데이터셋으로 학습시키는 실습 가이드입니다.',
    category_slug: 'deep-learning', parent_category_slug: 'data-science',
    author_name: '강민준', author_initials: '강',
    created_at: '2026-03-02T16:00:00Z', view_count: 2100, like_count: 198,
    tags: ['DeepLearning', 'CNN', 'TensorFlow'],
    url: '#post-5'
  },
  {
    id: '6', title: 'React 18 Concurrent 기능 총정리',
    excerpt: 'Suspense, useTransition, useDeferredValue 등 React 18의 핵심 동시성 기능을 실제 예제로 비교합니다.',
    category_slug: 'frontend', parent_category_slug: 'web-dev',
    author_name: '서지현', author_initials: '서',
    created_at: '2026-03-01T10:00:00Z', view_count: 1820, like_count: 154,
    tags: ['React', 'Frontend', 'JavaScript'],
    url: '#post-6'
  },
  {
    id: '7', title: 'Kubernetes Pod 스케줄링 심화',
    excerpt: 'nodeSelector, affinity, taint/toleration을 활용해 클러스터 자원 배치를 최적화하는 방법을 설명합니다.',
    category_slug: 'k8s', parent_category_slug: 'devops',
    author_name: '오승현', author_initials: '오',
    created_at: '2026-02-28T13:45:00Z', view_count: 633, like_count: 38,
    tags: ['K8s', 'DevOps', 'Cloud'],
    url: '#post-7'
  },
  {
    id: '8', title: 'Java Stream API 활용 패턴 12가지',
    excerpt: 'Java 8 이후 도입된 Stream API의 실용적인 활용 패턴과 성능 고려사항을 정리한 레퍼런스입니다.',
    category_slug: 'java', parent_category_slug: 'programming',
    author_name: '윤태호', author_initials: '윤',
    created_at: '2026-02-27T09:30:00Z', view_count: 890, like_count: 71,
    tags: ['Java', 'Stream', 'FunctionalProgramming'],
    url: '#post-8'
  },
  {
    id: '9', title: 'GCP Cloud Run으로 컨테이너 배포하기',
    excerpt: 'Docker 이미지를 Cloud Run에 배포하고 트래픽 분할, 자동 스케일링을 설정하는 실습 튜토리얼입니다.',
    category_slug: 'gcp', parent_category_slug: 'cloud',
    author_name: '한소연', author_initials: '한',
    created_at: '2026-02-26T14:00:00Z', view_count: 420, like_count: 29,
    tags: ['GCP', 'Docker', 'Serverless'],
    url: '#post-9'
  },
  {
    id: '10', title: '머신러닝 모델 성능 평가 지표 완전 정리',
    excerpt: 'Precision, Recall, F1-Score, AUC-ROC 등 분류 모델 평가 지표의 개념과 선택 기준을 다룹니다.',
    category_slug: 'ml', parent_category_slug: 'data-science',
    author_name: '임현우', author_initials: '임',
    created_at: '2026-02-25T11:00:00Z', view_count: 1340, like_count: 92,
    tags: ['ML', 'ModelEvaluation', 'DataScience'],
    url: '#post-10'
  },
  {
    id: '11', title: 'GitHub Actions CI/CD 파이프라인 구축',
    excerpt: '코드 푸시부터 배포까지 자동화하는 GitHub Actions 워크플로우를 단계별로 설정하는 방법을 알아봅니다.',
    category_slug: 'cicd', parent_category_slug: 'devops',
    author_name: '홍길동', author_initials: '홍',
    created_at: '2026-02-24T08:00:00Z', view_count: 1100, like_count: 83,
    tags: ['CI/CD', 'GitHub', 'DevOps'],
    url: '#post-11'
  },
  {
    id: '12', title: 'Azure Functions와 Logic Apps 연동 가이드',
    excerpt: 'Azure의 서버리스 생태계에서 Functions와 Logic Apps를 함께 사용하는 아키텍처를 소개합니다.',
    category_slug: 'azure', parent_category_slug: 'cloud',
    author_name: '신민아', author_initials: '신',
    created_at: '2026-02-23T15:30:00Z', view_count: 310, like_count: 21,
    tags: ['Azure', 'Serverless', 'Cloud'],
    url: '#post-12'
  }
];

const MOCK_TAGS = [
  { id: 't1',  name: 'JavaScript',           slug: 'javascript',           usage_count: 45 },
  { id: 't2',  name: 'Python',               slug: 'python',               usage_count: 38 },
  { id: 't3',  name: 'Docker',               slug: 'docker',               usage_count: 32 },
  { id: 't4',  name: 'React',                slug: 'react',                usage_count: 28 },
  { id: 't5',  name: 'AWS',                  slug: 'aws',                  usage_count: 25 },
  { id: 't6',  name: 'ML',                   slug: 'ml',                   usage_count: 22 },
  { id: 't7',  name: 'DevOps',               slug: 'devops',               usage_count: 20 },
  { id: 't8',  name: 'K8s',                  slug: 'k8s',                  usage_count: 18 },
  { id: 't9',  name: 'DataScience',          slug: 'datascience',          usage_count: 17 },
  { id: 't10', name: 'Serverless',           slug: 'serverless',           usage_count: 15 },
  { id: 't11', name: 'CI/CD',                slug: 'cicd',                 usage_count: 14 },
  { id: 't12', name: 'DeepLearning',         slug: 'deeplearning',         usage_count: 12 },
  { id: 't13', name: 'Java',                 slug: 'java',                 usage_count: 11 },
  { id: 't14', name: 'Cloud',                slug: 'cloud',                usage_count: 10 },
  { id: 't15', name: 'FunctionalProgramming',slug: 'functionalprogramming',usage_count: 8  }
];

/* ── 유틸리티 ──────────────────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000)      return '방금 전';
  if (diff < 3600000)    return Math.floor(diff / 60000) + '분 전';
  if (diff < 86400000)   return Math.floor(diff / 3600000) + '시간 전';
  if (diff < 604800000)  return Math.floor(diff / 86400000) + '일 전';
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/* ── 카테고리 헬퍼 ─────────────────────────────────── */
function getCategoryBySlug(slug) {
  for (const cat of CATEGORIES) {
    if (cat.slug === slug) return cat;
    for (const sub of cat.children) {
      if (sub.slug === slug) return sub;
    }
  }
  return null;
}

function getParentCategory(childSlug) {
  for (const cat of CATEGORIES) {
    if (cat.children.some(c => c.slug === childSlug)) return cat;
  }
  return null;
}

/* ── 데이터 로드 ───────────────────────────────────── */
async function loadPosts() {
  if (!supabaseClient) {
    state.posts = MOCK_POSTS;
    state.allTags = MOCK_TAGS;
    computeCategoryCounts();
    return;
  }

  try {
    // 게시글 로드
    const { data: posts, error } = await supabaseClient
      .from('community_posts')
      .select(`
        id, title, content, category_slug, parent_category_slug,
        author_name, author_initials, created_at, view_count, like_count,
        post_tags ( tag_id, knowledge_tags ( name, slug ) )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    state.posts = (posts || []).map(p => ({
      ...p,
      tags: (p.post_tags || []).map(pt => pt.knowledge_tags?.name).filter(Boolean),
      url: `?post=${p.id}`
    }));

    // 태그 로드
    const { data: tags } = await supabaseClient
      .from('knowledge_tags')
      .select('id, name, slug, usage_count')
      .order('usage_count', { ascending: false })
      .limit(20);

    state.allTags = tags || [];
    computeCategoryCounts();
  } catch (err) {
    console.warn('[KnowledgeHub] Supabase load error, using mock data:', err.message);
    state.posts = MOCK_POSTS;
    state.allTags = MOCK_TAGS;
    computeCategoryCounts();
  }
}

function computeCategoryCounts() {
  const counts = {};
  for (const post of state.posts) {
    if (post.parent_category_slug) {
      counts[post.parent_category_slug] = (counts[post.parent_category_slug] || 0) + 1;
    }
    if (post.category_slug) {
      counts[post.category_slug] = (counts[post.category_slug] || 0) + 1;
    }
  }
  state.categoryCounts = counts;
}

/* ── 필터 & 정렬 로직 ──────────────────────────────── */
function applyFilters() {
  let result = [...state.posts];

  // 카테고리 필터 (소분류 우선, 없으면 대분류)
  if (state.currentSubCategory) {
    result = result.filter(p => p.category_slug === state.currentSubCategory);
  } else if (state.currentCategory) {
    result = result.filter(p => p.parent_category_slug === state.currentCategory);
  }

  // 태그 OR 필터
  if (state.selectedTags.length > 0) {
    const selected = state.selectedTags.map(t => t.toLowerCase());
    result = result.filter(p =>
      (p.tags || []).some(tag => selected.includes(tag.toLowerCase()))
    );
  }

  // 검색 필터
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // 정렬
  if (state.sortBy === 'views') {
    result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
  } else if (state.sortBy === 'likes') {
    result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
  } else {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  state.filteredPosts = result;
  state.currentPage = 1;
}

function getCurrentPagePosts() {
  const start = (state.currentPage - 1) * state.postsPerPage;
  return state.filteredPosts.slice(start, start + state.postsPerPage);
}

function getTotalPages() {
  return Math.ceil(state.filteredPosts.length / state.postsPerPage);
}

/* ── 관련 콘텐츠 추천 ──────────────────────────────── */
function getRelatedPosts(limit = 3) {
  const scored = state.posts
    .filter(p => {
      if (state.currentSubCategory) return p.id !== undefined;
      return true;
    })
    .map(p => {
      let score = 0;
      if (state.currentSubCategory && p.category_slug === state.currentSubCategory) score += 3;
      if (state.currentCategory && p.parent_category_slug === state.currentCategory) score += 2;
      if (state.selectedTags.length > 0) {
        const sel = state.selectedTags.map(t => t.toLowerCase());
        score += (p.tags || []).filter(t => sel.includes(t.toLowerCase())).length;
      }
      return { post: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.created_at) - new Date(a.post.created_at))
    .slice(0, limit)
    .map(item => item.post);

  // 점수 없으면 최신 글로
  if (scored.length === 0) {
    return [...state.posts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  return scored;
}

/* ── 렌더링 ────────────────────────────────────────── */
function renderCategorySidebar(sidebarEl) {
  if (!sidebarEl) return;

  const body = sidebarEl.querySelector('.kh-sidebar-body');
  if (!body) return;

  let html = '';

  // 전체 보기
  html += `
    <div class="kh-cat-item">
      <div class="kh-cat-parent ${!state.currentCategory ? 'active' : ''}"
           data-cat="" role="button" tabindex="0" aria-label="전체 보기">
        <div class="kh-cat-parent-left">
          <span class="kh-cat-icon">📋</span>
          <span class="kh-cat-name">전체</span>
        </div>
        <div class="kh-cat-right">
          <span class="kh-cat-badge">${state.posts.length}</span>
        </div>
      </div>
    </div>
  `;

  // 대분류별 렌더링
  for (const cat of CATEGORIES) {
    const isOpen = state.currentCategory === cat.slug;
    const count = state.categoryCounts[cat.slug] || 0;

    html += `
      <div class="kh-cat-item">
        <div class="kh-cat-parent ${isOpen ? 'active open' : ''}"
             data-cat="${escapeHtml(cat.slug)}" role="button" tabindex="0"
             aria-expanded="${isOpen}" aria-label="${escapeHtml(cat.name)} 카테고리">
          <div class="kh-cat-parent-left">
            <span class="kh-cat-icon">${cat.icon}</span>
            <span class="kh-cat-name">${escapeHtml(cat.name)}</span>
          </div>
          <div class="kh-cat-right">
            <span class="kh-cat-badge">${count}</span>
            <span class="kh-cat-chevron">&#9658;</span>
          </div>
        </div>
        <ul class="kh-sub-list ${isOpen ? 'open' : ''}" role="list">
    `;

    for (const sub of cat.children) {
      const subCount = state.categoryCounts[sub.slug] || 0;
      const isSubActive = state.currentSubCategory === sub.slug;
      html += `
          <li>
            <div class="kh-sub-item ${isSubActive ? 'active' : ''}"
                 data-sub="${escapeHtml(sub.slug)}" data-parent="${escapeHtml(cat.slug)}"
                 role="button" tabindex="0" aria-label="${escapeHtml(sub.name)}">
              <span class="kh-sub-name">${escapeHtml(sub.name)}</span>
              <span class="kh-sub-badge">${subCount}</span>
            </div>
          </li>
      `;
    }

    html += `
        </ul>
      </div>
    `;
  }

  body.innerHTML = html;

  // 이벤트 바인딩
  body.querySelectorAll('.kh-cat-parent').forEach(el => {
    el.addEventListener('click', () => {
      const slug = el.dataset.cat;
      if (slug === state.currentCategory && !state.currentSubCategory) {
        // 닫기
        state.currentCategory = null;
      } else {
        state.currentCategory = slug || null;
        state.currentSubCategory = null;
      }
      applyFilters();
      renderAll();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });

  body.querySelectorAll('.kh-sub-item').forEach(el => {
    el.addEventListener('click', () => {
      const sub = el.dataset.sub;
      const parent = el.dataset.parent;
      if (state.currentSubCategory === sub) {
        state.currentSubCategory = null;
      } else {
        state.currentCategory = parent;
        state.currentSubCategory = sub;
      }
      applyFilters();
      renderAll();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
}

function renderTagCloud(containerEl) {
  if (!containerEl) return;

  if (!state.allTags || state.allTags.length === 0) {
    containerEl.innerHTML = '<span style="font-size:13px;color:var(--ink-muted);">태그 없음</span>';
    return;
  }

  const maxCount = Math.max(...state.allTags.map(t => t.usage_count || 1));
  const minCount = Math.min(...state.allTags.map(t => t.usage_count || 1));
  const minSize = 12;
  const maxSize = 24;

  let html = '';
  for (const tag of state.allTags) {
    const count = tag.usage_count || 1;
    const ratio = maxCount === minCount ? 0.5 : (count - minCount) / (maxCount - minCount);
    const size = Math.round(minSize + ratio * (maxSize - minSize));
    const isSelected = state.selectedTags.includes(tag.name);

    html += `
      <span class="kh-tag ${isSelected ? 'selected' : ''}"
            data-tag="${escapeHtml(tag.name)}"
            style="font-size:${size}px;"
            role="checkbox" aria-checked="${isSelected}" tabindex="0"
            title="${escapeHtml(tag.name)} (${count})">
        #${escapeHtml(tag.name)}
        <span class="kh-tag-count">${count}</span>
      </span>
    `;
  }

  containerEl.innerHTML = html;

  containerEl.querySelectorAll('.kh-tag').forEach(el => {
    el.addEventListener('click', () => {
      const tagName = el.dataset.tag;
      toggleTag(tagName);
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
}

function toggleTag(tagName) {
  const idx = state.selectedTags.indexOf(tagName);
  if (idx === -1) {
    state.selectedTags.push(tagName);
  } else {
    state.selectedTags.splice(idx, 1);
  }
  applyFilters();
  renderAll();
}

function renderActiveFilters(containerEl) {
  if (!containerEl) return;
  if (state.selectedTags.length === 0) {
    containerEl.style.display = 'none';
    return;
  }

  containerEl.style.display = 'flex';
  let html = '<span class="kh-filter-label">필터:</span>';
  for (const tag of state.selectedTags) {
    html += `
      <span class="kh-filter-tag">
        #${escapeHtml(tag)}
        <button class="kh-filter-tag-remove" data-tag="${escapeHtml(tag)}"
                aria-label="${escapeHtml(tag)} 필터 제거">&times;</button>
      </span>
    `;
  }
  html += `<button class="kh-clear-filters">전체 초기화</button>`;
  containerEl.innerHTML = html;

  containerEl.querySelectorAll('.kh-filter-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => toggleTag(btn.dataset.tag));
  });
  containerEl.querySelector('.kh-clear-filters')?.addEventListener('click', () => {
    state.selectedTags = [];
    applyFilters();
    renderAll();
  });
}

function renderResultInfo(containerEl) {
  if (!containerEl) return;
  const total = state.filteredPosts.length;
  let categoryLabel = '';
  if (state.currentSubCategory) {
    const sub = getCategoryBySlug(state.currentSubCategory);
    categoryLabel = sub ? ` — ${sub.name}` : '';
  } else if (state.currentCategory) {
    const cat = getCategoryBySlug(state.currentCategory);
    categoryLabel = cat ? ` — ${cat.name}` : '';
  }
  containerEl.innerHTML = `<strong>${total}</strong>개의 게시글${categoryLabel}`;
}

function renderPostGrid(containerEl) {
  if (!containerEl) return;

  const posts = getCurrentPagePosts();

  if (state.loading) {
    containerEl.innerHTML = `
      <div class="kh-loading">
        <div class="kh-spinner"></div>
        <span>게시글 불러오는 중...</span>
      </div>
    `;
    return;
  }

  if (posts.length === 0) {
    containerEl.innerHTML = `
      <div class="kh-empty">
        <div class="kh-empty-icon">📭</div>
        <div class="kh-empty-text">게시글이 없습니다</div>
        <div class="kh-empty-sub">다른 카테고리나 태그를 선택해보세요</div>
      </div>
    `;
    return;
  }

  if (state.viewMode === 'list') {
    containerEl.className = 'kh-post-list';
    containerEl.innerHTML = posts.map(post => renderListItem(post)).join('');
  } else {
    containerEl.className = `kh-post-grid${state.filteredPosts.length === 1 ? ' single-col' : ''}`;
    containerEl.innerHTML = posts.map(post => renderCard(post)).join('');
  }
}

function renderCard(post) {
  const catSlug = post.category_slug || post.parent_category_slug || '';
  const catName = (getCategoryBySlug(catSlug) || {}).name || catSlug;
  const tags = (post.tags || []).slice(0, 3);

  return `
    <a class="kh-card" href="${escapeHtml(post.url || '#')}" aria-label="${escapeHtml(post.title)}">
      <div class="kh-card-top">
        <span class="kh-card-category">${escapeHtml(catName)}</span>
        <span class="kh-card-views">&#128065; ${formatNumber(post.view_count)}</span>
      </div>
      <h3 class="kh-card-title">${escapeHtml(post.title)}</h3>
      <p class="kh-card-excerpt">${escapeHtml(post.excerpt || '')}</p>
      ${tags.length ? `
        <div class="kh-card-tags">
          ${tags.map(t => `<span class="kh-card-tag">#${escapeHtml(t)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="kh-card-footer">
        <div class="kh-card-meta">
          <div class="kh-card-avatar">${escapeHtml(post.author_initials || '?')}</div>
          <span class="kh-card-author">${escapeHtml(post.author_name || '익명')}</span>
          <span class="kh-card-date">${formatDate(post.created_at)}</span>
        </div>
        <div class="kh-card-stats">
          <span class="kh-card-stat">&#128077; ${formatNumber(post.like_count)}</span>
        </div>
      </div>
    </a>
  `;
}

function renderListItem(post) {
  const catSlug = post.category_slug || post.parent_category_slug || '';
  const catName = (getCategoryBySlug(catSlug) || {}).name || catSlug;

  return `
    <a class="kh-list-item" href="${escapeHtml(post.url || '#')}" aria-label="${escapeHtml(post.title)}">
      <span class="kh-list-cat-dot" title="${escapeHtml(catName)}"></span>
      <div class="kh-list-content">
        <div class="kh-list-title">${escapeHtml(post.title)}</div>
        <div class="kh-list-meta">
          <span>${escapeHtml(catName)}</span>
          <span>${escapeHtml(post.author_name || '익명')}</span>
          <span>${formatDate(post.created_at)}</span>
        </div>
      </div>
      <div class="kh-list-right">
        <span class="kh-list-stat">&#128065; ${formatNumber(post.view_count)}</span>
        <span class="kh-list-stat">&#128077; ${formatNumber(post.like_count)}</span>
      </div>
    </a>
  `;
}

function renderPagination(containerEl) {
  if (!containerEl) return;
  const total = getTotalPages();
  if (total <= 1) { containerEl.innerHTML = ''; return; }

  let html = '';
  html += `<button class="kh-page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="이전 페이지">&#8592;</button>`;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - state.currentPage) <= 1) {
      html += `<button class="kh-page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (Math.abs(i - state.currentPage) === 2) {
      html += `<span style="color:var(--ink-muted);padding:0 4px;">…</span>`;
    }
  }
  html += `<button class="kh-page-btn" data-page="${state.currentPage + 1}" ${state.currentPage === total ? 'disabled' : ''} aria-label="다음 페이지">&#8594;</button>`;

  containerEl.innerHTML = html;
  containerEl.querySelectorAll('.kh-page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentPage = parseInt(btn.dataset.page, 10);
      renderPostGrid(document.querySelector('.kh-post-grid, .kh-post-list'));
      renderPagination(containerEl);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    });
  });
}

function renderRelated(containerEl) {
  if (!containerEl) return;
  if (!state.currentCategory && state.selectedTags.length === 0) {
    containerEl.style.display = 'none';
    return;
  }

  const related = getRelatedPosts(3);
  if (related.length === 0) { containerEl.style.display = 'none'; return; }

  containerEl.style.display = 'block';
  const grid = containerEl.querySelector('.kh-related-grid');
  if (!grid) return;

  grid.innerHTML = related.map(post => {
    const catSlug = post.category_slug || post.parent_category_slug || '';
    const catName = (getCategoryBySlug(catSlug) || {}).name || catSlug;
    return `
      <a class="kh-related-card" href="${escapeHtml(post.url || '#')}">
        <div class="kh-related-label">${escapeHtml(catName)}</div>
        <div class="kh-related-card-title">${escapeHtml(post.title)}</div>
        <div class="kh-related-meta">${formatDate(post.created_at)} &middot; &#128065; ${formatNumber(post.view_count)}</div>
      </a>
    `;
  }).join('');
}

function renderBreadcrumb(containerEl) {
  if (!containerEl) return;
  let html = '<a href="?">전체</a>';
  if (state.currentCategory) {
    const cat = getCategoryBySlug(state.currentCategory);
    if (cat) html += ` <span>›</span> <a href="?cat=${cat.slug}">${escapeHtml(cat.name)}</a>`;
  }
  if (state.currentSubCategory) {
    const sub = getCategoryBySlug(state.currentSubCategory);
    if (sub) html += ` <span>›</span> <span>${escapeHtml(sub.name)}</span>`;
  }
  containerEl.innerHTML = html;
}

function renderAll() {
  renderCategorySidebar(document.getElementById('kh-sidebar'));
  renderTagCloud(document.getElementById('kh-tag-cloud'));
  renderActiveFilters(document.getElementById('kh-active-filters'));
  renderResultInfo(document.getElementById('kh-result-info'));
  renderBreadcrumb(document.getElementById('kh-breadcrumb'));
  renderPostGrid(document.getElementById('kh-post-container'));
  renderPagination(document.getElementById('kh-pagination'));
  renderRelated(document.getElementById('kh-related'));
}

/* ── URL 파라미터 파싱 ─────────────────────────────── */
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  const sub = params.get('sub');
  const tag = params.get('tag');
  const q   = params.get('q');

  if (cat) state.currentCategory = cat;
  if (sub) {
    state.currentSubCategory = sub;
    const parent = getParentCategory(sub);
    if (parent) state.currentCategory = parent.slug;
  }
  if (tag) state.selectedTags = [tag];
  if (q)   state.searchQuery = q;
}

/* ── 이벤트 바인딩 ─────────────────────────────────── */
function bindGlobalEvents() {
  // 검색
  const searchInput = document.getElementById('kh-search');
  if (searchInput) {
    searchInput.value = state.searchQuery;
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = searchInput.value;
        applyFilters();
        renderAll();
      }, 300);
    });
  }

  // 정렬
  const sortSelect = document.getElementById('kh-sort');
  if (sortSelect) {
    sortSelect.value = state.sortBy;
    sortSelect.addEventListener('change', () => {
      state.sortBy = sortSelect.value;
      applyFilters();
      renderAll();
    });
  }

  // 뷰 토글
  document.querySelectorAll('.kh-view-btn').forEach(btn => {
    if (btn.dataset.view === state.viewMode) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.viewMode = btn.dataset.view;
      document.querySelectorAll('.kh-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPostGrid(document.getElementById('kh-post-container'));
    });
  });

  // 모바일 사이드바 토글
  const mobileBtn = document.getElementById('kh-mobile-cat-btn');
  const overlay = document.getElementById('kh-sidebar-overlay');
  const sidebar = document.getElementById('kh-sidebar');

  function openSidebar() {
    sidebar?.classList.add('mobile-open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileBtn?.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);
}

/* ── 공개 API ──────────────────────────────────────── */
const KnowledgeHubApp = {
  async init() {
    parseUrlParams();
    state.loading = true;
    renderAll(); // 로딩 상태 즉시 표시

    await loadPosts();
    applyFilters();
    state.loading = false;

    renderAll();
    bindGlobalEvents();
  },

  filterByCategory(slug) {
    state.currentCategory = slug;
    state.currentSubCategory = null;
    applyFilters();
    renderAll();
  },

  filterByTag(tagName) {
    if (!state.selectedTags.includes(tagName)) {
      state.selectedTags.push(tagName);
    }
    applyFilters();
    renderAll();
  },

  getState() {
    return state;
  }
};

window.KnowledgeHubApp = KnowledgeHubApp;

// 자동 초기화 (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  KnowledgeHubApp.init();
});
