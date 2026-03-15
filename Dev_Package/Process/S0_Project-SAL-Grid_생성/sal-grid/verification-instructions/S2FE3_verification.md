# S2FE3 — Verification Instruction

## 검증 대상
- Task: S2FE3
- 생성 파일: pool.html (등록 폼 부분)

## 검증 항목

### 파일 존재
- [ ] 대상 파일이 존재하고 내용이 비어있지 않음

### 코드 품질
- [ ] 하드코딩된 API 키 없음
- [ ] XSS 방지 (escapeHtml / DOMPurify 사용)
- [ ] 시맨틱 HTML 사용

### 기능 검증
- [ ] 6단계 네비게이션
- [ ] 필수 필드 검증
- [ ] Pill 선택 토글
- [ ] ax_experts INSERT

### 반응형
- [ ] 모바일 (375px) 레이아웃 정상
- [ ] 터치 타겟 44px 이상
