// @task S7F4
// 범용 페이지네이션 컴포넌트
// AX-On Platform — 게시판 페이지네이션

/**
 * Pagination
 * 두 가지 모드 지원:
 *   - 'pagination' : 번호 버튼 방식 (기본)
 *   - 'infinite'   : 무한 스크롤 + 더보기 버튼
 *
 * Supabase 연동:
 *   const { data } = await supabase
 *     .from('table')
 *     .select('*', { count: 'exact' })
 *     .range(pagination.getRangeFrom(), pagination.getRangeTo());
 */

export class Pagination {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container        - 렌더링 대상 컨테이너
   * @param {number}      [options.totalItems=0]   - 전체 아이템 수
   * @param {number}      [options.pageSize=20]    - 페이지당 항목 수 (10/20/50)
   * @param {number}      [options.currentPage=1]  - 현재 페이지 (1-based)
   * @param {Function}    [options.onPageChange]   - (page, pageSize) => void
   * @param {string}      [options.mode='pagination'] - 'pagination' | 'infinite'
   * @param {number}      [options.maxVisiblePages=5] - 번호 버튼 최대 표시 수
   * @param {HTMLElement} [options.listContainer]  - 무한 스크롤 감시 대상 컨테이너
   * @param {boolean}     [options.syncUrl=true]   - URL 파라미터 동기화 여부
   */
  constructor(options = {}) {
    this.container = options.container;
    this.totalItems = options.totalItems || 0;
    this.pageSize = options.pageSize || 20;
    this.currentPage = options.currentPage || 1;
    this.onPageChange = options.onPageChange || (() => {});
    this.mode = options.mode || 'pagination';
    this.maxVisiblePages = options.maxVisiblePages || 5;
    this.listContainer = options.listContainer || null;
    this.syncUrl = options.syncUrl !== false;

    // 내부 상태
    this._loading = false;
    this._autoLoad = false;   // 자동 로드 토글 상태
    this._observer = null;    // IntersectionObserver
    this._sentinel = null;    // 감시 더미 엘리먼트

    // URL에서 초기 page/pageSize 복원
    if (this.syncUrl) {
      this._restoreFromUrl();
    }

    this.init();
  }

  // ──────────────────────────────────────────
  // 공개 API
  // ──────────────────────────────────────────

  /** 전체 아이템 수 업데이트 후 재렌더링 */
  setTotal(total) {
    this.totalItems = total;
    this._render();
  }

  /** 현재 페이지 변경 (외부에서 강제 이동) */
  goToPage(page) {
    this._changePage(page);
  }

  /** Supabase range() 시작 인덱스 (0-based) */
  getRangeFrom() {
    return (this.currentPage - 1) * this.pageSize;
  }

  /** Supabase range() 끝 인덱스 (0-based, 포함) */
  getRangeTo() {
    return this.currentPage * this.pageSize - 1;
  }

  /** 총 페이지 수 */
  getTotalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  /** 스켈레톤 로딩 표시 */
  showSkeleton(itemCount = 5) {
    if (!this.listContainer) return;
    const skeletons = Array.from({ length: itemCount }, () => {
      const el = document.createElement('div');
      el.className = 'pag-skeleton-item';
      el.innerHTML = `
        <div class="pag-skeleton-line pag-skeleton-line--title"></div>
        <div class="pag-skeleton-line pag-skeleton-line--text"></div>
        <div class="pag-skeleton-line pag-skeleton-line--text pag-skeleton-line--short"></div>
      `;
      return el;
    });
    const wrapper = document.createElement('div');
    wrapper.className = 'pag-skeleton-wrapper';
    wrapper.dataset.skeletonWrapper = '';
    skeletons.forEach(s => wrapper.appendChild(s));
    this.listContainer.appendChild(wrapper);
  }

  /** 스켈레톤 제거 */
  hideSkeleton() {
    if (!this.listContainer) return;
    const wrapper = this.listContainer.querySelector('[data-skeleton-wrapper]');
    if (wrapper) wrapper.remove();
  }

  /** 로딩 상태 설정 */
  setLoading(isLoading) {
    this._loading = isLoading;
    this._render();
  }

  /** 컴포넌트 완전 제거 */
  destroy() {
    this._disconnectObserver();
    if (this.container) this.container.innerHTML = '';
  }

  // ──────────────────────────────────────────
  // 초기화
  // ──────────────────────────────────────────

  init() {
    if (!this.container) {
      console.warn('[Pagination] container 옵션이 필요합니다.');
      return;
    }
    this.container.classList.add('pag-root');
    this._render();

    if (this.mode === 'infinite') {
      this._initInfiniteScroll();
    }
  }

  // ──────────────────────────────────────────
  // 렌더링
  // ──────────────────────────────────────────

