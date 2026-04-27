# KD 자산 → AX-On Platform 통합 계획

> **버전**: v1.0
> **작성일**: 2026-04-27
> **출처 자산**: `G:\내 드라이브\AX실전프로젝트\KD엔지니어링\vercel_kdeng\index.html` (1,695줄, KD엔지니어링 AX 컨설팅 제안서)
> **대상 사이트**: AX-On Platform (https://www.ax-on.net)

---

## 0. 배경

KD엔지니어링 제안서에는 AX-On이 **자체 방법론·플랫폼 IP**로 활용할 수 있는 5개 핵심 자산이 포함되어 있다. 이 자산들은 현재 AX-On 사이트에 **노출되어 있지 않거나 부분적으로만 언급**되어 있어, 플랫폼의 차별화·전문성 메시지가 약하다. 본 계획은 이 자산들을 어디에·어떻게 반영할지 정리한다.

**중요**: 이전 논의의 "AX 의뢰하기" CTA(T1-1, T1-2)는 **현실성 부족**을 이유로 본 계획에서 **삭제됨**. 기업이 거대 AX 프로젝트를 웹폼으로 의뢰할 확률이 매우 낮다는 사용자 판단.

---

## 1. 통합 대상 5개 자산

| # | 자산명 | 한 줄 설명 | 특허 |
|---|--------|------------|------|
| A1 | **DID System** | Data → Information → Decision 3 Layer 흐름. 12 Areas 업무 혁신과 DID가 유기적 순환을 이루어 ROI 증대 | — |
| A2 | **SAL Grid_AX (3D 좌표계)** | Stage × Area × Level — 프로젝트를 3차원 좌표(예: S1TR1, S2EN3)로 체계 관리 | 출원 |
| A3 | **Platoon Formation** | 군 소대 편제(소대장/분대장/병사 3계층)를 AI 에이전트 팀에 응용. 병렬 투입으로 구축 속도 극대화 | 출원 |
| A4 | **SAL Task Analysis (STA)** | 각 Task(Level)를 5 Parts·25 속성(H·A·R·P·X)으로 분석하는 방법론 | — |
| A5 | **AX 분야별 모듈 카탈로그** | 15개 기능분야 155개+ 모듈, 14개 산업특화, 5단계 기업규모별 로드맵 | — (이미 .md 존재) |

---

## 2. 통합 위치 매트릭스

각 자산을 어느 페이지/섹션에 어떻게 노출할지.

| 자산 | 위치 | 형식 | 우선순위 |
|------|------|------|----------|
| A1 DID | `index.html` Hero 하단 신규 섹션 "AX-On 방법론" | 3-Layer 카드 + 한 문단 설명 | **P1** |
| A2 SAL Grid | `index.html` 동일 섹션 + `methodology.html` 신설 시 상세 | 3D 좌표 다이어그램 (간단 SVG) + 예시 좌표 | **P1** |
| A3 Platoon | `methodology.html` 신설 페이지 또는 `community.html` knowledge 카테고리 글 | 3계층 조직도 + "왜 빠른가" 설명 | P2 |
| A4 STA | `community.html` knowledge 카테고리 (정식 글로 등록) | H·A·R·P·X 5 Parts 표 + 활용 예시 | P2 |
| A5 분야별 모듈 | `index.html` 신규 섹션 "기업 AX 모듈 카탈로그" | 분야 아이콘 그리드 + "전체 보기" → `modules.html` 신설 | **P1** |

---

## 3. 페이지별 작업 분해

### 3.1 `index.html` 추가 섹션

현재 구성: Hero → How It Works → Why Join → Stats → Footer

**추가 제안**:

```
Hero
↓
How It Works
↓
[NEW] AX-On 방법론 (DID + SAL Grid)   ← P1
↓
[NEW] 기업 AX 모듈 카탈로그 미리보기   ← P1
↓
Why Join
↓
Stats
↓
Footer
```

**섹션 1: AX-On 방법론** (P1)
- 제목: "AX-On이 사용하는 방법론"
- 카드 2개:
  - **DID System** — 데이터→정보→의사결정 3-Layer 흐름 도식
  - **SAL Grid_AX** — Stage×Area×Level 3D 좌표 다이어그램 (특허 출원 뱃지)
- CTA: [방법론 자세히 보기] → `methodology.html` 또는 community knowledge 글로 이동

**섹션 2: AX 모듈 카탈로그 미리보기** (P1)
- 제목: "기업 규모·분야별 AX 모듈 155개+"
- 표시: 15개 분야 아이콘 그리드(경영·재무·HR·생산·영업···)
- CTA: [전체 카탈로그 보기] → `modules.html` 신설 (기존 `기업 대상 AX 분야별 모듈.md`를 HTML화)

### 3.2 신규 페이지 `methodology.html` (선택, P2)

- DID 시스템 상세
- SAL Grid 3D 좌표계 상세 + 좌표 예시
- Platoon Formation 3계층 구조
- STA H·A·R·P·X 25 속성표
- 푸터에서 링크

### 3.3 신규 페이지 `modules.html` (P1)

- 기존 `기업 대상 AX 분야별 모듈.md` 내용을 HTML 페이지로 변환
- 좌측 목차 / 우측 본문 레이아웃
- nav 메뉴에 추가 검토 (현재 2-메뉴 → 3-메뉴 확장 가능성)

### 3.4 community.html knowledge 카테고리 시드 글 (P2)

- "DID System이란 무엇인가" (관리자 작성)
- "SAL Grid_AX 좌표 읽는 법"
- "STA 25 속성 활용 가이드"
- "Platoon Formation: AI 에이전트는 왜 소대처럼 움직이는가"

→ 빈 카테고리에 4개 시드 글이 들어가면서 콘텐츠 신뢰도 ↑

---

## 4. 우선순위 & 단계별 실행

### Stage 1 (즉시 실행 가능, P1)
1. `index.html` 두 신규 섹션 (방법론 + 모듈 카탈로그 미리보기)
2. `modules.html` 신규 페이지 (`기업 대상 AX 분야별 모듈.md` HTML 변환)

### Stage 2 (콘텐츠 작성 필요, P2)
3. `methodology.html` 신규 페이지
4. community knowledge 카테고리 시드 글 4건

### Stage 3 (운영 안정화 후)
5. nav 메뉴 확장 검토 (2-메뉴 → "방법론" / "모듈" 추가)
6. 특허 출원 상태 표시 정책 정리

---

## 5. 디자인 일관성 체크리스트

- [ ] 폰트: Noto Sans KR + Outfit (영문 헤딩) 유지
- [ ] 컬러: `--amber`(메인) / `--coral` / `--teal` / `--ink` 변수 사용
- [ ] 공통 CSS `/css/common.css` 활용, 페이지 전용 CSS 최소화
- [ ] 모바일 반응형 (5열→3열→2열 / 카드 스택)
- [ ] 푸터: AX-On 법인 설립 추진위원회 (위원장 공인회계사 선웅규)
- [ ] 특허 출원 자산은 "특허 출원" 뱃지 일관 사용

---

## 6. 명시적 제외 사항

- ❌ **"AX 의뢰하기" CTA / 폼 / 페이지** — 기업 거대 프로젝트의 웹폼 의뢰는 비현실적. `ax-project.html` 정식 노출도 본 계획에서 제외.
- ❌ **시니어 AI 창업 교육** ("우리의 창업") — v3.0에서 이미 삭제됨. 부활 계획 없음.
- ❌ **AI 튜터 플로팅 챗봇** — 별도 RAG 인프라 필요. 본 계획 범위 외.

---

## 7. 다음 액션

PO(사용자) 승인 후:
1. Stage 1 두 항목부터 코드 작업 진입
2. `modules.html` 디자인 시안 먼저 합의 → 본 작업
3. Stage 1 완료·배포 후 Stage 2 검토

---

**참고 파일**
- 출처: `G:\내 드라이브\AX실전프로젝트\KD엔지니어링\vercel_kdeng\index.html`
- AX-On 현행 스펙: `AX-On Platform 개요 및 메뉴 구성.md` (v4.0)
- 모듈 카탈로그 원본: `기업 대상 AX 분야별 모듈.md` (v2.0)
