# S3S1: 폼 보안 강화

## Task 정보
- **Task ID**: S3S1
- **Task Name**: 폼 보안 강화
- **Stage**: S3 (추가 개발)
- **Area**: S (Security)
- **Dependencies**: S2S1, S2F3, S2F4, S3F1, S3F2
- **Status**: Completed (소급 적용)

## Task 목표
플랫폼 내 모든 폼에 보안 강화 조치를 적용한다.
XSS 방지, 중복 제출 방지, 입력값 검증을 일관되게 적용한다.

### 적용 보안 조치
- **`isValidEmail()`**: 이메일 형식 검증 (모든 이메일 입력 필드)
- **`escapeHtml()`**: 사용자 입력값 HTML 이스케이프 (XSS 방지)
- **`isSubmitting` guard**: 폼 중복 제출 방지 플래그
- **DOMPurify**: 외부 입력 HTML 콘텐츠 정화
- **XSS 방지**: innerHTML 사용 시 반드시 escapeHtml 또는 DOMPurify 적용

### 적용 대상 파일 (6개 폼 페이지)
- `pages/auth/signup.html`
- `pages/auth/login.html`
- `ax-project.html`
- `expert.html`
- `enrollment.html`
- `contact.html`

## 생성/수정 파일
- `js/config.js` (유틸 함수 보완)
- 위 6개 폼 페이지

## 완료 기준
- [x] 6개 폼 페이지 전체에 `isValidEmail()` 적용
- [x] 6개 폼 페이지 전체에 `escapeHtml()` 적용
- [x] 6개 폼 페이지 전체에 `isSubmitting` 가드 적용
- [x] DOMPurify 라이브러리 CDN 추가 및 적용
- [x] innerHTML 사용 부분 XSS 취약점 점검 및 수정
- [x] `js/config.js` 유틸 함수 최신화
