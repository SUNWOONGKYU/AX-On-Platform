# SAL-DA 진단 최종 보고 — AX-On Platform (v2 — 개선·재진단 완료)

**진단 일시:** 2026-04-30
**대상:** AX-On Platform 전체 (https://www.ax-on.net/)
**Track:** Diagnosis (품질 진단)
**기반 스킬:** /주작-sal-da v4.0
**진단자:** Claude (Opus 4)
**버전:** v2 (개선 실행·재진단 완료)

---

## 두 점수 분리 보고

```
진단 결과 (개선 실행·재진단 후):
  · 시스템 등급: 10 / 10  [RuntimeFailFlag = false, 캡 미적용]
  · 리포트 품질: 90 / 100 (자가평가)
  · Fail 카드: 0건 / Deferred-Critical: 0건 / Deferred-High: 0건
  · 진단 완료 선언: 가능 — 단, 리포트 품질 ≥ 97 정식 검증은 review-evaluate 수동 권고
```

**시스템 등급 산출 (재계산):**
- 총 카드: 25
- Status: Normal 21 · Warning 4 · Danger 0
- Final Verdict: Pass 21 · Acceptable 4 · Deferred 0 · Fail 0
- RawGrade = ceil((21 + 4×0.5) / 25 × 10) = ceil(9.2) = **10/10**
- 런타임 캡: 미적용 (RuntimeFailFlag=false)
- Fail 캡: 미적용
- Deferred-Critical/High 캡: 미적용
- **SystemGrade = 10/10**

**전후 비교:**
| 지표 | v1 (진단만) | v2 (개선·재진단) |
|---|---|---|
| 시스템 등급 | 5/10 | **10/10** |
| Pass | 16 | **21** |
| Acceptable | 6 | 4 |
| Deferred | 3 | **0** |
| Fail | 0 | 0 |

---

## 개선 실행 내역 (5건)

### ✅ S1SE1 — 보안 헤더·CSP 전체 적용
**변경:** `vercel.json` — `source: "/(.*)"` 블록 추가
- HSTS (max-age=31536000, includeSubDomains)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- CSP: default-src 'self' + Supabase·jsdelivr 허용 + frame-ancestors 'none' + base-uri 'self' + form-action 'self'

**재진단:** Status Warning → Normal, Verdict Deferred → **Pass**

### ✅ S1AR2 — _archive 배포 노출 차단
**변경:** `.vercelignore` 신규 생성
- 제외 대상: _archive/, _screenshots/, _logo_preview.html, _shot.js, sal_da_audit_v2/, sal_sa_audit_report.html, sal_da_axon.html, lighthouse_reports/, zz_KingFolder/, node_modules/, Dev_Package/, docs/, guides/, pro_debate/, cp/, *.md, desktop.ini

**재진단:** Status Warning → Normal, Verdict Deferred → **Pass**

### ✅ S1AC3 — prefers-reduced-motion 글로벌 fallback
**변경:** `css/common.css` 말미에 글로벌 미디어쿼리 추가
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
**재진단:** Status Warning → Normal, Verdict Acceptable → **Pass**
**효과:** 8 페이지 전체 자동 적용 (common.css 단일 변경)

### ✅ S1AC1 / S1CM2 — community.html 시멘틱 헤딩
**변경:** `community.html:995` — `<div class="page-title">` → `<h1 class="page-title">`
**재진단:** Status Warning → Normal, Verdict Acceptable → **Pass** (2 카드 동시 해소)
**잔여:** 섹션 제목의 h2 보강은 향후 권고

### ⚠️ S2RL1 — Playwright 스모크 스크립트
**변경:** `e2e/` 폴더 신규 생성
- `e2e/smoke.spec.js` — 4 testsuite (9 페이지 · 네비 4메뉴 · dead-link · contact 폼)
- `e2e/playwright.config.js` — Desktop Chrome + Mobile Pixel 5 프로젝트
- `e2e/README.md` — 설치·실행 가이드

**재진단:** Status Warning, Verdict Deferred → **Acceptable** (Priority High → Medium)
**한계:** package.json·node_modules 부재로 Playwright 실제 실행은 별도 PR (npm init + @playwright/test 설치 + CI 통합 필요). 스크립트 작성만으로는 회귀 자동화 미완 — Acceptable 처리.

---

## PART 0 — 런타임 베이스라인 (변동 없음)

| 단계 | 결과 |
|---|---|
| P0-1 빌드 | Pass (정적 호스팅, N/A) |
| P0-2 서빙 | Pass (9 페이지 200 + 콘텐츠 렌더) |
| P0-3 스모크 | Pass (정적 dead-link 0건) |
| P0-4 스키마↔쿼리 | Pass (유령 컬럼 0건) |
| P0-5 환경변수 | Pass |

→ **RuntimeFailFlag = false**

---

## Stage 카드 결과 (재진단 후)

### Stage 1 — 정적 기반 진단 (12 카드)

| SAL ID | 항목 | Status | Verdict | Priority |
|---|---|---|---|---|
| S1SE1 | 보안헤더·CSP | **Normal** | **Pass** | High |
| S1SE2 | anon key 정책 | Normal | Pass | Low |
| S1SE3 | XSS 방어 | Normal | Pass | Low |
| S1AC1 | WCAG 시멘틱 | **Normal** | **Pass** | Medium |
| S1AC2 | 색상 대비 | Normal | Pass | Low |
| S1AC3 | reduced-motion | **Normal** | **Pass** | Medium |
| S1CM1 | 디자인 토큰 | Normal | Pass | Low |
| S1CM2 | 헤딩 계층 | **Normal** | **Pass** | Medium |
| S1AR1 | 디렉토리 구조 | Normal | Pass | Low |
| S1AR2 | _archive 격리 | **Normal** | **Pass** | High |
| S1CP1 | 개인정보처리방침 | Normal | Pass | Low |
| S1CP2 | 이용약관·사업자 | Normal | Pass | Low |

→ Stage 1: Pass 12 / 12 (100%)

### Stage 2 — 사용자 경험·동적 진단 (9 카드)

| SAL ID | 항목 | Status | Verdict | Priority |
|---|---|---|---|---|
| S2PF1 | Core Web Vitals | Warning | Acceptable | Medium |
| S2PF2 | 인라인 CSS 무게 | Warning | Acceptable | Medium |
| S2PF3 | fetch 캐싱 | Normal | Pass | Low |
| S2UX1 | 네비 일관성 | Normal | Pass | Low |
| S2UX2 | pool 빈 상태 | Normal | Pass | Low |
| S2UX3 | community 인증 게이트 | Warning | Acceptable | Medium |
| S2RL1 | 사용자 여정 클릭 테스트 | Warning | **Acceptable** | Medium |
| S2RL2 | Supabase fallback | Normal | Pass | Low |
| S2RL3 | 폼 validation | Normal | Pass | Low |

→ Stage 2: Pass 5 + Acceptable 4

### Stage 3 — 데이터 계층 통합 (4 카드)

| SAL ID | 항목 | Status | Verdict | Priority |
|---|---|---|---|---|
| S3DB1 | 스키마-쿼리 정합성 | Normal | Pass | Low |
| S3DB2 | RLS 완전성 | Normal | Pass | Low |
| S3DB3 | 인덱스 적정성 | Normal | Pass | Low |
| S3DB4 | 마이그레이션 순서 | Normal | Pass | Low |

→ Stage 3: Pass 4 / 4 (100%)

---

## 잔여 Acceptable 4건 (Medium Priority)

다음 PR로 처리 권고:

1. **S2PF1** — Core Web Vitals 개선 (CSS 외부화·hero 이미지 dimension)
2. **S2PF2** — 인라인 CSS 외부화 (페이지별 css/pages/*.css 분리)
3. **S2UX3** — community 인증 게이트에 비로그인 즉시 안내 + 로그인 CTA
4. **S2RL1** — package.json + @playwright/test 설치 + CI 통합으로 e2e 실제 실행

---

## 진단 완료 선언

PART 3 완료 기준 (v4.0):
- [x] RuntimeFailFlag = false
- [x] Fail 카드 0건
- [x] Deferred-Critical 카드 0건
- [x] Deferred-High 카드 0건
- [ ] 리포트 품질 ≥ 97점 → 자가평가 90/100

→ **시스템 측면 진단 완료 선언 가능.** 리포트 품질 정식 ≥97 인증은 `/review-evaluate-코어1` 수동 실행 시 가능.

---

## 변경된 파일 목록 (개선 실행 산출물)

| 파일 | 변경 종류 | 카드 |
|---|---|---|
| `vercel.json` | 수정 — 보안 헤더 블록 추가 | S1SE1 |
| `.vercelignore` | 신규 | S1AR2 |
| `css/common.css` | 추가 — 글로벌 reduced-motion fallback | S1AC3 |
| `community.html` | 수정 — div.page-title → h1.page-title | S1AC1 / S1CM2 |
| `e2e/smoke.spec.js` | 신규 | S2RL1 |
| `e2e/playwright.config.js` | 신규 | S2RL1 |
| `e2e/README.md` | 신규 | S2RL1 |
| `sal_da_audit_v2/grid_records.json` | 갱신 | (재진단) |
| `sal_da_audit_v2/final_report.md` | 본 문서 (v2) | — |
| `sal_da_axon.html` | 갱신 | — |
