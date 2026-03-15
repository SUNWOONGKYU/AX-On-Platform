// @task S7F6
// @description 수강신청 관리자 대시보드 - 메인 JavaScript

'use strict';

/* ============================================================
   Supabase 초기화
   ============================================================ */
const SUPABASE_URL  = window.__SUPABASE_URL__  || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = window.__SUPABASE_ANON__ || 'YOUR_ANON_KEY';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ============================================================
   상수
   ============================================================ */
const PAGE_SIZE = 20;

const STATUS_MAP = {
    pending:  { label: '대기중',  cls: 'badge-pending'  },
    approved: { label: '승인',    cls: 'badge-approved' },
    rejected: { label: '거부',    cls: 'badge-rejected' },
};

/* ============================================================
   앱 상태 (단일 상태 객체)
   ============================================================ */
const state = {
    user:           null,
    enrollments:    [],
    filtered:       [],
    currentPage:    1,
    totalPages:     1,
    selectedIds:    new Set(),

    // 모달 대상
    targetEnrollment: null,

    // 필터
    searchQuery:    '',
    statusFilter:   '',
    dateFrom:       '',
    dateTo:         '',
};

/* ============================================================
   DOM 참조 (한 번만 쿼리)
   ============================================================ */
const dom = {
    authScreen:         document.getElementById('authScreen'),
    adminLayout:        document.getElementById('adminLayout'),
    adminSidebar:       document.getElementById('adminSidebar'),
    sidebarOverlay:     document.getElementById('sidebarOverlay'),
    hamburgerBtn:       document.getElementById('hamburgerBtn'),
    sidebarAvatar:      document.getElementById('sidebarAvatar'),
    sidebarUserName:    document.getElementById('sidebarUserName'),
    sidebarPendingCount:document.getElementById('sidebarPendingCount'),
    logoutBtn:          document.getElementById('logoutBtn'),
    topbarTime:         document.getElementById('topbarTime'),

    // Stats
    statTotal:      document.getElementById('statTotal'),
    statPending:    document.getElementById('statPending'),
    statApproved:   document.getElementById('statApproved'),
    statRejected:   document.getElementById('statRejected'),

    // Toolbar
    searchInput:        document.getElementById('searchInput'),
    statusFilter:       document.getElementById('statusFilter'),
    dateFrom:           document.getElementById('dateFrom'),
    dateTo:             document.getElementById('dateTo'),
    clearFiltersBtn:    document.getElementById('clearFiltersBtn'),
    exportBtn:          document.getElementById('exportBtn'),
    refreshBtn:         document.getElementById('refreshBtn'),
    selectAllChk:       document.getElementById('selectAllChk'),
    bulkBar:            document.getElementById('bulkBar'),
    bulkCount:          document.getElementById('bulkCount'),
    bulkApproveBtn:     document.getElementById('bulkApproveBtn'),
    bulkRejectBtn:      document.getElementById('bulkRejectBtn'),

    // Table
    tableBody:          document.getElementById('tableBody'),
    paginationWrap:     document.getElementById('paginationWrap'),
    paginationInfo:     document.getElementById('paginationInfo'),
    paginationControls: document.getElementById('paginationControls'),

    // Approve Modal
    approveModal:       document.getElementById('approveModal'),
    approveModalName:   document.getElementById('approveModalName'),
    approveModalCourse: document.getElementById('approveModalCourse'),
    approveConfirmBtn:  document.getElementById('approveConfirmBtn'),

    // Reject Modal
    rejectModal:        document.getElementById('rejectModal'),
    rejectModalName:    document.getElementById('rejectModalName'),
    rejectModalCourse:  document.getElementById('rejectModalCourse'),
    rejectReasonInput:  document.getElementById('rejectReasonInput'),
    rejectReasonError:  document.getElementById('rejectReasonError'),
    rejectConfirmBtn:   document.getElementById('rejectConfirmBtn'),

    // Detail Modal
    detailModal:        document.getElementById('detailModal'),
    detailContent:      document.getElementById('detailContent'),
    detailApproveBtn:   document.getElementById('detailApproveBtn'),
    detailRejectBtn:    document.getElementById('detailRejectBtn'),

    // Bulk Reject Modal
    bulkRejectModal:    document.getElementById('bulkRejectModal'),
    bulkRejectCount:    document.getElementById('bulkRejectCount'),
    bulkRejectReasonInput: document.getElementById('bulkRejectReasonInput'),
    bulkRejectReasonError: document.getElementById('bulkRejectReasonError'),
    bulkRejectConfirmBtn:  document.getElementById('bulkRejectConfirmBtn'),

    toastContainer: document.getElementById('toastContainer'),
};

