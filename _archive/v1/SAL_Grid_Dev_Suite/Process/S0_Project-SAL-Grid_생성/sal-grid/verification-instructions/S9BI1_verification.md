# S9BI1 검증 지시서

## 검증 정보
- **Task ID**: S9BI1
- **Task Name**: Google Analytics 연동
- **Verification Agent**: code-reviewer-core
- **Task Agent**: backend-developer-core

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] `js/analytics/ga-init.js` 존재
- [ ] GA4 스크립트 태그가 전체 페이지에 삽입됨
- [ ] 파일명 kebab-case 준수
- [ ] `@task S9BI1` 주석 존재

### 2. 기능 검증
- [ ] GA4 초기화 정상 동작
- [ ] 페이지뷰 자동 추적
- [ ] 주요 이벤트 트래킹 (회원가입, 로그인, 수강신청)
- [ ] 개발/프로덕션 환경 분리

### 3. 보안 검증
- [ ] GA4 Measurement ID 환경변수 처리
- [ ] 하드코딩된 키 없음

### 4. 통합 검증
- [ ] S5BI1 결과물과 호환
- [ ] 기존 페이지 로딩 성능 저하 없음
