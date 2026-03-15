# S7F11: 관리자 대시보드 홈 (통합 통계 위젯)

## Task 정보
- **Task ID**: S7F11
- **Task Name**: 관리자 대시보드 홈 (통합 통계 위젯)
- **Stage**: S7 (개발 5차)
- **Area**: F (Frontend)
- **Priority**: High
- **Complexity**: High
- **Execution Type**: AI-Only
- **Task Agent**: frontend-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S7S1, S6F3, S6F4

## Task 목표

관리자 로그인 후 최초 진입하는 대시보드 홈 페이지를 구현한다. 플랫폼 전체 KPI를 한눈에 파악할 수 있는 통계 위젯을 구성한다.

## 상세 구현 요구사항

### 1. KPI 카드 위젯 (6개)
- 총 사용자 수 (profiles 테이블 COUNT)
- AX 프로젝트 접수 건수 (ax_projects 테이블 COUNT)
- 수강신청 수 (course_enrollments 테이블 COUNT)
- 미처리 문의 수 (contact_inquiries WHERE status='pending' COUNT)
- 미처리 신고 수 (reports WHERE status='pending' COUNT)
- 신규 전문가 신청 수 (expert_applications WHERE status='pending' COUNT)

각 카드: 아이콘, 수치, 라벨, 이전 기간 대비 변동 표시 (증감 화살표)

### 2. 최근 활동 피드 (타임라인)
- 최근 24시간 내 플랫폼 이벤트 목록
- 신규 회원 가입, AX 프로젝트 접수, 수강 신청, 신고 접수 등
- 시간 역순 정렬, 최대 20건 표시

### 3. 미처리 항목 알림 뱃지
- 네비게이션 또는 사이드바에 미처리 항목 수 뱃지 표시
- 실시간 업데이트 (페이지 로드 시 갱신)

### 4. Chart.js 차트 (2개)
- **사용자 성장 그래프**: 최근 30일 일별 신규 가입자 수 (Line Chart)
- **AX 프로젝트 산업별 파이차트**: 산업 분류별 프로젝트 접수 비율 (Pie Chart)

### 5. 관리자 전용 레이아웃
- 사이드바 네비게이션 (관리자 메뉴 전체)
- 헤더 (관리자 이름, 로그아웃 버튼)
- 반응형 레이아웃 (데스크탑 우선)

### 6. 접근 제어
- S7S1의 관리자 Role 기반 접근 제어 활용
- 비관리자 접근 시 메인 페이지로 리다이렉트

## 기술 스택
- Vanilla HTML/CSS/JS
- Supabase JS Client (통계 쿼리)
- Chart.js v4 (CDN)
- CSS Grid / Flexbox 레이아웃

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/admin/index.html` | 관리자 대시보드 홈 메인 파일 |
| `pages/admin/admin-common.css` | 관리자 공통 스타일시트 |
| `pages/admin/admin-common.js` | 관리자 공통 JS (인증 체크, 사이드바 등) |

## 구현 순서

1. admin-common.css — 사이드바, 헤더, 카드, 차트 컨테이너 레이아웃
2. admin-common.js — 관리자 인증 체크 함수, 사이드바 활성화 로직
3. pages/admin/index.html — 대시보드 홈 페이지 (위젯 + 차트 포함)

## 완료 기준

- [ ] 관리자 계정으로 접속 시 대시보드가 정상 표시됨
- [ ] 6개 KPI 카드가 Supabase 실데이터 기반으로 렌더링됨
- [ ] Chart.js 차트 2개가 정상 렌더링됨
- [ ] 비관리자 접근 시 리다이렉트 처리됨
- [ ] 모바일/데스크탑 레이아웃이 깨지지 않음
