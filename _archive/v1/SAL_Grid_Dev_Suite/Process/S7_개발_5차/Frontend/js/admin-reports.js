// @task S7F8
// @description 신고/차단 관리 JS - reports.html & blocked-users.html 공용

(function () {
    'use strict';

    /* ─────────────────────────────────────────
       Constants
    ───────────────────────────────────────── */
    const PAGE_SIZE = 20;

    const REASON_LABELS = {
        spam: '스팸',
        abuse: '욕설/혐오',
        false_info: '허위정보',
        other: '기타'
    };

    const TARGET_TYPE_LABELS = {
        post: '게시글',
        comment: '댓글',
        user: '사용자'
    };

    const STATUS_LABELS = {
        pending: '대기중',
        processed: '처리완료',
        rejected: '기각'
    };

    /* ─────────────────────────────────────────
       State
    ───────────────────────────────────────── */
    let supabaseClient = null;
    let currentPage = 1;
    let currentStatusFilter = 'all';
    let currentReasonFilter = 'all';
    let currentExtendFilter = 'all';
    let allData = [];
    let filteredData = [];
    let pendingReportId = null;
    let pendingUserId = null;
    let pendingBanDuration = null;
    let pendingExtendDays = null;
    let pendingUserName = '';

    // Page mode detection
    const isReportsPage = !!document.getElementById('reportTableBody');
    const isBlockedPage = !!document.getElementById('blockedTableBody');

    /* ─────────────────────────────────────────
       Nav scroll
    ───────────────────────────────────────── */
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('nav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
    });

    /* ─────────────────────────────────────────
       Init
    ───────────────────────────────────────── */
    async function init() {
        try {
            await AXON_CONFIG.init();
            supabaseClient = window.supabase.createClient(
                AXON_CONFIG.SUPABASE_URL,
                AXON_CONFIG.SUPABASE_ANON_KEY
            );
            window.supabaseClient = supabaseClient;

            const authed = await checkAdmin();
            if (!authed) return;

            updateNavAuth();

            if (isReportsPage) {
                await loadReports();
                setupReportFilters();
                setupSearch('searchInput', applyReportFilters);
            } else if (isBlockedPage) {
                await loadBlockedUsers();
                setupBlockedFilters();
                setupSearch('searchInput', applyBlockedFilters);
            }
        } catch (e) {
            console.error('[admin-reports] init error:', e);
            showAuthDenied();
        }
    }

    /* ─────────────────────────────────────────
       Auth
    ───────────────────────────────────────── */
    async function checkAdmin() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { showAuthDenied(); return false; }

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') { showAuthDenied(); return false; }

        document.getElementById('authLoading').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        return true;
    }

    function showAuthDenied() {
        document.getElementById('authLoading').style.display = 'none';
        const denied = document.getElementById('authDenied');
        if (denied) denied.style.display = 'flex';
    }

    async function updateNavAuth() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const navAuth = document.getElementById('navAuth');
        if (user && navAuth) {
            navAuth.innerHTML = `
                <span style="font-size:.85rem;color:var(--ink-muted);">관리자</span>
                <button class="btn-ghost" onclick="handleLogout()">로그아웃</button>
            `;
        }
    }

    window.handleLogout = async function () {
        await supabaseClient.auth.signOut();
        location.href = '/';
    };

    /* ─────────────────────────────────────────
       ══ REPORTS PAGE ══
    ───────────────────────────────────────── */

    async function loadReports() {
        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = loadingRow(8);

        const { data, error } = await supabaseClient
            .from('reports')
            .select(`
                id,
                target_type,
                target_id,
                reason,
                description,
                status,
                created_at,
                resolved_at,
                resolved_note,
                reporter:profiles!reports_reporter_id_fkey(id, display_name, email),
                target_user:profiles!reports_target_user_id_fkey(id, display_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[loadReports] error:', error);
            showToast('신고 목록을 불러오지 못했습니다.', 'error');
            tbody.innerHTML = errorRow(8);
            return;
        }

        allData = data || [];
        updateReportStats();
        applyReportFilters();
    }

    function updateReportStats() {
        const total = allData.length;
        const pending = allData.filter(r => r.status === 'pending').length;
        const processed = allData.filter(r => r.status === 'processed').length;
        const rejected = allData.filter(r => r.status === 'rejected').length;

        setText('statTotal', total);
        setText('statPending', pending);
        setText('statProcessed', processed);
        setText('statRejected', rejected);
    }

    function applyReportFilters() {
        const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const reasonFilter = document.getElementById('reasonFilter')?.value || 'all';

        filteredData = allData.filter(r => {
            const statusMatch = currentStatusFilter === 'all' || r.status === currentStatusFilter;
            const reasonMatch = reasonFilter === 'all' || r.reason === reasonFilter;
            const searchMatch = !query ||
                (r.reporter?.display_name || '').toLowerCase().includes(query) ||
                (r.reporter?.email || '').toLowerCase().includes(query) ||
                (r.target_user?.display_name || '').toLowerCase().includes(query) ||
                (r.target_user?.email || '').toLowerCase().includes(query) ||
                (r.description || '').toLowerCase().includes(query);
            return statusMatch && reasonMatch && searchMatch;
        });

        currentPage = 1;
        renderReportTable();
    }

    function renderReportTable() {
        const tbody = document.getElementById('reportTableBody');
        const paginated = paginate(filteredData, currentPage, PAGE_SIZE);

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">${emptyState('신고 내역이 없습니다')}</td></tr>`;
            hidePagination();
            return;
        }

        const offset = (currentPage - 1) * PAGE_SIZE;
        tbody.innerHTML = paginated.map((r, i) => {
            const targetLabel = TARGET_TYPE_LABELS[r.target_type] || r.target_type;
            const reasonLabel = REASON_LABELS[r.reason] || r.reason;
            const statusLabel = STATUS_LABELS[r.status] || r.status;
            const reporterName = esc(r.reporter?.display_name || r.reporter?.email || '알 수 없음');
            const targetUserName = esc(r.target_user?.display_name || r.target_user?.email || '-');
            const date = fmtDate(r.created_at);
            const isPending = r.status === 'pending';

            return `
                <tr>
                    <td style="color:var(--ink-muted);font-size:.8rem;">${offset + i + 1}</td>
                    <td>
                        <div style="font-weight:600;">${targetUserName}</div>
                        <div style="font-size:.78rem;color:var(--ink-muted);">${targetLabel} #${r.target_id ? r.target_id.slice(0,8) : '-'}</div>
                    </td>
                    <td><span class="badge type-${r.target_type || 'other'}">${targetLabel}</span></td>
                    <td><span class="badge ${r.reason || 'other'}">${reasonLabel}</span></td>
                    <td>
                        <div>${reporterName}</div>
                    </td>
                    <td class="date-text">${date}</td>
                    <td><span class="badge ${r.status || 'pending'}">${statusLabel}</span></td>
                    <td>
                        <div class="action-group">
                            <button class="action-btn warn" onclick="warnUser('${r.id}','${esc(r.target_user?.id || '')}','${escAttr(r.target_user?.display_name || '사용자')}')" ${!isPending ? 'disabled' : ''} title="경고 발송">경고</button>
                            <button class="action-btn ban" onclick="openBanModal('${r.id}','${esc(r.target_user?.id || '')}','${escAttr(r.target_user?.display_name || '사용자')}')" ${!isPending ? 'disabled' : ''} title="차단">차단</button>
                            <button class="action-btn dismiss" onclick="openDismissModal('${r.id}')" ${!isPending ? 'disabled' : ''} title="기각">기각</button>
                            <button class="action-btn detail" onclick="openReportDetail('${r.id}')">상세</button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        renderPagination(filteredData.length);
    }

    function setupReportFilters() {
        document.querySelectorAll('#statusFilters .filter-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('#statusFilters .filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentStatusFilter = this.dataset.filter;
                applyReportFilters();
            });
        });

        const reasonFilter = document.getElementById('reasonFilter');
        if (reasonFilter) {
            reasonFilter.addEventListener('change', applyReportFilters);
        }
    }

    /* ── Report Actions ── */

    window.warnUser = async function (reportId, userId, userName) {
        if (!userId) { showToast('대상 사용자를 찾을 수 없습니다.', 'error'); return; }

        const confirmed = confirm(`"${userName}" 사용자에게 경고를 발송하시겠습니까?\n\n※ 경고 3회 누적 시 자동 7일 차단됩니다.`);
        if (!confirmed) return;

        const { error } = await supabaseClient.rpc('process_report', {
            p_report_id: reportId,
            p_action: 'warn',
            p_ban_duration: null
        });

        if (error) {
            console.error('[warnUser] error:', error);
            showToast('경고 발송에 실패했습니다.', 'error');
            return;
        }

        showToast('경고가 발송되었습니다.', 'success');
        await loadReports();
    };

    window.openBanModal = function (reportId, userId, userName) {
        if (!userId) { showToast('대상 사용자를 찾을 수 없습니다.', 'error'); return; }
        pendingReportId = reportId;
        pendingUserId = userId;
        pendingUserName = userName;
        pendingBanDuration = null;

        document.getElementById('banTargetInfo').textContent = userName;
        document.getElementById('banConfirmBtn').disabled = true;

        // Reset duration selections
        document.querySelectorAll('.duration-option').forEach(el => el.classList.remove('selected'));
        openModal('banModal');
    };

    window.selectDuration = function (el, days) {
        document.querySelectorAll('#banModal .duration-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        pendingBanDuration = days;
        document.getElementById('banConfirmBtn').disabled = false;
    };

    window.confirmBan = async function () {
        if (!pendingReportId || !pendingUserId || pendingBanDuration === null) return;

        const durationLabel = pendingBanDuration === 0 ? '영구' : `${pendingBanDuration}일`;
        const confirmed = confirm(`"${pendingUserName}" 사용자를 ${durationLabel} 차단하시겠습니까?`);
        if (!confirmed) return;

        closeModal('banModal');

        const { error } = await supabaseClient.rpc('process_report', {
            p_report_id: pendingReportId,
            p_action: 'ban',
            p_ban_duration: pendingBanDuration === 0 ? null : pendingBanDuration
        });

        if (error) {
            console.error('[confirmBan] error:', error);
            showToast('차단 처리에 실패했습니다.', 'error');
            return;
        }

        showToast(`"${pendingUserName}" 사용자가 ${durationLabel} 차단되었습니다.`, 'success');
        pendingReportId = null;
        pendingUserId = null;
        pendingBanDuration = null;
        await loadReports();
    };

    window.openDismissModal = function (reportId) {
        pendingReportId = reportId;
        const textarea = document.getElementById('dismissReason');
        if (textarea) textarea.value = '';
        openModal('dismissModal');
    };

    window.confirmDismiss = async function () {
        if (!pendingReportId) return;

        const reason = (document.getElementById('dismissReason')?.value || '').trim();
        closeModal('dismissModal');

        const { error } = await supabaseClient.rpc('process_report', {
            p_report_id: pendingReportId,
            p_action: 'dismiss',
            p_ban_duration: null
        });

        if (error) {
            console.error('[confirmDismiss] error:', error);
            showToast('기각 처리에 실패했습니다.', 'error');
            return;
        }

        // Optionally store dismiss reason in resolved_note
        if (reason) {
            await supabaseClient
                .from('reports')
                .update({ resolved_note: reason })
                .eq('id', pendingReportId);
        }

        showToast('신고가 기각 처리되었습니다.', 'warning');
        pendingReportId = null;
        await loadReports();
    };

    window.openReportDetail = function (reportId) {
        const r = allData.find(x => x.id === reportId);
        if (!r) return;

        const reporterName = r.reporter?.display_name || r.reporter?.email || '알 수 없음';
        const targetName = r.target_user?.display_name || r.target_user?.email || '-';
        const targetLabel = TARGET_TYPE_LABELS[r.target_type] || r.target_type;
        const reasonLabel = REASON_LABELS[r.reason] || r.reason;
        const statusLabel = STATUS_LABELS[r.status] || r.status;

        document.getElementById('detailContent').innerHTML = `
            <div class="modal-field"><label>신고 ID</label><div class="value">${esc(r.id)}</div></div>
            <div class="modal-field"><label>신고 대상</label><div class="value">${esc(targetName)} (${targetLabel})</div></div>
            <div class="modal-field"><label>신고 사유</label><div class="value">${esc(reasonLabel)}</div></div>
            <div class="modal-field"><label>상세 내용</label><div class="value">${esc(r.description || '없음')}</div></div>
            <div class="modal-field"><label>신고자</label><div class="value">${esc(reporterName)}</div></div>
            <div class="modal-field"><label>신고일</label><div class="value">${fmtDateFull(r.created_at)}</div></div>
            <div class="modal-field"><label>처리 상태</label><div class="value">${esc(statusLabel)}</div></div>
            ${r.resolved_at ? `<div class="modal-field"><label>처리일</label><div class="value">${fmtDateFull(r.resolved_at)}</div></div>` : ''}
            ${r.resolved_note ? `<div class="modal-field"><label>처리 사유</label><div class="value">${esc(r.resolved_note)}</div></div>` : ''}
        `;

        openModal('detailModal');
    };

    /* ─────────────────────────────────────────
       ══ BLOCKED USERS PAGE ══
    ───────────────────────────────────────── */

    async function loadBlockedUsers() {
        const tbody = document.getElementById('blockedTableBody');
        tbody.innerHTML = loadingRow(8);

        const { data, error } = await supabaseClient
            .from('user_bans')
            .select(`
                id,
                user_id,
                reason,
                ban_duration,
                banned_at,
                unban_at,
                is_permanent,
                unbanned_by,
                is_active,
                user:profiles!user_bans_user_id_fkey(id, display_name, email)
            `)
            .order('banned_at', { ascending: false });

        if (error) {
            console.error('[loadBlockedUsers] error:', error);
            showToast('차단 목록을 불러오지 못했습니다.', 'error');
            tbody.innerHTML = errorRow(8);
            return;
        }

        allData = data || [];
        updateBlockedStats();
        applyBlockedFilters();
    }

    function updateBlockedStats() {
        const now = new Date();
        const total = allData.length;
        const perm = allData.filter(b => b.is_permanent).length;
        const temp = allData.filter(b => b.is_active && !b.is_permanent).length;
        const expiring = allData.filter(b => {
            if (!b.unban_at || b.is_permanent || !b.is_active) return false;
            const diff = (new Date(b.unban_at) - now) / (1000 * 60 * 60 * 24);
            return diff <= 3 && diff > 0;
        }).length;

        setText('statTotal', total);
        setText('statTemp', temp);
        setText('statPerm', perm);
        setText('statExpiring', expiring);
    }

    function applyBlockedFilters() {
        const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
        const now = new Date();

        filteredData = allData.filter(b => {
            let statusMatch = true;
            if (currentExtendFilter === 'active') statusMatch = b.is_active && !b.is_permanent;
            else if (currentExtendFilter === 'permanent') statusMatch = b.is_permanent;
            else if (currentExtendFilter === 'expired') statusMatch = !b.is_active;

            const searchMatch = !query ||
                (b.user?.display_name || '').toLowerCase().includes(query) ||
                (b.user?.email || '').toLowerCase().includes(query) ||
                (b.reason || '').toLowerCase().includes(query);

            return statusMatch && searchMatch;
        });

        currentPage = 1;
        renderBlockedTable();
    }

    function renderBlockedTable() {
        const tbody = document.getElementById('blockedTableBody');
        const paginated = paginate(filteredData, currentPage, PAGE_SIZE);

        if (filteredData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">${emptyState('차단된 사용자가 없습니다')}</td></tr>`;
            hidePagination();
            return;
        }

        const now = new Date();
        const offset = (currentPage - 1) * PAGE_SIZE;

        tbody.innerHTML = paginated.map((b, i) => {
            const userName = esc(b.user?.display_name || '알 수 없음');
            const userEmail = esc(b.user?.email || '');
            const bannedAt = fmtDate(b.banned_at);
            const unbanAt = b.is_permanent ? '영구' : (b.unban_at ? fmtDate(b.unban_at) : '-');
            const isActive = b.is_active;

            // Days remaining
            let daysHtml = '';
            if (b.is_permanent) {
                daysHtml = '<span class="days-remaining perm">영구</span>';
            } else if (!isActive) {
                daysHtml = '<span class="days-remaining done">만료됨</span>';
            } else if (b.unban_at) {
                const diff = Math.ceil((new Date(b.unban_at) - now) / (1000 * 60 * 60 * 24));
                const cls = diff <= 3 ? 'urgent' : 'normal';
                daysHtml = `<span class="days-remaining ${cls}">${diff}일 남음</span>`;
            }

            // Status badge
            let statusBadge = '';
            if (b.is_permanent) {
                statusBadge = '<span class="badge perm-ban">영구차단</span>';
            } else if (!isActive) {
                statusBadge = '<span class="badge expired">만료됨</span>';
            } else if (b.unban_at) {
                const diff = (new Date(b.unban_at) - now) / (1000 * 60 * 60 * 24);
                statusBadge = diff <= 3
                    ? '<span class="badge expiring-soon">곧 만료</span>'
                    : '<span class="badge active-ban">차단중</span>';
            }

            return `
                <tr>
                    <td style="color:var(--ink-muted);font-size:.8rem;">${offset + i + 1}</td>
                    <td>
                        <div class="user-info">
                            <div class="name">${userName}</div>
                            <div class="email">${userEmail}</div>
                        </div>
                    </td>
                    <td class="reason-text" title="${escAttr(b.reason || '')}">${esc(b.reason || '-')}</td>
                    <td class="date-text">${bannedAt}</td>
                    <td class="date-text">${unbanAt}</td>
                    <td>${daysHtml}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="action-group">
                            <button class="action-btn unblock" onclick="openUnblockModal('${b.user_id}','${escAttr(b.user?.display_name || b.user?.email || '사용자')}')" ${!isActive ? 'disabled' : ''}>해제</button>
                            <button class="action-btn extend" onclick="openExtendModal('${b.user_id}','${escAttr(b.user?.display_name || b.user?.email || '사용자')}')" ${(!isActive || b.is_permanent) ? 'disabled' : ''}>연장</button>
                            <button class="action-btn detail" onclick="openBlockedDetail('${b.id}')">상세</button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        renderPagination(filteredData.length);
    }

    function setupBlockedFilters() {
        document.querySelectorAll('#statusFilters .filter-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('#statusFilters .filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentExtendFilter = this.dataset.filter;
                applyBlockedFilters();
            });
        });
    }

    /* ── Blocked Actions ── */

    window.openUnblockModal = function (userId, userName) {
        pendingUserId = userId;
        pendingUserName = userName;
        document.getElementById('unblockTargetInfo').textContent = userName;
        openModal('unblockModal');
    };

    window.confirmUnblock = async function () {
        if (!pendingUserId) return;
        closeModal('unblockModal');

        const { error } = await supabaseClient.rpc('unblock_user', {
            p_user_id: pendingUserId
        });

        if (error) {
            console.error('[confirmUnblock] error:', error);
            showToast('차단 해제에 실패했습니다.', 'error');
            return;
        }

        showToast(`"${pendingUserName}" 사용자의 차단이 해제되었습니다.`, 'success');
        pendingUserId = null;
        await loadBlockedUsers();
    };

    window.openExtendModal = function (userId, userName) {
        pendingUserId = userId;
        pendingUserName = userName;
        pendingExtendDays = null;
        document.getElementById('extendTargetInfo').textContent = userName;
        document.getElementById('extendConfirmBtn').disabled = true;
        document.querySelectorAll('#extendModal .duration-option').forEach(e => e.classList.remove('selected'));
        openModal('extendModal');
    };

    window.selectExtendDuration = function (el, days) {
        document.querySelectorAll('#extendModal .duration-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        pendingExtendDays = days;
        document.getElementById('extendConfirmBtn').disabled = false;
    };

    window.confirmExtend = async function () {
        if (!pendingUserId || !pendingExtendDays) return;
        closeModal('extendModal');

        const { error } = await supabaseClient.rpc('extend_ban', {
            p_user_id: pendingUserId,
            p_additional_days: pendingExtendDays
        });

        if (error) {
            console.error('[confirmExtend] error:', error);
            showToast('차단 기간 연장에 실패했습니다.', 'error');
            return;
        }

        showToast(`"${pendingUserName}" 차단 기간이 ${pendingExtendDays}일 연장되었습니다.`, 'success');
        pendingUserId = null;
        pendingExtendDays = null;
        await loadBlockedUsers();
    };

    window.openBlockedDetail = function (banId) {
        const b = allData.find(x => x.id === banId);
        if (!b) return;

        const userName = b.user?.display_name || '알 수 없음';
        const userEmail = b.user?.email || '-';
        const statusLabel = b.is_permanent ? '영구차단' : (b.is_active ? '차단중' : '만료됨');

        document.getElementById('detailContent').innerHTML = `
            <div class="modal-field"><label>사용자</label><div class="value">${esc(userName)} (${esc(userEmail)})</div></div>
            <div class="modal-field"><label>차단 사유</label><div class="value">${esc(b.reason || '-')}</div></div>
            <div class="modal-field"><label>차단 기간</label><div class="value">${b.is_permanent ? '영구' : `${b.ban_duration || '-'}일`}</div></div>
            <div class="modal-field"><label>차단 시작일</label><div class="value">${fmtDateFull(b.banned_at)}</div></div>
            <div class="modal-field"><label>차단 해제일</label><div class="value">${b.is_permanent ? '해제 없음' : (b.unban_at ? fmtDateFull(b.unban_at) : '-')}</div></div>
            <div class="modal-field"><label>상태</label><div class="value">${esc(statusLabel)}</div></div>
        `;

        openModal('detailModal');
    };

    /* ─────────────────────────────────────────
       Pagination
    ───────────────────────────────────────── */
    function renderPagination(totalItems) {
        const paginationEl = document.getElementById('pagination');
        if (!paginationEl) return;

        const totalPages = Math.ceil(totalItems / PAGE_SIZE);

        if (totalPages <= 1) {
            paginationEl.style.display = 'none';
            return;
        }

        paginationEl.style.display = 'flex';

        let html = '';
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&#8249;</button>`;

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="page-info">...</span>`;
        }

        for (let p = startPage; p <= endPage; p++) {
            html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-info">...</span>`;
            html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
        }

        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&#8250;</button>`;
        html += `<span class="page-info">${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, totalItems)} / ${totalItems}</span>`;

        paginationEl.innerHTML = html;
    }

    window.goToPage = function (page) {
        const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        if (isReportsPage) renderReportTable();
        else if (isBlockedPage) renderBlockedTable();
    };

    function hidePagination() {
        const el = document.getElementById('pagination');
        if (el) el.style.display = 'none';
    }

    /* ─────────────────────────────────────────
       Modal helpers
    ───────────────────────────────────────── */
    window.openModal = function (id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    };

    window.closeModal = function (id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    };

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    /* ─────────────────────────────────────────
       Search helper
    ───────────────────────────────────────── */
    function setupSearch(inputId, applyFn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        let timer;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(applyFn, 280);
        });
    }

    /* ─────────────────────────────────────────
       Toast
    ───────────────────────────────────────── */
    function showToast(msg, type = '') {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.className = 'toast show';
        if (type) t.classList.add(type);
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.className = 'toast'; }, 3200);
    }
    window.showToast = showToast;

    /* ─────────────────────────────────────────
       Utility helpers
    ───────────────────────────────────────── */
    function esc(s) {
        if (s == null) return '';
        const d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    function escAttr(s) {
        if (s == null) return '';
        return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function fmtDate(iso) {
        if (!iso) return '-';
        return new Date(iso).toLocaleDateString('ko-KR');
    }

    function fmtDateFull(iso) {
        if (!iso) return '-';
        return new Date(iso).toLocaleString('ko-KR');
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function paginate(arr, page, size) {
        return arr.slice((page - 1) * size, page * size);
    }

    function loadingRow(cols) {
        return `<tr><td colspan="${cols}"><div class="empty-state"><div class="icon">⏳</div><p>로딩 중...</p></div></td></tr>`;
    }

    function errorRow(cols) {
        return `<tr><td colspan="${cols}"><div class="empty-state"><div class="icon">⚠️</div><p>데이터를 불러오지 못했습니다.</p></div></td></tr>`;
    }

    function emptyState(msg) {
        return `<div class="empty-state"><div class="icon">📭</div><p>${msg}</p></div>`;
    }

    /* ─────────────────────────────────────────
       Bootstrap
    ───────────────────────────────────────── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
