# S9F1: Kakao 소셜 로그인 연동

## Task 정보
- **Task ID**: S9F1
- **Task Name**: Kakao 소셜 로그인 연동
- **Stage**: S9 (개발 7차 - Deferred)
- **Area**: F (Frontend)
- **Dependencies**: S5S1
- **원래 ID**: S7F3

## Task 목표

Kakao 소셜 로그인을 구현하여 사용자가 카카오 계정으로 AX-On Platform에 로그인할 수 있도록 한다.

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/auth/kakao-login.html` | Kakao 로그인 버튼 및 OAuth 흐름 |
| `js/auth/kakao-auth.js` | Kakao SDK 연동 로직 |

## 완료 기준
- [ ] Kakao Developer 앱 등록 및 설정 완료
- [ ] Kakao 로그인 버튼 UI 구현
- [ ] OAuth 인증 흐름 구현 (Supabase Auth + Kakao Provider)
- [ ] 로그인 성공 시 프로필 정보 연동
