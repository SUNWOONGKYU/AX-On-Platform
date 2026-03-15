# S3FE1 — contact.html 문의하기 페이지

> **소급 등록**: 2026-03-12 (실행일: 2026-03-11)

## 목표
사용자가 문의를 제출할 수 있는 contact.html 페이지를 생성한다.

## 구현 내용
1. **폼 필드**: inquiry_type(select), name, email, phone, company, message
2. **DB**: `contact_inquiries` 테이블에 INSERT (로그인 불필요)
3. **보안**: DOMPurify sanitize, isSubmitting 중복 방지
4. **UX**: 유효성 검사(이메일, 한국 전화번호), 성공 화면 표시
5. **Nav/Footer**: 기존 페이지와 동일 패턴

## 생성 파일
- `contact.html` (루트)

## 의존성
- S3DB1 (admin_notes 컬럼), S2FE1 (Nav/Footer 패턴)