/* ============================================================
   Toast 알림
   ============================================================ */
function showToast(message, type = 'default', duration = 3000) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', default: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.default}</span><span>${message}</span>`;
    dom.toastContainer.appendChild(el);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('show'));
    });

    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 350);
    }, duration);
}

/* ============================================================
   Modal 헬퍼
   ============================================================ */
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

// 모달 닫기 버튼 (공통)
document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});

// 오버레이 클릭으로 닫기
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

/* ============================================================
   Topbar 시계
   ============================================================ */
function updateClock() {
    const now = new Date();
    dom.topbarTime.textContent = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}
setInterval(updateClock, 1000);
updateClock();

/* ============================================================
   사이드바 (모바일 토글)
   ============================================================ */
dom.hamburgerBtn.addEventListener('click', () => {
    dom.adminSidebar.classList.toggle('open');
    dom.sidebarOverlay.classList.toggle('active');
});
dom.sidebarOverlay.addEventListener('click', () => {
    dom.adminSidebar.classList.remove('open');
    dom.sidebarOverlay.classList.remove('active');
});

/* ============================================================
   Auth & 관리자 확인
   ============================================================ */
async function checkAuth() {
    try {
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
            window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        // 관리자 역할 확인 (user_metadata 또는 profiles 테이블)
        const user = session.user;
        const role = user.user_metadata?.role || user.app_metadata?.role;

        if (role !== 'admin') {
            // profiles 테이블에서 재확인
            const { data: profile } = await sb
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!profile || profile.role !== 'admin') {
                dom.authScreen.innerHTML = `
                    <div class="auth-denied">
                        <h2>접근 권한이 없습니다</h2>
                        <p>관리자 계정으로 로그인하세요.</p>
                        <button class="btn btn-primary" onclick="window.location.href='/'">메인으로</button>
                    </div>`;
                return;
            }
        }

        state.user = user;

        // UI 업데이트
        const displayName = user.user_metadata?.name || user.email?.split('@')[0] || '관리자';
        dom.sidebarUserName.textContent = displayName;
        dom.sidebarAvatar.textContent   = displayName.charAt(0).toUpperCase();

        // 레이아웃 표시
        dom.authScreen.style.display = 'none';
        dom.adminLayout.style.display = 'flex';

        // 데이터 로드
        await loadEnrollments();

    } catch (err) {
        console.error('[Auth Error]', err);
        showToast('인증 오류가 발생했습니다.', 'error');
    }
}

/* ============================================================
   로그아웃
   ============================================================ */
dom.logoutBtn.addEventListener('click', async () => {
    await sb.auth.signOut();
    window.location.href = '/pages/auth/login.html';
});

/* ============================================================
   수강신청 데이터 로드
   ============================================================ */
