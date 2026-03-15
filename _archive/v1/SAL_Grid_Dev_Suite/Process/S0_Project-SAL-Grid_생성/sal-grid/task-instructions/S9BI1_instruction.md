# S9BI1: Google Analytics 연동

## Task 정보
- **Task ID**: S9BI1
- **Task Name**: Google Analytics 연동
- **Stage**: S9 (개발 7차 - Deferred)
- **Area**: BI (Backend_Infra)
- **Dependencies**: S5BI1
- **Priority**: Low
- **원래 ID**: S7BI1

## Task 목표

Google Analytics 4(GA4)를 AX-On Platform에 연동하여 사용자 행동 데이터를 수집하고 분석할 수 있도록 한다.

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `js/analytics/ga-init.js` | GA4 초기화 및 이벤트 트래킹 모듈 |
| `index.html` 외 전체 페이지 | GA4 스크립트 태그 삽입 |

## 완료 기준
- [ ] GA4 Measurement ID 환경변수 설정
- [ ] GA4 초기화 스크립트 구현
- [ ] 페이지뷰 자동 추적 설정
- [ ] 주요 이벤트 트래킹 (회원가입, 로그인, 수강신청 등)
- [ ] 개발/프로덕션 환경 분리 (개발 시 트래킹 비활성화)
