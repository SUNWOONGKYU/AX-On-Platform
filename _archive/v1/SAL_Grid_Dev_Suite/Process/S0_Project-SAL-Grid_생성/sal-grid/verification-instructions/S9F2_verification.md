# S9F2 검증 지시서

## 검증 정보
- **Task ID**: S9F2
- **Task Name**: 쿠키 동의 배너 구현
- **Verification Agent**: code-reviewer-core
- **Task Agent**: frontend-developer-core

## 검증 체크리스트

### 1. 파일 존재 확인
- [ ] `pages/components/cookie-banner.html` 존재
- [ ] `js/cookie-consent.js` 존재
- [ ] 파일명 kebab-case 준수
- [ ] `@task S9F2` 주석 존재

### 2. 기능 검증
- [ ] 쿠키 동의 배너 하단 고정 표시
- [ ] 동의/거부 버튼 정상 동작
- [ ] localStorage에 동의 상태 저장
- [ ] GA4 활성화/비활성화 연동
- [ ] 재방문 시 배너 미표시 (동의 완료 시)

### 3. 보안 검증
- [ ] XSS 방지
- [ ] localStorage 데이터 변조 방지

### 4. 통합 검증
- [ ] S9BI1 (GA4) 연동 정상
- [ ] 전체 페이지에서 배너 일관성