async function loadEnrollments() {
    renderTableLoading();

    try {
        const { data, error } = await sb
            .from('enrollments')
            .select(`
                id,
                user_id,
                course_id,
                status,
                reject_reason,
                created_at,
                profiles:user_id ( full_name, email ),
                courses:course_id ( title )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        state.enrollments = (data || []).map(row => ({
            id:           row.id,
            user_id:      row.user_id,
            course_id:    row.course_id,
            applicant:    row.profiles?.full_name  || '(이름 없음)',
            email:        row.profiles?.email      || '-',
            course:       row.courses?.title       || '(강의 없음)',
            status:       row.status               || 'pending',
            reject_reason:row.reject_reason        || '',
            created_at:   row.created_at,
        }));

        updateStats();
        applyFilters();

    } catch (err) {
        console.error('[Load Error]', err);
        showToast('데이터를 불러오지 못했습니다.', 'error');
        renderTableEmpty('데이터 로드 실패', err.message || '');
    }
}

/* ============================================================
   통계 업데이트
   ============================================================ */
function updateStats() {
    const all      = state.enrollments;
    const pending  = all.filter(e => e.status === 'pending').length;
    const approved = all.filter(e => e.status === 'approved').length;
    const rejected = all.filter(e => e.status === 'rejected').length;

    dom.statTotal.textContent    = all.length;
    dom.statPending.textContent  = pending;
    dom.statApproved.textContent = approved;
    dom.statRejected.textContent = rejected;

    // 사이드바 배지
    dom.sidebarPendingCount.textContent = pending;
    dom.sidebarPendingCount.style.display = pending > 0 ? '' : 'none';
}

/* ============================================================
   필터링
   ============================================================ */
function applyFilters() {
    const q      = state.searchQuery.toLowerCase().trim();
    const status = state.statusFilter;
    const from   = state.dateFrom ? new Date(state.dateFrom) : null;
    const to     = state.dateTo   ? new Date(state.dateTo + 'T23:59:59') : null;

    state.filtered = state.enrollments.filter(e => {
        if (q && !e.applicant.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q)) return false;
        if (status && e.status !== status) return false;
        const d = new Date(e.created_at);
        if (from && d < from) return false;
        if (to   && d > to)   return false;
        return true;
    });

    state.currentPage = 1;
    state.selectedIds.clear();
    updateBulkBar();
    renderTable();
    renderPagination();
}

/* ============================================================
   테이블 렌더링
   ============================================================ */
function renderTable() {
    if (state.filtered.length === 0) {
        renderTableEmpty('조건에 맞는 수강신청이 없습니다.', '필터를 조정하거나 새로고침 해보세요.');
        return;
    }

    const start = (state.currentPage - 1) * PAGE_SIZE;
    const page  = state.filtered.slice(start, start + PAGE_SIZE);

    dom.tableBody.innerHTML = page.map((e, i) => {
        const num    = start + i + 1;
        const badge  = STATUS_MAP[e.status] || STATUS_MAP.pending;
        const date   = formatDate(e.created_at);
        const isPending = e.status === 'pending';
        const checked   = state.selectedIds.has(e.id) ? 'checked' : '';

        return `
            <tr data-id="${e.id}">
                <td class="col-check">
                    <input type="checkbox" class="row-checkbox" data-id="${e.id}" ${checked}>
                </td>
                <td><span class="cell-num">${num}</span></td>
                <td>
                    <div class="cell-name">${escapeHtml(e.applicant)}</div>
                    <div class="cell-email">${escapeHtml(e.email)}</div>
                </td>
                <td>${escapeHtml(e.email)}</td>
                <td><span class="cell-course">${escapeHtml(e.course)}</span></td>
                <td><span class="cell-date">${date}</span></td>
                <td><span class="badge ${badge.cls}">${badge.label}</span></td>
                <td>
                    <div class="action-group">
                        <button class="btn btn-ghost btn-sm btn-icon detail-btn"
                                data-id="${e.id}" title="상세보기">&#x1F441;</button>
                        ${isPending ? `
                        <button class="btn btn-success btn-sm approve-btn"
                                data-id="${e.id}" title="승인">승인</button>
                        <button class="btn btn-danger btn-sm reject-btn"
                                data-id="${e.id}" title="거부">거부</button>
                        ` : ''}
                    </div>
                </td>
            </tr>`;
    }).join('');

    // 체크박스 전체 선택 상태 업데이트
    updateSelectAllCheckbox();
}

function renderTableLoading() {
    dom.tableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="8">
                <div class="spinner"></div>
                <p>데이터를 불러오는 중...</p>
            </td>
        </tr>`;
}

function renderTableEmpty(title, sub = '') {
    dom.tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                <div class="empty-state">
                    <div class="empty-state-icon">&#x1F4CB;</div>
                    <h3>${title}</h3>
                    ${sub ? `<p>${sub}</p>` : ''}
                </div>
            </td>
        </tr>`;
}

/* ============================================================
   페이지네이션
   ============================================================ */
function renderPagination() {
    const total = state.filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    state.totalPages = totalPages;

    const start = Math.min((state.currentPage - 1) * PAGE_SIZE + 1, total);
    const end   = Math.min(state.currentPage * PAGE_SIZE, total);
    dom.paginationInfo.textContent = total > 0
        ? `${start}-${end} / 총 ${total}건`
        : '총 0건';

    // 페이지 번호 생성 (최대 7개 버튼)
    const pages = getPageRange(state.currentPage, totalPages);
    let html = '';

    html += `<button class="pagination-btn" ${state.currentPage <= 1 ? 'disabled' : ''}
             data-page="${state.currentPage - 1}">&#x2039;</button>`;

    pages.forEach(p => {
        if (p === '...') {
            html += `<span style="padding:0 .25rem;color:var(--ink-muted);font-size:.8rem;">…</span>`;
        } else {
            html += `<button class="pagination-btn ${p === state.currentPage ? 'active' : ''}"
                     data-page="${p}">${p}</button>`;
        }
    });

    html += `<button class="pagination-btn" ${state.currentPage >= totalPages ? 'disabled' : ''}
             data-page="${state.currentPage + 1}">&#x203A;</button>`;

    dom.paginationControls.innerHTML = html;
}

function getPageRange(cur, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (cur <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...', total);
    } else if (cur >= total - 3) {
        pages.push(1, '...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
        pages.push(1, '...', cur - 1, cur, cur + 1, '...', total);
    }
    return pages;
}

/* ============================================================
   체크박스 / 일괄 처리
   ============================================================ */
function updateBulkBar() {
    const count = state.selectedIds.size;
    dom.bulkBar.classList.toggle('visible', count > 0);
    dom.bulkCount.textContent = `${count}건 선택됨`;
}

function updateSelectAllCheckbox() {
    const start = (state.currentPage - 1) * PAGE_SIZE;
    const page  = state.filtered.slice(start, start + PAGE_SIZE);
    const pageIds = page.map(e => e.id);
    const allChecked = pageIds.length > 0 && pageIds.every(id => state.selectedIds.has(id));
    dom.selectAllChk.checked = allChecked;
    dom.selectAllChk.indeterminate = !allChecked && pageIds.some(id => state.selectedIds.has(id));
}

/* ============================================================
   RPC 호출 — 개별 승인
   ============================================================ */
async function approveEnrollment(enrollmentId) {
    const { error } = await sb.rpc('approve_enrollment', { p_enrollment_id: enrollmentId });
    if (error) throw error;
}

/* ============================================================
   RPC 호출 — 개별 거부
   ============================================================ */
async function rejectEnrollment(enrollmentId, reason) {
    const { error } = await sb.rpc('reject_enrollment', {
        p_enrollment_id: enrollmentId,
        p_reason: reason,
    });
    if (error) throw error;
}

/* ============================================================
   이벤트 — 테이블 클릭 위임
   ============================================================ */
dom.tableBody.addEventListener('click', e => {
    const btn = e.target.closest('button');
    const chk = e.target.closest('input[type="checkbox"]');

    if (chk && chk.dataset.id) {
        const id = chk.dataset.id;
        if (chk.checked) {
            state.selectedIds.add(id);
        } else {
            state.selectedIds.delete(id);
        }
        updateBulkBar();
        updateSelectAllCheckbox();
        return;
    }

    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    const enrollment = state.enrollments.find(e => e.id === id);
    if (!enrollment) return;

    if (btn.classList.contains('approve-btn')) {
        openApproveModal(enrollment);
    } else if (btn.classList.contains('reject-btn')) {
        openRejectModal(enrollment);
    } else if (btn.classList.contains('detail-btn')) {
        openDetailModal(enrollment);
    }
});

/* ============================================================
   이벤트 — 전체 선택
   ============================================================ */
dom.selectAllChk.addEventListener('change', () => {
    const start = (state.currentPage - 1) * PAGE_SIZE;
    const page  = state.filtered.slice(start, start + PAGE_SIZE);
    page.forEach(e => {
        if (dom.selectAllChk.checked) {
            state.selectedIds.add(e.id);
        } else {
            state.selectedIds.delete(e.id);
        }
    });
    renderTable();
    updateBulkBar();
});

/* ============================================================
   이벤트 — 페이지네이션
   ============================================================ */
dom.paginationControls.addEventListener('click', e => {
    const btn = e.target.closest('.pagination-btn');
    if (!btn || btn.disabled) return;
    const page = parseInt(btn.dataset.page, 10);
    if (!isNaN(page) && page >= 1 && page <= state.totalPages) {
        state.currentPage = page;
        renderTable();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

/* ============================================================
   이벤트 — 필터
   ============================================================ */
let searchTimer;
dom.searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        state.searchQuery = dom.searchInput.value;
        applyFilters();
    }, 300);
});

dom.statusFilter.addEventListener('change', () => {
    state.statusFilter = dom.statusFilter.value;
    applyFilters();
});

dom.dateFrom.addEventListener('change', () => {
    state.dateFrom = dom.dateFrom.value;
    applyFilters();
});

dom.dateTo.addEventListener('change', () => {
    state.dateTo = dom.dateTo.value;
    applyFilters();
});

dom.clearFiltersBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.statusFilter = '';
    state.dateFrom = '';
    state.dateTo = '';
    dom.searchInput.value = '';
    dom.statusFilter.value = '';
    dom.dateFrom.value = '';
    dom.dateTo.value = '';
    applyFilters();
});

