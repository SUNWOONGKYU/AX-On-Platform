// @task S7F7
// @description 문의 관리 JS — 목록 페이지(inquiries.html)와 상세/답변 페이지(inquiry-detail.html) 공통 모듈
// @area Frontend
// @stage S7

(function () {
    'use strict';

    /* ══════════════════════════════════════
       공통 유틸
    ══════════════════════════════════════ */

    /**
     * HTML 이스케이프 (XSS 방지)
     * @param {string} s
     * @returns {string}
     */
    function esc(s) {
        if (!s) return '';
        const d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    /**
     * 날짜 포맷 (YYYY.MM.DD)
     * @param {string} iso
     * @returns {string}
     */
    function fmtDate(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    /**
     * 날짜+시각 포맷 (YYYY.MM.DD HH:MM)
     * @param {string} iso
     * @returns {string}
     */
    function fmtDateTime(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    /**
     * 카테고리 라벨 및 badge 클래스
     * @param {string} cat
     * @returns {{ label: string, cls: string }}
     */
    function getCategoryMeta(cat) {
        const map = {
            lecture:  { label: '강의',     cls: 'cat-lecture'  },
            tech:     { label: '기술지원', cls: 'cat-tech'     },
            payment:  { label: '결제',     cls: 'cat-payment'  },
            other:    { label: '기타',     cls: 'cat-other'    },
        };
        return map[cat] || { label: cat || '기타', cls: 'cat-other' };
    }

    /**
     * 상태 라벨 및 badge 클래스
     * @param {string} status
     * @returns {{ label: string, cls: string }}
     */
    function getStatusMeta(status) {
        if (status === 'answered') return { label: '답변완료', cls: 'status-done' };
        return { label: '대기중', cls: 'status-wait' };
    }

    /**
     * Toast 알림 표시
     * @param {string} msg
     * @param {'default'|'success'|'error'} type
     */
    function showToast(msg, type = 'default') {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.className = 'toast show' + (type !== 'default' ? ' ' + type : '');
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.classList.remove('show'); }, 3200);
    }

    /* ══════════════════════════════════════
       Supabase 초기화 + 관리자 인증
    ══════════════════════════════════════ */

    let supabase = null;

    /**
     * Supabase 클라이언트를 초기화합니다.
     * AXON_CONFIG (config.js)에서 URL/KEY를 로드합니다.
     */
    async function initSupabase() {
        if (typeof AXON_CONFIG === 'undefined') {
            throw new Error('AXON_CONFIG not loaded. config.js를 확인하세요.');
        }
        let url = AXON_CONFIG.SUPABASE_URL;
        let key = AXON_CONFIG.SUPABASE_ANON_KEY;

        // config.js 동적 init 메서드 지원
        if (typeof AXON_CONFIG.init === 'function') {
            await AXON_CONFIG.init();
            url = AXON_CONFIG.SUPABASE_URL;
            key = AXON_CONFIG.SUPABASE_ANON_KEY;
        }

        if (!url || !key) throw new Error('Supabase URL/KEY가 설정되지 않았습니다.');
        supabase = window.supabase.createClient(url, key);
    }

    /**
     * 현재 세션이 관리자(role='admin')인지 확인합니다.
     * @returns {Promise<boolean>}
     */
    async function checkAdmin() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !profile) return false;
        return profile.role === 'admin';
    }

    /**
     * Auth Loading 화면을 숨기고, mainContent를 표시합니다.
     */
    function showMain() {
        const loading = document.getElementById('authLoading');
        const main = document.getElementById('mainContent');
        if (loading) loading.style.display = 'none';
        if (main) main.style.display = 'block';
    }

    /**
     * 접근 거부 화면을 표시합니다.
     */
    function showDenied() {
        const loading = document.getElementById('authLoading');
        const denied = document.getElementById('authDenied');
        if (loading) loading.style.display = 'none';
        if (denied) denied.style.display = 'flex';
    }

    /**
     * 네비게이션에 사용자 이름을 표시합니다.
     */
    async function updateNavUser() {
        const { data: { user } } = await supabase.auth.getUser();
        const el = document.getElementById('navUserName');
        if (el && user) {
            el.textContent = user.email || '관리자';
        }
    }

    /**
     * 로그아웃 처리 (전역 함수)
     */
    window.handleLogout = async function () {
        if (!supabase) return;
        await supabase.auth.signOut();
        location.href = '/index.html';
    };

    /* ══════════════════════════════════════
       페이지 분기: 목록 vs 상세
    ══════════════════════════════════════ */

    const isDetailPage = location.pathname.includes('inquiry-detail');

    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await initSupabase();
            const isAdmin = await checkAdmin();
            if (!isAdmin) { showDenied(); return; }
            showMain();
            await updateNavUser();

            if (isDetailPage) {
                await initDetailPage();
            } else {
                await initListPage();
            }
        } catch (err) {
            console.error('[admin-inquiries] init error:', err);
            showDenied();
        }
    });

    /* ══════════════════════════════════════
       목록 페이지 (inquiries.html)
    ══════════════════════════════════════ */

    const PAGE_SIZE = 20;
    let allInquiries = [];
    let filteredInquiries = [];
    let currentPage = 1;
    let currentStatus = '';
    let currentCategory = '';
    let searchQuery = '';

    async function initListPage() {
        await loadInquiries();
        setupListFilters();
        setupSearch();
    }

    /**
     * contact_inquiries 테이블에서 전체 문의를 불러옵니다.
     */
    async function loadInquiries() {
        const { data, error } = await supabase
            .from('contact_inquiries')
            .select('id, subject, name, email, phone, category, message, status, created_at, answered_at, attachments')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[admin-inquiries] loadInquiries error:', error);
            showToast('문의 목록을 불러오지 못했습니다.', 'error');
            renderEmptyTable('데이터를 불러오지 못했습니다.');
            return;
        }

        allInquiries = data || [];
        updateStats();
        applyFilters();
    }

    /**
     * 통계 카드 업데이트
     */
    function updateStats() {
        const total    = allInquiries.length;
        const waiting  = allInquiries.filter(i => i.status !== 'answered').length;
        const answered = allInquiries.filter(i => i.status === 'answered').length;

        const today = new Date().toISOString().slice(0, 10);
        const todayCount = allInquiries.filter(i => (i.created_at || '').startsWith(today)).length;

        document.getElementById('statTotal').textContent    = total;
        document.getElementById('statWaiting').textContent  = waiting;
        document.getElementById('statAnswered').textContent = answered;
        document.getElementById('statToday').textContent    = todayCount;
    }

    /**
     * 필터/검색 적용 후 테이블 + 페이지네이션 렌더
     */
    function applyFilters() {
        const q = searchQuery.toLowerCase().trim();

        filteredInquiries = allInquiries.filter(i => {
            if (currentStatus && i.status !== currentStatus) {
                // 'pending' 필터: status가 null/'pending'/'waiting' 등 answered가 아닌 것
                if (currentStatus === 'pending' && i.status === 'answered') return false;
                if (currentStatus === 'answered' && i.status !== 'answered') return false;
            }
            if (currentCategory && i.category !== currentCategory) return false;
            if (q) {
                const titleMatch = (i.subject || '').toLowerCase().includes(q);
                const nameMatch  = (i.name || '').toLowerCase().includes(q);
                if (!titleMatch && !nameMatch) return false;
            }
            return true;
        });

        currentPage = 1;
        renderTable();
        renderPagination();
    }

    /**
     * 현재 페이지 테이블 렌더
     */
    function renderTable() {
        const tbody = document.getElementById('inquiryTableBody');
        if (!tbody) return;

        const start = (currentPage - 1) * PAGE_SIZE;
        const pageItems = filteredInquiries.slice(start, start + PAGE_SIZE);

        if (pageItems.length === 0) {
            renderEmptyTable('조건에 맞는 문의가 없습니다.');
            return;
        }

        tbody.innerHTML = pageItems.map((inq, idx) => {
            const rowNum   = filteredInquiries.length - start - idx;
            const catMeta  = getCategoryMeta(inq.category);
            const statMeta = getStatusMeta(inq.status);
            const detailUrl = `inquiry-detail.html?id=${encodeURIComponent(inq.id)}`;

            return `
            <tr>
                <td class="row-num">${rowNum}</td>
                <td>
                    <div class="inquiry-title">
                        <a href="${detailUrl}">${esc(inq.subject || '(제목 없음)')}</a>
                    </div>
                </td>
                <td class="user-name">${esc(inq.name || '-')}</td>
                <td><span class="badge ${catMeta.cls}">${catMeta.label}</span></td>
                <td class="date-text">${fmtDate(inq.created_at)}</td>
                <td><span class="badge ${statMeta.cls}">${statMeta.label}</span></td>
                <td>
                    <a href="${detailUrl}" class="action-btn">답변</a>
                </td>
            </tr>`;
        }).join('');
    }

    function renderEmptyTable(msg) {
        const tbody = document.getElementById('inquiryTableBody');
        if (!tbody) return;
        tbody.innerHTML = `
            <tr><td colspan="7">
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <p>${esc(msg)}</p>
                </div>
            </td></tr>`;
    }

    /**
     * 페이지네이션 렌더
     */
    function renderPagination() {
        const wrap = document.getElementById('pagination');
        if (!wrap) return;

        const totalPages = Math.ceil(filteredInquiries.length / PAGE_SIZE);
        if (totalPages <= 1) { wrap.innerHTML = ''; return; }

        const total = filteredInquiries.length;
        const startNum = (currentPage - 1) * PAGE_SIZE + 1;
        const endNum = Math.min(currentPage * PAGE_SIZE, total);

        let html = `
            <span class="pg-info">${startNum}–${endNum} / ${total}건</span>
            <button class="pg-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

        // 최대 7개 페이지 버튼 표시 (현재 기준 ±3)
        const delta = 3;
        const left  = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);

        if (left > 1) {
            html += `<button class="pg-btn" onclick="goPage(1)">1</button>`;
            if (left > 2) html += `<span class="pg-info">…</span>`;
        }
        for (let p = left; p <= right; p++) {
            html += `<button class="pg-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`;
        }
        if (right < totalPages) {
            if (right < totalPages - 1) html += `<span class="pg-info">…</span>`;
            html += `<button class="pg-btn" onclick="goPage(${totalPages})">${totalPages}</button>`;
        }

        html += `<button class="pg-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
        wrap.innerHTML = html;
    }

    /**
     * 페이지 이동 (전역 함수)
     * @param {number} page
     */
    window.goPage = function (page) {
        const totalPages = Math.ceil(filteredInquiries.length / PAGE_SIZE);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        renderTable();
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * 상태/카테고리 필터 이벤트 등록
     */
    function setupListFilters() {
        // 상태 탭
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const val = this.dataset.status;
                currentStatus = val;
                applyFilters();
            });
        });

        // 카테고리 select
        const catSel = document.getElementById('categoryFilter');
        if (catSel) {
            catSel.addEventListener('change', function () {
                currentCategory = this.value;
                applyFilters();
            });
        }
    }

    /**
     * 검색창 이벤트 등록
     */
    function setupSearch() {
        const input = document.getElementById('searchInput');
        if (!input) return;
        let debounceTimer;
        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = this.value;
                applyFilters();
            }, 280);
        });
    }

    /* ══════════════════════════════════════
       상세/답변 페이지 (inquiry-detail.html)
    ══════════════════════════════════════ */

    let inquiryData  = null;
    let quillEditor  = null;
    let uploadedFiles = [];

    /** 답변 템플릿 내용 */
    const REPLY_TEMPLATES = {
        general: `안녕하세요, AX-On Platform 고객지원팀입니다.

