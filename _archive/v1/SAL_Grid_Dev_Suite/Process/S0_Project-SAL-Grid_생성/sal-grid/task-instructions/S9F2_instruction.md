# S9F2: 쿠키 동의 배너 구현

## Task 정보
- **Task ID**: S9F2
- **Task Name**: 쿠키 동의 배너 구현
- **Stage**: S9 (개발 7차 - Deferred)
- **Area**: F (Frontend)
- **Dependencies**: S9BI1
- **Priority**: Low
- **원래 ID**: S8F6

## Task 목표

GDPR/개인정보보호법 준수를 위한 쿠키 동의 배너를 구현하여, 사용자가 사이트 방문 시 쿠키 사용에 동의/거부할 수 있도록 한다.

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/components/cookie-banner.html` | 쿠키 동의 배너 UI 컴포넌트 |
| `js/cookie-consent.js` | 쿠키 동의 로직 및 GA 연동 제어 |

## 완료 기준
- [ ] 쿠키 동의 배너 UI 구현 (하단 고정)
- [ ] 동의/거부 버튼 동작
- [ ] 동의 상태 localStorage 저장
- [ ] GA4 트래킹 활성화/비활성화 연동 (S9BI1 의존)
- [ ] 재방문 시 배너 미표시 (이미 동의한 경우)
