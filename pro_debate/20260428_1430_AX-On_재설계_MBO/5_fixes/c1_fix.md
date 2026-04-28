# Cycle 1 → MBO v2 (Fix 5건 반영)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MBO 목표서 v2 — AX-On 전 페이지 디자인 단계적 재설계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 최상위 목표
"전 페이지가 단일 디자인 시스템(토큰·구조·컬러 룰) 위에서 일관된 위계·정렬을 갖도록 하되,
페이지별 시각 정체성은 보조 액센트 룰로 보존하고, 비즈니스 가치(전환률) 측정을 함께 시작한다."

## 가설 (Cycle 1 DA 반론 #1·E2 요구 반영)
"디자인 일관성 → 사용자 신뢰 → 회원가입·프로젝트 접수 전환률 +X%"
이 가설은 Phase A 완료 후 베이스라인 대비 측정으로 검증한다.

## 비즈니스 동기 (신규)
- AX-On은 (a) 기업의 'AX 프로젝트 접수' 폼 제출, (b) AI 전문가의 '회원가입' 두 전환이 핵심
- 8개 페이지가 모두 이 두 전환을 향해 깔때기로 동작해야 함
- 현 상태: 페이지 간 시각 일관성 부족 → 신뢰 저하 가설 → 전환률 손실 추정
- 본 작업은 이 가설을 측정 가능한 형태로 만들고 1차 시각 통일을 시행한다

## 단계 분리 (Cycle 1 DA 반론 #2 반영)

### Phase A — 1차 통일 (5 task, 80% 효과 목표)
1. common.css 토큰 5종 정리 (폰트·spacing·radius·shadow·color)
2. teal 잔존 제거 (methodology.html 단색화)
3. 공통 섹션 클래스 정의 (.sec-header, .eyebrow, .sec-title, .sec-lead)
4. 정렬 규칙 적용 (페이지·섹션 헤더 가운데, 본문 왼쪽)
5. Phase A 완료 시 베이스라인 측정 게이트

### Phase A 측정 게이트 (Cycle 1 E2·DA 요구 반영)
- Vercel Analytics 활성화 + 1주 데이터 수집
- Hero CTA 클릭률 베이스라인
- Hero → /pool 도달률 베이스라인
- Hero → /ax-project 도달률 베이스라인
- Lighthouse 모바일 베이스라인 (현재 측정값 부재 → 측정 후 기록)

### Phase B — 페이지별 재구성 (조건부, Phase A 측정 후 결정)
- Phase A 후 KPI 변화 측정 → ROI 검토 → Phase B 진행 여부 결정
- 진행 결정 시 task: about-ax/methodology/community/pool/contact/terms/privacy 페이지 헤더 패턴 통일

## 단일 디자인 토큰 (Cycle 1 E1·DA 반론 #4 반영)

### 토큰 5종
```css
/* 폰트 */
--fs-hero, --fs-page-title, --fs-section, --fs-card, --fs-lead, --fs-body, --fs-small

/* spacing (8px 기반) */
--sp-1: 4px, --sp-2: 8px, --sp-3: 12px, --sp-4: 16px, --sp-6: 24px,
--sp-8: 32px, --sp-12: 48px, --sp-16: 64px, --sp-24: 96px

/* radius */
--r-sm: 4px, --r-md: 8px, --r-lg: 12px, --r-xl: 20px, --r-full: 9999px

/* shadow elevation */
--sh-1: 작은 elevation, --sh-2: 카드 elevation, --sh-3: 모달 elevation

/* color (semantic) */
--brand: #f59e0b (amber, 1차)
--accent-neutral: slate-500 (Legal/Doc 페이지 보조)
--text-primary, --text-muted, --bg-base, --bg-elevated, --border-subtle
```

### 거버넌스
- 토큰 추가 시 `css/common.css` :root에만 정의, 컴포넌트에서 직접 hex 금지
- grep `font-size:\s*\d+px` outside :root → 0건이 토큰화 완료 기준

## 컬러 룰 (Cycle 1 E3·DA 반론 #3 반영)

### 3색 룰
- **Primary brand**: amber (#f59e0b) — 전 페이지 공통, CTA·강조 텍스트
- **Neutral 액센트**: slate-500 — Legal 페이지(terms, privacy) 헤더 액센트
- **방법론·About**: amber만 사용 (강도 변주 amber-100 ~ amber-700으로 톤 분화)

→ "단일 amber 강제"가 아니라 "amber 베이스 + slate 1개 보조 + amber 톤 변주"의 디자인 시스템

## KPI (Cycle 1 E2·DA 반론 #1 반영 — 비즈니스 KPI 추가)

| 지표 | 목표값 | 측정 방법 | 분류 |
|------|--------|----------|------|
| 페이지 간 색 일관성 | teal 사용 0건 | grep `#0d9488\|teal\|emerald` in *.html | 위생 |
| 토큰 적용률 | hard-coded font-size 0건 | grep `font-size:\s*\d+px` outside :root | 위생 |
| 정렬 일관성 | 모든 섹션 헤더 패턴 준수 | 시각 검수 | 위생 |
| **Hero CTA 클릭률 베이스라인** | **측정값 확보** | **Vercel Analytics 1주** | **비즈니스** |
| **Hero → /pool 도달률** | **측정값 확보** | **Vercel Analytics 1주** | **비즈니스** |
| **Hero → /ax-project 도달률** | **측정값 확보** | **Vercel Analytics 1주** | **비즈니스** |
| Lighthouse 모바일 | ≥80 (베이스라인 측정 후 목표 확정) | Lighthouse CI | 성능 |

## 실행 계획 (Phase A)

| # | Task | 예상 작업량 | 산출물 |
|---|------|----------|--------|
| 1 | common.css 토큰 5종 정의 + 거버넌스 주석 | 2h | 단일 토큰 세트 |
| 2 | 공통 섹션 클래스 정의 (.sec-header 등) | 2h | 재사용 클래스 |
| 3 | methodology.html teal → amber 일괄 치환 | 1h | 단일 컬러 |
| 4 | Vercel Analytics 활성화 + 베이스라인 수집 시작 | 1h | 측정 시작 |
| 5 | grep 검수 + Lighthouse 모바일 측정 | 1h | 베이스라인 확보 |
|   | **합계** | **7h** | |

Phase B는 Phase A 완료 + 1주 측정 데이터 확보 후 별도 MBO로 결정.

## 리스크

| 리스크 | 대응 |
|--------|------|
| 토큰 5종 한 번에 도입 시 회귀 가능 | Phase A는 폰트·spacing·color 3종 우선, radius·shadow는 Phase B로 |
| 1주 측정 데이터로 통계적 유의성 부족 | 베이스라인이 목적이므로 통계 검정 불필요. 추세만 확인 |
| Phase B 안 함 결정 시 작업 누락 | Phase A로 진단된 5건 불일치의 80% 해결되므로 합리적 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