문의해 주셔서 감사합니다. 보내주신 내용을 확인하였습니다.

[답변 내용을 이곳에 작성하세요]

앞으로도 궁금한 점이 있으시면 언제든지 문의해 주세요.
감사합니다.

AX-On Platform 고객지원팀`,

        tech: `안녕하세요, AX-On Platform 기술지원팀입니다.

접수하신 기술 문의 내용을 검토하였습니다.

[기술 지원 내용을 이곳에 작성하세요]

문제가 해결되지 않으실 경우 스크린샷이나 오류 메시지와 함께 재문의 주시면 더욱 빠르게 도움드리겠습니다.

AX-On Platform 기술지원팀`,

        payment: `안녕하세요, AX-On Platform 결제지원팀입니다.

결제 관련 문의를 주셔서 감사합니다.

[결제 관련 답변을 이곳에 작성하세요]

결제 관련 추가 문의사항이 있으시면 언제든지 연락 주시기 바랍니다.
결제 문의: ${typeof AXON_CONFIG !== 'undefined' ? AXON_CONFIG.CONTACT_EMAIL : 'contact@ax-on.net'}

AX-On Platform 결제지원팀`,
    };

    async function initDetailPage() {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (!id) {
            showToast('문의 ID가 없습니다.', 'error');
            return;
        }

        initQuill();
        setupTemplateSelect();
        setupFileUpload();

        await loadInquiryDetail(id);
        await loadPreviousResponses(id);
    }

    /**
     * Quill 에디터 초기화
     */
    function initQuill() {
        if (typeof Quill === 'undefined') {
            console.warn('[admin-inquiries] Quill not loaded. Falling back to textarea.');
            return;
        }
        quillEditor = new Quill('#quillEditor', {
            theme: 'snow',
            placeholder: '답변 내용을 입력하세요...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean'],
                ],
            },
        });
    }

    /**
     * 템플릿 선택 이벤트
     */
    function setupTemplateSelect() {
        const sel = document.getElementById('templateSelect');
        if (!sel) return;
        sel.addEventListener('change', function () {
            const tplKey = this.value;
            if (!tplKey || !REPLY_TEMPLATES[tplKey]) return;
            const content = REPLY_TEMPLATES[tplKey];
            if (quillEditor) {
                quillEditor.setText(content);
            }
        });
    }

    /**
     * 파일 업로드 이벤트 설정
     */
    function setupFileUpload() {
        const input = document.getElementById('fileInput');
        if (!input) return;

        input.addEventListener('change', function () {
            handleFiles(Array.from(this.files));
            this.value = ''; // 동일 파일 재선택 허용
        });

        // Drag & drop
        const area = document.querySelector('.file-upload-area');
        if (area) {
            area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--violet)'; });
            area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
            area.addEventListener('drop', e => {
                e.preventDefault();
                area.style.borderColor = '';
                handleFiles(Array.from(e.dataTransfer.files));
            });
        }
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    function handleFiles(files) {
        const warn = document.getElementById('fileSizeWarn');
        const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
        if (oversized.length > 0) {
            warn.textContent = `파일 크기 초과: ${oversized.map(f => f.name).join(', ')} (최대 5MB)`;
            warn.style.display = 'block';
            files = files.filter(f => f.size <= MAX_FILE_SIZE);
        } else {
            warn.style.display = 'none';
        }

        uploadedFiles.push(...files);
        renderFileList();
    }

    function renderFileList() {
        const list = document.getElementById('fileList');
        if (!list) return;
        list.innerHTML = uploadedFiles.map((f, idx) => `
            <div class="file-item">
                <span class="file-item-name">📎 ${esc(f.name)} <span style="color:var(--ink-muted);font-size:.72rem;">(${(f.size / 1024).toFixed(1)}KB)</span></span>
                <button class="file-item-remove" onclick="removeFile(${idx})" title="삭제">✕</button>
            </div>`).join('');
    }

    window.removeFile = function (idx) {
        uploadedFiles.splice(idx, 1);
        renderFileList();
    };

    /**
     * 문의 상세 정보 로드
     * @param {string} id
     */
    async function loadInquiryDetail(id) {
        const { data, error } = await supabase
            .from('contact_inquiries')
            .select('id, subject, name, email, phone, category, message, status, created_at, answered_at, attachments')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('[admin-inquiries] loadInquiryDetail error:', error);
            showToast('문의 정보를 불러오지 못했습니다.', 'error');
            return;
        }

        inquiryData = data;
        renderInquiryDetail(data);
        renderUserInfo(data);
    }

    /**
     * 문의 원문 렌더
     * @param {Object} inq
     */
    function renderInquiryDetail(inq) {
        const body = document.getElementById('inquiryDetailBody');
        const statusBadgeWrap = document.getElementById('inquiryStatusBadge');
        if (!body) return;

        const catMeta  = getCategoryMeta(inq.category);
        const statMeta = getStatusMeta(inq.status);

        if (statusBadgeWrap) {
            statusBadgeWrap.innerHTML = `<span class="badge ${statMeta.cls}">${statMeta.label}</span>`;
        }

        // 첨부파일 목록
        let attachHtml = '';
        const attachments = Array.isArray(inq.attachments) ? inq.attachments : [];
        if (attachments.length > 0) {
            const items = attachments.map(a => `
                <div class="attachment-item">
                    📎 <a href="${esc(a.url || '#')}" target="_blank" rel="noopener">${esc(a.name || a)}</a>
                </div>`).join('');
            attachHtml = `
                <div class="attachments">
                    <div class="attachment-label">첨부파일</div>
                    <div class="attachment-list">${items}</div>
                </div>`;
        }

        body.innerHTML = `
            <div class="inquiry-subject">${esc(inq.subject || '(제목 없음)')}</div>
            <div class="inquiry-meta">
                <div class="meta-item">
                    <span>📂</span>
                    <span class="badge ${catMeta.cls}" style="font-size:.8rem;">${catMeta.label}</span>
                </div>
                <span class="meta-sep">|</span>
                <div class="meta-item">🕐 <span>${fmtDateTime(inq.created_at)}</span></div>
            </div>
            <div class="inquiry-body">${esc(inq.message || '(내용 없음)')}</div>
            ${attachHtml}`;

        // 이미 답변 완료인 경우 배너 표시
        if (inq.status === 'answered') {
            const banner = document.getElementById('alreadyAnsweredBanner');
            if (banner) banner.style.display = 'block';
        }
    }

    /**
     * 문의자 정보 렌더
     * @param {Object} inq
     */
    function renderUserInfo(inq) {
        const body = document.getElementById('userInfoBody');
        if (!body) return;

        const rows = [
            { key: '이름',     val: inq.name || '-'  },
            { key: '이메일',   val: inq.email || '-' },
            { key: '연락처',   val: inq.phone || '-' },
            { key: '접수일시', val: fmtDateTime(inq.created_at) },
            { key: '답변일시', val: inq.answered_at ? fmtDateTime(inq.answered_at) : '미답변' },
        ];

        body.innerHTML = rows.map(r => `
            <div class="info-row">
                <span class="info-key">${r.key}</span>
                <span class="info-val">${esc(r.val)}</span>
            </div>`).join('');
    }

    /**
     * 기존 답변 목록 로드
     * @param {string} inquiryId
     */
    async function loadPreviousResponses(inquiryId) {
        const { data, error } = await supabase
            .from('inquiry_responses')
            .select('id, response_text, responded_at, responded_by')
            .eq('inquiry_id', inquiryId)
            .order('responded_at', { ascending: true });

        if (error) {
            console.warn('[admin-inquiries] loadPreviousResponses error:', error);
            return;
        }

        if (!data || data.length === 0) return;

        const wrap = document.getElementById('prevResponsesWrap');
        const body = document.getElementById('prevResponsesBody');
        if (!wrap || !body) return;
        wrap.style.display = 'block';

        body.innerHTML = data.map(r => `
            <div class="prev-response">
                <div class="prev-response-header">
                    <div class="prev-response-title">✅ 관리자 답변</div>
                    <div class="prev-response-date">${fmtDateTime(r.responded_at)}</div>
                </div>
                <div class="prev-response-body">${esc(r.response_text || '')}</div>
            </div>`).join('');
    }

    /**
     * 답변 제출 — submit_inquiry_response RPC 호출
     */
    window.submitResponse = async function () {
        if (!inquiryData) {
            showToast('문의 정보를 불러오는 중입니다.', 'error');
            return;
        }

        // 답변 내용 추출
        let responseText = '';
        if (quillEditor) {
            responseText = quillEditor.getText().trim();
        } else {
            // Quill 로드 실패 시 fallback (textarea 방식 없음 — Quill 필수)
            responseText = '';
        }

        if (!responseText) {
            showToast('답변 내용을 입력해주세요.', 'error');
            return;
        }

        const btn = document.getElementById('submitBtn');
        if (btn) { btn.disabled = true; btn.querySelector('span').textContent = '전송 중...'; }

        try {
            // 파일 업로드 (Storage 사용 시 — 현재는 메타데이터만 첨부)
            // 실제 Storage 연동이 필요한 경우 supabase.storage.from('inquiry-attachments').upload() 호출
            // 여기서는 파일 이름 목록만 기록 (추후 확장 가능)

            const { error } = await supabase.rpc('submit_inquiry_response', {
                p_inquiry_id: inquiryData.id,
                p_response: responseText,
            });

            if (error) {
                console.error('[admin-inquiries] submitResponse RPC error:', error);
                showToast('답변 전송에 실패했습니다: ' + error.message, 'error');
                return;
            }

            showToast('답변이 성공적으로 전송되었습니다.', 'success');

            // 에디터 초기화
            if (quillEditor) quillEditor.setText('');
            uploadedFiles = [];
            renderFileList();

            // 상태 반영: answered로 업데이트
            inquiryData.status = 'answered';
            inquiryData.answered_at = new Date().toISOString();
            renderInquiryDetail(inquiryData);
            renderUserInfo(inquiryData);

            // 이전 답변 목록 새로 고침
            await loadPreviousResponses(inquiryData.id);

            const templateSel = document.getElementById('templateSelect');
            if (templateSel) templateSel.value = '';
        } catch (err) {
            console.error('[admin-inquiries] submitResponse unexpected error:', err);
            showToast('예기치 않은 오류가 발생했습니다.', 'error');
        } finally {
            if (btn) { btn.disabled = false; btn.querySelector('span').textContent = '답변 전송'; }
        }
    };

})();