dom.refreshBtn.addEventListener('click', () => loadEnrollments());

/* ============================================================
   승인 모달
   ============================================================ */
function openApproveModal(enrollment) {
    state.targetEnrollment = enrollment;
    dom.approveModalName.textContent   = enrollment.applicant;
    dom.approveModalCourse.textContent = enrollment.course;
    openModal('approveModal');
}

dom.approveConfirmBtn.addEventListener('click', async () => {
    const e = state.targetEnrollment;
    if (!e) return;

    dom.approveConfirmBtn.disabled = true;
    dom.approveConfirmBtn.textContent = '처리 중...';

    try {
        await approveEnrollment(e.id);

        // 로컬 상태 업데이트
        const idx = state.enrollments.findIndex(en => en.id === e.id);
        if (idx !== -1) state.enrollments[idx].status = 'approved';

        closeModal('approveModal');
        updateStats();
        applyFilters();
        showToast(`${e.applicant}님의 수강신청이 승인되었습니다.`, 'success');
    } catch (err) {
        console.error('[Approve Error]', err);
        showToast('승인 처리 중 오류가 발생했습니다.', 'error');
    } finally {
        dom.approveConfirmBtn.disabled = false;
        dom.approveConfirmBtn.textContent = '승인하기';
    }
});

/* ============================================================
   거부 모달
   ============================================================ */
