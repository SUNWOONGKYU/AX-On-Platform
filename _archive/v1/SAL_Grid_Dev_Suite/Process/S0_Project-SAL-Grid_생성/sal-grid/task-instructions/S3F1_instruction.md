# S3F1: 수강신청 페이지 구현

## Task 정보
- **Task ID**: S3F1
- **Task Name**: 수강신청 페이지 구현
- **Stage**: S3 (추가 개발)
- **Area**: F (Frontend)
- **Dependencies**: S2F2
- **Status**: Completed (소급 적용)

## Task 목표
우리의 창업 교육 프로그램 수강신청 폼 페이지를 구현한다.
신청자 정보를 입력받아 Supabase `enrollments` 테이블에 저장한다.

### 구현 내용
- **신청자 정보 폼**: 이름, 이메일, 연락처, 나이, 직업/경력
- **프로그램 선택**: 수강하려는 과정 선택
- **동의 체크박스**: 개인정보 수집/이용 동의
- **유효성 검증**: 필수 항목, 이메일/전화번호 형식 검증
- **제출 처리**: `enrollments` 테이블 INSERT 및 성공 메시지

## 생성/수정 파일
- `enrollment.html`

## 완료 기준
- [x] 수강신청 폼 UI 구현
- [x] 필수 입력 항목 유효성 검증
- [x] 이메일 형식 검증 (`isValidEmail()` 사용)
- [x] 전화번호 형식 검증 (`validateKoreanPhone()` 사용)
- [x] Supabase `enrollments` 테이블 저장 연동
- [x] 제출 성공/실패 피드백 메시지 표시
- [x] isSubmitting 가드로 중복 제출 방지
