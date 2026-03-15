# S9T1: E2E 테스트

## Task 정보
- **Task ID**: S9T1
- **Task Name**: E2E 테스트
- **Stage**: S9 (개발 7차 - Deferred)
- **Area**: T (Testing)
- **Dependencies**: S7F2, S9F1
- **Priority**: Medium
- **원래 ID**: S8T1

## Task 목표

Playwright 기반 E2E 테스트를 작성하여 AX-On Platform의 핵심 사용자 플로우(회원가입, 로그인, 수강신청, 커뮤니티 등)를 자동으로 검증할 수 있도록 한다.

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `tests/e2e/auth.spec.js` | 인증 플로우 테스트 (이메일/소셜 로그인) |
| `tests/e2e/enrollment.spec.js` | 수강신청 플로우 테스트 |
| `tests/e2e/community.spec.js` | 커뮤니티 플로우 테스트 |
| `playwright.config.js` | Playwright 설정 파일 |

## 완료 기준
- [ ] Playwright 설정 및 환경 구성
- [ ] 인증 플로우 E2E 테스트 (이메일 로그인 + Kakao 소셜 로그인)
- [ ] 수강신청 플로우 E2E 테스트
- [ ] 커뮤니티 글 작성/조회 E2E 테스트
- [ ] CI/CD 연동 가능한 테스트 스크립트