function openRejectModal(enrollment) {
    state.targetEnrollment = enrollment;
    dom.rejectModalName.textContent   = enrollment.applicant;
    dom.rejectModalCourse.textContent = enrollment.course;
    dom.rejectReasonInput.value = '';
    dom.rejectReasonError.style.display = 'none';
    openModal('rejectModal');
}

dom.rejectConfirmBtn.addEventListener('click', async () => {
    const reason = dom.rejectReasonInput.value.trim();
    if (!reason) {
        dom.rejectReasonError.style.display = 'block';
        dom.rejectReasonInput.focus();
        return;
    }
    dom.rejectReasonError.style.display = 'none';

    const e = state.targetEnrollment;
    if (!e) return;

    dom.rejectConfirmBtn.disabled = true;
    dom.rejectConfirmBtn.textContent = '처리 중...';

    try {
        await rejectEnrollment(e.id, reason);

        const idx = state.enrollments.findIndex(en => en.id === e.id);
        if (idx !== -1) {
            state.enrollments[idx].status = 'rejected';
            state.enrollments[idx].reject_reason = reason;
        }

        closeModal('rejectModal');
        updateStats();
        applyFilters();
        showToast(`${e.applicant}님의 수강신청이 거부되었습니다.`, 'warning');
    } catch (err) {
        console.error('[Reject Error]', err);
        showToast('거부 처리 중 오류가 발생했습니다.', 'error');
    } finally {
        dom.rejectConfirmBtn.disabled = false;
        dom.rejectConfirmBtn.textContent = '거부하기';
    }
});

