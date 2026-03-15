# S3F2: 문의하기 페이지 구현

## Task 정보
- **Task ID**: S3F2
- **Task Name**: 문의하기 페이지 구현
- **Stage**: S3 (추가 개발)
- **Area**: F (Frontend)
- **Dependencies**: S1D1, S1BI1
- **Status**: Completed (소급 적용)

## Task 목표
사용자가 플랫폼 관련 문의를 남길 수 있는 문의하기 페이지를 구현한다.
문의 내용은 Supabase `contact_inquiries` 테이블에 저장한다.

### 구현 내용
- **문의 폼**: 이름, 이메일, 연락처, 문의 유형, 문의 내용
- **문의 유형 선택**: 서비스 문의, 파트너십, 기술 지원, 기타
- **유효성 검증**: 필수 항목, 이메일/전화번호 형식 검증
- **XSS 방지**: `escapeHtml()` 적용
- **isSubmitting 가드**: 중복 제출 방지 (크리티컬 버그 수정 포함)

## 생성/수정 파일
- `contact.html`

## 완료 기준
- [x] 문의 폼 UI 구현
- [x] 유효성 검증 적용
- [x] Supabase `contact_inquiries` 테이블 저장 연동
- [x] isSubmitting 가드 적용 (중복 제출 방지)
- [x] `escapeHtml()` XSS 방지 적용
- [x] 제출 성공/실패 피드백 메시지 표시
