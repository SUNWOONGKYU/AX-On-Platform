# S7F3: Kakao 소셜 로그인 연동

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F3 |
| Task 이름 | Kakao 소셜 로그인 연동 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S5S1 |
| 실행 방식 | Human-AI |
| Task Agent | frontend-developer-core |

## 배경 및 목적
기존 Google OAuth 외에 Kakao 소셜 로그인을 추가하여 사용자의 가입/로그인 선택지를 확대합니다. 국내 사용자를 대상으로 접근성을 높입니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/auth/login.html` | Kakao 버튼 추가 |
| `Process/S7_개발_5차/Frontend/pages/auth/kakao-login.html` | Kakao 로그인 페이지 |
| `Process/S7_개발_5차/Security/kakao-callback.js` | Kakao 콜백 처리 |
| `Process/S7_개발_5차/Frontend/js/auth.js` | 인증 로직 통합 |

## 세부 작업 지시
1. Kakao 로그인 버튼 추가
   - 로그인 페이지: Google, Kakao 버튼 나란히 배치
   - 버튼 스타일: Kakao 공식 가이드 준수 (배경색 #FFE812, 텍스트 검정)
   - 반응형: 모바일에서도 클릭 가능한 크기 (최소 44x44px)
   - onclick 핸들러: `handleKakaoLogin()` 함수 연동

2. Supabase Kakao Provider 연동
   - Supabase 대시보드: Authentication > Providers에서 Kakao 활성화
   - Client ID/Secret: 환경 변수에서 로드 (KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET)
   - Redirect URI: `https://your-domain.com/auth/callback`로 설정
   - Supabase에서 제공하는 signInWithOAuth 사용

3. 콜백 처리
   - kakao-callback.js: OAuth 콜백 처리 로직
   - 토큰 검증: Supabase 세션 생성
   - 사용자 정보: Kakao 프로필에서 이름, 이메일 추출
   - 기존 사용자 확인: users 테이블에서 이메일 존재 여부 확인
   - 새 사용자 자동 가입: auth.users에서 자동 생성된 후 public.users에 프로필 저장
   - 리다이렉트: 로그인 성공 후 대시보드로 이동

4. 기존 로그인 페이지에 통합
   - HTML: 로그인 버튼들을 플렉스 레이아웃으로 배열
   - CSS: 버튼 간 스페이싱 (12px), 아이콘 포함
   - JavaScript: 통일된 에러 핸들링 (Google + Kakao)
   - 사용자 이메일: 두 로그인 방식 모두 동일 이메일이면 통합 처리

## 완료 기준
- [ ] Kakao 앱 생성 및 Client ID/Secret 획득
- [ ] Supabase에서 Kakao Provider 활성화
- [ ] 로그인 페이지에 Kakao 버튼 추가
- [ ] kakao-callback.js 콜백 로직 구현
- [ ] 로컬/스테이징 환경에서 Kakao 로그인 테스트
- [ ] 새 사용자 자동 가입 확인
- [ ] 기존 사용자의 Kakao 로그인 연동 확인
- [ ] JSON 상태 업데이트 완료