/* ============================================================
   상세 모달
   ============================================================ */
function openDetailModal(enrollment) {
    state.targetEnrollment = enrollment;
    const isPending = enrollment.status === 'pending';
    const badge = STATUS_MAP[enrollment.status] || STATUS_MAP.pending;

    dom.detailContent.innerHTML = `
        <div class="detail-field">
            <span class="detail-label">신청자명</span>
            <span class="detail-value">${escapeHtml(enrollment.applicant)}</span>
        </div>
        <div class="detail-field">
            <span class="detail-label">이메일</span>
            <span class="detail-value">${escapeHtml(enrollment.email)}</span>
        </div>
        <div class="detail-field full">
            <span class="detail-label">강의명</span>
            <span class="detail-value">${escapeHtml(enrollment.course)}</span>
        </div>
        <div class="detail-field">
            <span class="detail-label">신청일</span>
            <span class="detail-value">${formatDate(enrollment.created_at)}</span>
        </div>
        <div class="detail-field">
            <span class="detail-label">상태</span>
            <span class="detail-value"><span class="badge ${badge.cls}">${badge.label}</span></span>
        </div>
        ${enrollment.reject_reason ? `
        <div class="detail-field full">
            <span class="detail-label">거부 사유</span>
            <span class="detail-value" style="color:var(--red);">${escapeHtml(enrollment.reject_reason)}</span>
        </div>` : ''}
    `;

    dom.detailApproveBtn.style.display = isPending ? '' : 'none';
    dom.detailRejectBtn.style.display  = isPending ? '' : 'none';

    openModal('detailModal');
}

dom.detailApproveBtn.addEventListener('click', () => {
    closeModal('detailModal');
    openApproveModal(state.targetEnrollment);
});

dom.detailRejectBtn.addEventListener('click', () => {
    closeModal('detailModal');
    openRejectModal(state.targetEnrollment);
});

/* ============================================================
   일괄 승인
   ============================================================ */
