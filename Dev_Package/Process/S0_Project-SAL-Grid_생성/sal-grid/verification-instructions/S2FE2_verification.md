# S2FE2 — Verification Instruction

## 검증 대상
- Task: S2FE2
- 생성 파일: pool.html (목록 부분)

## 검증 항목

### 파일 존재
- [ ] 대상 파일이 존재하고 내용이 비어있지 않음

### 코드 품질
- [ ] 하드코딩된 API 키 없음
- [ ] XSS 방지 (escapeHtml / DOMPurify 사용)
- [ ] 시맨틱 HTML 사용

### 기능 검증
- [ ] 카드/리스트 토글
- [ ] 검색 필터링
- [ ] ax_experts 데이터 로드

### 반응형
- [ ] 모바일 (375px) 레이아웃 정상
- [ ] 터치 타겟 44px 이상