  _render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (this.mode === 'infinite') {
      this._renderInfiniteControls();
    } else {
      this._renderPaginationControls();
    }
  }

  /** 번호 방식 렌더링 */
  _renderPaginationControls() {
    const totalPages = this.getTotalPages();
    const frag = document.createDocumentFragment();

    // 상단 행: 총 건수 + 페이지 크기 셀렉터
    frag.appendChild(this._buildMeta(totalPages));

    // 버튼 행
    const btnRow = document.createElement('div');
    btnRow.className = 'pag-btn-row';

    // 처음
    const btnFirst = this._buildNavBtn('&laquo;', '처음', 1, this.currentPage === 1);
    // 이전
    const btnPrev = this._buildNavBtn('&lsaquo;', '이전', this.currentPage - 1, this.currentPage === 1);

    // 번호 버튼
    const pages = this._calcVisiblePages(totalPages);
    const pageBtns = document.createDocumentFragment();
    pages.forEach(p => {
      if (p === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pag-ellipsis';
        ellipsis.textContent = '···';
        pageBtns.appendChild(ellipsis);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pag-num-btn' + (p === this.currentPage ? ' pag-num-btn--active' : '');
        btn.textContent = p;
        btn.disabled = this._loading;
        btn.setAttribute('aria-label', `${p}페이지`);
        if (p === this.currentPage) btn.setAttribute('aria-current', 'page');
        btn.addEventListener('click', () => this._changePage(p));
        pageBtns.appendChild(btn);
      }
    });

    // 다음
    const btnNext = this._buildNavBtn('&rsaquo;', '다음', this.currentPage + 1, this.currentPage === totalPages || totalPages === 0);
    // 마지막
    const btnLast = this._buildNavBtn('&raquo;', '마지막', totalPages || 1, this.currentPage === totalPages || totalPages === 0);

    btnRow.appendChild(btnFirst);
    btnRow.appendChild(btnPrev);
    btnRow.appendChild(pageBtns);
    btnRow.appendChild(btnNext);
    btnRow.appendChild(btnLast);

    frag.appendChild(btnRow);
    this.container.appendChild(frag);
  }

  /** 무한 스크롤 컨트롤 렌더링 */
  _renderInfiniteControls() {
    const totalPages = this.getTotalPages();
    const frag = document.createDocumentFragment();

    // 메타
    frag.appendChild(this._buildMeta(totalPages));

    // 더보기 버튼 영역
    if (this.currentPage < totalPages) {
      const btnArea = document.createElement('div');
      btnArea.className = 'pag-loadmore-area';

      const btnLoadMore = document.createElement('button');
      btnLoadMore.type = 'button';
      btnLoadMore.className = 'pag-loadmore-btn' + (this._loading ? ' pag-loadmore-btn--loading' : '');
      btnLoadMore.disabled = this._loading;
      btnLoadMore.innerHTML = this._loading
        ? '<span class="pag-spinner"></span> 불러오는 중…'
        : '더 보기';
      btnLoadMore.addEventListener('click', () => {
        if (!this._loading) this._changePage(this.currentPage + 1, true);
      });

      // 자동 로드 토글
      const btnToggle = document.createElement('button');
      btnToggle.type = 'button';
      btnToggle.className = 'pag-autoload-toggle' + (this._autoLoad ? ' pag-autoload-toggle--on' : '');
      btnToggle.title = this._autoLoad ? '자동 로드 끄기' : '자동 로드 켜기';
      btnToggle.innerHTML = this._autoLoad ? '⟳ 자동' : '⟳ 수동';
      btnToggle.addEventListener('click', () => this._toggleAutoLoad());

      btnArea.appendChild(btnLoadMore);
      btnArea.appendChild(btnToggle);
      frag.appendChild(btnArea);

      // Sentinel (IntersectionObserver 감시점)
      this._sentinel = document.createElement('div');
      this._sentinel.className = 'pag-sentinel';
      frag.appendChild(this._sentinel);
    }

    this.container.appendChild(frag);
    this._reconnectObserver();
  }

  /** 메타 행 (총 건수 + 페이지 크기 셀렉터) 빌드 */
  _buildMeta(totalPages) {
    const meta = document.createElement('div');
    meta.className = 'pag-meta';

    const info = document.createElement('span');
    info.className = 'pag-info';
    const from = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    const to = Math.min(this.currentPage * this.pageSize, this.totalItems);
    info.textContent = `전체 ${this.totalItems.toLocaleString()}건 중 ${from}–${to}`;

    const sizeSelector = this._buildSizeSelector();

    meta.appendChild(info);
    meta.appendChild(sizeSelector);
    return meta;
  }

  /** 페이지 크기 셀렉터 빌드 */
  _buildSizeSelector() {
    const wrapper = document.createElement('div');
    wrapper.className = 'pag-size-wrap';

    const label = document.createElement('label');
    label.className = 'pag-size-label';
    label.htmlFor = 'pag-size-select';
    label.textContent = '표시';

    const select = document.createElement('select');
    select.id = 'pag-size-select';
    select.className = 'pag-size-select';
    select.disabled = this._loading;

    [10, 20, 50].forEach(size => {
      const opt = document.createElement('option');
      opt.value = size;
      opt.textContent = `${size}개`;
      if (size === this.pageSize) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      this.pageSize = Number(e.target.value);
      this.currentPage = 1;
      this._syncUrl();
      this.onPageChange(this.currentPage, this.pageSize);
      this._render();
    });

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  }

  /** 내비게이션 버튼 (처음/이전/다음/마지막) 빌드 */
  _buildNavBtn(htmlContent, ariaLabel, targetPage, disabled) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-nav-btn';
    btn.innerHTML = htmlContent;
    btn.setAttribute('aria-label', ariaLabel);
    btn.disabled = disabled || this._loading;
    if (!disabled) {
      btn.addEventListener('click', () => this._changePage(targetPage));
    }
    return btn;
  }

  // ──────────────────────────────────────────
  // 페이지 변경
  // ──────────────────────────────────────────

  /**
   * @param {number}  page      - 이동할 페이지
   * @param {boolean} append    - 무한 스크롤 append 모드
   */
  _changePage(page, append = false) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this._syncUrl();
    this.onPageChange(this.currentPage, this.pageSize, append);
    this._render();
  }

  // ──────────────────────────────────────────
  // 번호 계산
  // ──────────────────────────────────────────

  /** 표시할 페이지 번호 배열 계산 (ellipsis 포함) */
  _calcVisiblePages(totalPages) {
    if (totalPages <= this.maxVisiblePages + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(2, this.currentPage - half);
    let end = Math.min(totalPages - 1, this.currentPage + half);

    // 범위 보정
    if (end - start + 1 < this.maxVisiblePages) {
      if (this.currentPage <= half + 1) {
        end = Math.min(totalPages - 1, this.maxVisiblePages);
      } else {
        start = Math.max(2, totalPages - this.maxVisiblePages + 1);
      }
    }

    const pages = [1];
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  // ──────────────────────────────────────────
  // 무한 스크롤
  // ──────────────────────────────────────────

  _initInfiniteScroll() {
    this._reconnectObserver();
  }

  _reconnectObserver() {
    this._disconnectObserver();
    if (!this._sentinel) return;

    this._observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this._autoLoad && !this._loading) {
          const totalPages = this.getTotalPages();
          if (this.currentPage < totalPages) {
            this._changePage(this.currentPage + 1, true);
          }
        }
      },
      { rootMargin: '0px 0px 200px 0px', threshold: 0 }
    );

    this._observer.observe(this._sentinel);
  }

  _disconnectObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  _toggleAutoLoad() {
    this._autoLoad = !this._autoLoad;
    this._render();
  }

  // ──────────────────────────────────────────
  // URL 동기화
  // ──────────────────────────────────────────

  _syncUrl() {
    if (!this.syncUrl) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', this.currentPage);
      url.searchParams.set('pageSize', this.pageSize);
      history.pushState({ page: this.currentPage, pageSize: this.pageSize }, '', url.toString());
    } catch (e) {
      // 비브라우저 환경 무시
    }
  }

  _restoreFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('page')) {
        const p = parseInt(params.get('page'), 10);
        if (p > 0) this.currentPage = p;
      }
      if (params.has('pageSize')) {
        const ps = parseInt(params.get('pageSize'), 10);
        if ([10, 20, 50].includes(ps)) this.pageSize = ps;
      }
    } catch (e) {
      // 비브라우저 환경 무시
    }
  }
}

