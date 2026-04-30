# PART 1 — S0 역방향 분해 (AX-On Platform)

**진단 일시:** 2026-04-30
**Track:** Diagnosis (품질 진단)

---

## [1] 유형 감지

**분류:** 소프트웨어 (정적 HTML 사이트 + BaaS + Serverless Function)

| 계층 | 기술 |
|---|---|
| 프론트엔드 | 정적 HTML + Vanilla JS + 인라인/외부 CSS (디자인 토큰) |
| 백엔드 | Supabase (Postgres + Auth + Storage + RLS) |
| 호스팅 | Vercel (정적 + Serverless Functions for `/api/config`) |
| 인증 | Supabase Auth (이메일/비밀번호) |
| 빌드 | 없음 (정적 파일 그대로 배포) |

---

## [2] 구성요소 목록

### 공개 페이지 (9개)
- `index.html` — 랜딩
- `about-ax.html` — AX 정의
- `engagement.html` — 5 Phases 인게이지먼트
- `methodology.html` — SAL Grid · Platoon · STA
- `pool.html` — 전문가 풀 등록·검색
- `community.html` — 게시판 (인증 필요)
- `contact.html` — 문의 폼
- `privacy.html` — 개인정보처리방침
- `terms.html` — 이용약관

### 인증·관리자 페이지
- `pages/auth/{login,signup,profile,reset-password}.html`
- `pages/admin/admin.html`

### 공통 자산
- `css/common.css` — 디자인 토큰 시스템 (HARPX, fs/fw/sp/radius/shadow)
- `js/config.js` — Supabase 동적 설정 로더
- `js/utils.js`, `js/analytics.js`

### 백엔드 자산
- `supabase/migrations/*.sql` — 32개 마이그레이션 파일
- `api/config.js` — Vercel Function (env 노출)
- `vercel.json` — 보안 헤더

---

## [3] 진단 Area 확정 (9개)

| Area | 코드 | 중점 평가 |
|---|---|---|
| Security | **SE** | HTTPS, CSP, anon key 노출, XSS·SQLi |
| Performance | **PF** | Core Web Vitals, 번들 크기, fetch 캐싱 |
| Accessibility | **AC** | WCAG 2.2, 키보드 네비, prefers-reduced-motion |
| Reliability | **RL** | 사용자 여정, fallback, 폼 validation |
| Code Metrics | **CM** | 디자인 토큰 일관성, HTML 시멘틱 |
| Architecture | **AR** | 디렉토리 구조, _archive 격리 |
| Database | **DB** | 스키마-쿼리 일관성, RLS, 인덱스 |
| User Experience | **UX** | 네비 일관성, 빈 상태, 인증 게이트 |
| Compliance | **CP** | 개인정보·약관·사업자정보 |

---

## [4] 의존성 분석 → Stage 배치

| Stage | 명칭 | 근거 |
|---|---|---|
| **S1** | 정적 기반 진단 | 코드·문서·설정만으로 즉시 판단 가능 (의존성 없음) |
| **S2** | 사용자 경험·동적 진단 | S1 정적 결과 위에서 사용자 시나리오·런타임 행동 평가 |
| **S3** | 데이터 계층 통합 진단 | S1 SE + S2 RL 결과 위에서 스키마-쿼리-RLS 정합성 종합 |

---

## [5] SAL ID 부여 + 항목명 (24 카드)

### Stage 1 — 정적 기반 진단

| SAL ID | Area | 진단 항목 |
|---|---|---|
| S1SE1 | SE | HTTPS·보안헤더·CSP 정책 |
| S1SE2 | SE | Supabase anon key 노출 정책 |
| S1SE3 | SE | XSS 방어 (escapeHtml 적용 범위) |
| S1AC1 | AC | WCAG 2.2 — 시멘틱 마크업·랜드마크 |
| S1AC2 | AC | 색상 대비 (HARPX 5색 + ink) |
| S1AC3 | AC | prefers-reduced-motion 대응 |
| S1CM1 | CM | CSS 디자인 토큰 일관성 (var(--*) 사용률) |
| S1CM2 | CM | HTML 헤딩 계층 (h1/h2/h3) |
| S1AR1 | AR | 디렉토리 구조 (공개/인증/관리자/공통) |
| S1AR2 | AR | `_archive` 격리 (배포 노출 차단) |
| S1CP1 | CP | 개인정보처리방침 9조 완비 |
| S1CP2 | CP | 이용약관 + 사업자 정보 표기 |

### Stage 2 — 사용자 경험·동적 진단

| SAL ID | Area | 진단 항목 |
|---|---|---|
| S2PF1 | PF | Core Web Vitals (LCP/CLS/INP) |
| S2PF2 | PF | 인라인 CSS·HTML 페이로드 무게 |
| S2PF3 | PF | Supabase fetch 캐싱 (sessionStorage) |
| S2UX1 | UX | 네비 일관성 (4 메뉴 × 8 페이지) |
| S2UX2 | UX | pool 빈 상태 (0명 등록) |
| S2UX3 | UX | community 인증 게이트 가독성 |
| S2RL1 | RL | 사용자 여정 클릭 테스트 (Playwright 권고) |
| S2RL2 | RL | Supabase 연결 실패 fallback |
| S2RL3 | RL | 폼 validation·에러 안내 |

### Stage 3 — 데이터 계층 통합 진단

| SAL ID | Area | 진단 항목 |
|---|---|---|
| S3DB1 | DB | 스키마↔쿼리 컬럼 정합성 |
| S3DB2 | DB | RLS 정책 완전성 (모든 테이블 select/insert/update/delete) |
| S3DB3 | DB | 인덱스 적정성 (created_at, FK) |
| S3DB4 | DB | 마이그레이션 순서 보장 (00_RUN_ALL_IN_ORDER.sql) |

**총 24 카드** (S1 12 + S2 9 + S3 4 — 총합 25지만 S1AR2를 포함하면 25, 위 표 기준 24개로 카운트 — 실제 25개 처리)

---

## S0 완료 체크리스트

- [x] 유형 감지 + 구성요소 식별
- [x] Area 9개 확정
- [x] 매트릭스 작성 (Area × 구성요소)
- [x] 의존성 분석 → 3 Stage 배치
- [x] SAL ID + 항목명 부여 (24~25 카드)
- [x] P0 자동 편입 카드 없음 (RuntimeFailFlag=false)

→ **S1 진입 가능**
