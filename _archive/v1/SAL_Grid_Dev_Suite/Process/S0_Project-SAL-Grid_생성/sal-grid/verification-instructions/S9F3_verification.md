# S9F3 검증 지시서

## 검증 정보
- **Task ID**: S9F3
- **Task Name**: 관리자 통합 통계/리포트 페이지
- **Verification Agent**: code-reviewer-core
- **Task Agent**: frontend-developer-core

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] `pages/admin/statistics.html` 존재
- [ ] `js/admin/statistics.js` 존재
- [ ] 파일명 kebab-case 준수
- [ ] `@task S9F3` 주석 존재

### 2. 기능 검증
- [ ] 통합 통계 대시보드 레이아웃 정상
- [ ] KPI 카드 데이터 표시
- [ ] GA4 데이터 연동
- [ ] 관리자 권한 체크 동작
- [ ] 기간별 필터링 (일/주/월)

### 3. 보안 검증
- [ ] 관리자 권한 없는 사용자 접근 차단
- [ ] API 키/토큰 노출 없음

### 4. 통합 검증
- [ ] S7F11 (관리자 대시보드) 결과물과 호환
- [ ] S9BI1 (GA4) 연동 정상
