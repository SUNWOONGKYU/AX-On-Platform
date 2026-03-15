# S3FE3 — 로그인/회원가입 레이아웃 수정 + Google OAuth

> **소급 등록**: 2026-03-12 (실행일: 2026-03-12)

## 목표
1. 로그인/회원가입 페이지의 소화면 레이아웃 밀림 버그를 수정한다.
2. 회원가입 페이지에서 불필요한 역할 선택을 제거하고 Google OAuth 버튼을 추가한다.

## 구현 내용
1. **레이아웃 수정**: body에서 align-items:center/justify-content:center 제거, .auth-card에 margin:auto 추가
2. **역할 선택 제거**: fieldset HTML, role CSS(.role-group 등), role JS 유효성 검사 모두 삭제. role 자동 'ai_expert' 설정
3. **Google OAuth 버튼**: login.html과 동일 패턴 (signInWithOAuth, provider: 'google')

## 수정 파일
- `pages/auth/login.html` (레이아웃 수정)
- `pages/auth/signup.html` (레이아웃 수정 + 역할 제거 + Google OAuth)