// ──────────────────────────────────────────
// Supabase 연동 헬퍼 (선택 사용)
// ──────────────────────────────────────────

/**
 * Supabase 테이블에서 페이지네이션 쿼리를 실행합니다.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} table       - 테이블명
 * @param {Pagination} pag     - Pagination 인스턴스
 * @param {Object} [queryOpts] - 추가 쿼리 옵션
 * @param {string} [queryOpts.select='*']
 * @param {Object} [queryOpts.filters]   - { column: value } 형태 eq 필터
 * @param {string} [queryOpts.orderBy]   - 정렬 컬럼
 * @param {boolean} [queryOpts.ascending=false]
 * @returns {Promise<{data: any[], total: number, error: any}>}
 *
 * @example
 * const { data, total, error } = await fetchPageFromSupabase(supabase, 'posts', pagination, {
 *   filters: { status: 'published' },
 *   orderBy: 'created_at',
 * });
 * pagination.setTotal(total);
 */
export async function fetchPageFromSupabase(supabase, table, pag, queryOpts = {}) {
  const {
    select = '*',
    filters = {},
    orderBy = null,
    ascending = false,
  } = queryOpts;

  let query = supabase
    .from(table)
    .select(select, { count: 'exact' })
    .range(pag.getRangeFrom(), pag.getRangeTo());

  // eq 필터 적용
  Object.entries(filters).forEach(([col, val]) => {
    query = query.eq(col, val);
  });

  // 정렬 적용
  if (orderBy) {
    query = query.order(orderBy, { ascending });
  }

  const { data, count, error } = await query;
  return { data: data || [], total: count || 0, error };
}
