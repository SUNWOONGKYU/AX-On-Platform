# S1DB1 — Verification Instruction

## 검증 대상
- Task: S1DB1
- 생성 파일: supabase/migrations/10_ax_mini_version.sql

## 검증 항목

### 파일 존재
- [ ] 대상 파일이 존재하고 내용이 비어있지 않음

### 코드 품질
- [ ] 하드코딩된 API 키 없음
- [ ] XSS 방지 (escapeHtml / DOMPurify 사용)
- [ ] 시맨틱 HTML 사용

### 기능 검증
- [ ] 3테이블 생성 구문 정상
- [ ] RLS 정책 적용
- [ ] 인덱스 설정

### 반응형
- [ ] 모바일 (375px) 레이아웃 정상
- [ ] 터치 타겟 44px 이상
