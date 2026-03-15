# S8F8: 관리자 통합 통계/리포트 페이지

## Task 정보
- **Task ID**: S8F8
- **Task Name**: 관리자 통합 통계/리포트 페이지
- **Stage**: S8 (개발 6차)
- **Area**: F (Frontend)
- **Priority**: Medium
- **Complexity**: High
- **Execution Type**: AI-Only
- **Task Agent**: frontend-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S7F11, S7BI1

## Task 목표

관리자 전용 심화 통계 페이지를 구현한다. 대시보드 홈(S7F11)의 간략 통계를 넘어, 각 도메인별 상세 리포트와 인터랙티브 차트를 제공한다.

## 상세 구현 요구사항

### 1. 기간 필터 (공통)
- 상단 공통 필터: 최근 7일 / 30일 / 90일 / 전체
- 필터 변경 시 모든 차트/수치 동적 갱신

### 2. 사용자 성장 리포트
- 일별 신규 가입자 수 (Line Chart)
- 주별/월별 집계 전환 가능
- 총 누적 사용자 수 표시

### 3. AX 프로젝트 접수 통계
- 산업별 접수 건수 (Bar Chart)
- 기업규모별 분포 (Pie Chart)
- 월별 접수 추이 (Line Chart)
- 처리 상태별 현황 (처리 완료 / 검토 중 / 대기)

### 4. 수강신청 통계
- 과정별 신청 건수 (Bar Chart)
- 승인율 (승인 / 거절 / 대기)
- 월별 신청 추이

### 5. 커뮤니티 활동 지표
- DAU (Daily Active Users) 추이 (Line Chart)
- 일별 게시글 수 / 댓글 수
- 카테고리별 게시글 분포

### 6. 전문가 풀 통계
- 분야별 전문가 분포 (Pie Chart)
- 신청 승인율 (승인 / 거절 / 대기)
- 월별 신규 신청 수

### 7. 차트 기술
- Chart.js v4 (CDN)
- 모든 차트에 툴팁 활성화
- 범례, 축 레이블 명확히 표시

## 기술 스택
- Vanilla HTML/CSS/JS
- Supabase JS Client (집계 쿼리)
- Chart.js v4 (CDN)
- admin-common.css / admin-common.js

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/admin/analytics.html` | 관리자 통합 통계/리포트 페이지 |

## 완료 기준

- [ ] 기간 필터 변경 시 모든 차트가 동적으로 갱신됨
- [ ] 5개 리포트 섹션이 정상 렌더링됨
- [ ] Chart.js 차트가 모두 정상 작동함
- [ ] Supabase 집계 쿼리가 정상 동작함
- [ ] 비관리자 접근 시 리다이렉트 처리됨