dom.bulkApproveBtn.addEventListener('click', async () => {
    const ids = [...state.selectedIds];
    if (ids.length === 0) return;

    const pendingIds = ids.filter(id => {
        const e = state.enrollments.find(en => en.id === id);
        return e && e.status === 'pending';
    });

    if (pendingIds.length === 0) {
        showToast('대기중 상태의 신청만 승인할 수 있습니다.', 'warning');
        return;
    }

    dom.bulkApproveBtn.disabled = true;
    dom.bulkApproveBtn.textContent = '처리 중...';

    let successCount = 0;
    let failCount = 0;

    for (const id of pendingIds) {
        try {
            await approveEnrollment(id);
            const idx = state.enrollments.findIndex(e => e.id === id);
            if (idx !== -1) state.enrollments[idx].status = 'approved';
            successCount++;
        } catch {
            failCount++;
        }
    }

    state.selectedIds.clear();
    updateStats();
    applyFilters();

    if (failCount === 0) {
        showToast(`${successCount}건이 일괄 승인되었습니다.`, 'success');
    } else {
        showToast(`승인: ${successCount}건 성공, ${failCount}건 실패.`, 'warning');
    }

    dom.bulkApproveBtn.disabled = false;
    dom.bulkApproveBtn.textContent = '일괄 승인';
});

/* ============================================================
   일괄 거부 (모달)
   ============================================================ */
dom.bulkRejectBtn.addEventListener('click', () => {
    const ids = [...state.selectedIds];
    const pendingIds = ids.filter(id => {
        const e = state.enrollments.find(en => en.id === id);
        return e && e.status === 'pending';
    });

    if (pendingIds.length === 0) {
        showToast('대기중 상태의 신청만 거부할 수 있습니다.', 'warning');
        return;
    }

    dom.bulkRejectCount.textContent = pendingIds.length;
    dom.bulkRejectReasonInput.value = '';
    dom.bulkRejectReasonError.style.display = 'none';
    openModal('bulkRejectModal');
});

dom.bulkRejectConfirmBtn.addEventListener('click', async () => {
    const reason = dom.bulkRejectReasonInput.value.trim();
    if (!reason) {
        dom.bulkRejectReasonError.style.display = 'block';
        dom.bulkRejectReasonInput.focus();
        return;
    }
    dom.bulkRejectReasonError.style.display = 'none';

    const ids = [...state.selectedIds];
    const pendingIds = ids.filter(id => {
        const e = state.enrollments.find(en => en.id === id);
        return e && e.status === 'pending';
    });

    dom.bulkRejectConfirmBtn.disabled = true;
    dom.bulkRejectConfirmBtn.textContent = '처리 중...';

    let successCount = 0;
    let failCount = 0;

    for (const id of pendingIds) {
        try {
            await rejectEnrollment(id, reason);
            const idx = state.enrollments.findIndex(e => e.id === id);
            if (idx !== -1) {
                state.enrollments[idx].status = 'rejected';
                state.enrollments[idx].reject_reason = reason;
            }
            successCount++;
        } catch {
            failCount++;
        }
    }

    state.selectedIds.clear();
    closeModal('bulkRejectModal');
    updateStats();
    applyFilters();

    if (failCount === 0) {
        showToast(`${successCount}건이 일괄 거부되었습니다.`, 'warning');
    } else {
        showToast(`거부: ${successCount}건 성공, ${failCount}건 실패.`, 'warning');
    }

    dom.bulkRejectConfirmBtn.disabled = false;
    dom.bulkRejectConfirmBtn.textContent = '일괄 거부하기';
});

/* ============================================================
   내보내기 (CSV)
   ============================================================ */
dom.exportBtn.addEventListener('click', () => {
    const data = state.filtered;
    if (data.length === 0) { showToast('내보낼 데이터가 없습니다.', 'warning'); return; }

    const header = ['번호', '신청자명', '이메일', '강의명', '신청일', '상태', '거부사유'];
    const rows = data.map((e, i) => [
        i + 1,
        `"${e.applicant}"`,
        `"${e.email}"`,
        `"${e.course}"`,
        formatDate(e.created_at),
        STATUS_MAP[e.status]?.label || e.status,
        `"${e.reject_reason}"`,
    ]);

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `enrollments_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV 파일이 다운로드되었습니다.', 'success');
});

/* ============================================================
   유틸
   ============================================================ */
function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ============================================================
   진입점
   ============================================================ */
checkAuth();
