# S8F7 Verification: 공지사항 관리 (CRUD)

## Verification 정보
- **Task ID**: S8F7
- **Verification Agent**: code-reviewer
- **대상 파일**: pages/admin/announcements.html

## 1. 코드 품질 검증

### HTML 구조
- [ ] HTML5 시맨틱 태그 올바르게 사용됨
- [ ] @task S8F7 주석이 파일 상단에 있음
- [ ] admin-common.css / admin-common.js 올바르게 참조됨

### JavaScript
- [ ] announcements 테이블 CRUD 함수가 각각 분리됨
- [ ] 날짜 입력값 검증 로직이 있음 (시작일 <= 종료일)
- [ ] 비동기 처리(async/await) 올바르게 사용됨
- [ ] 에러 처리가 있음

## 2. 기능 검증

### 공지사항 목록
- [ ] announcements 테이블에서 정상 조회됨
- [ ] 타입별 아이콘/배지가 표시됨
- [ ] 활성/비활성 토글이 동작함

### 작성 폼
- [ ] 제목 입력이 동작함
- [ ] Rich text editor(볼드, 이탤릭, 링크)가 동작함
- [ ] 타입 선택(banner/page/popup)이 동작함
- [ ] 게시 기간 날짜 선택이 동작함
- [ ] 저장 시 announcements 테이블에 INSERT됨

### 수정
- [ ] 기존 데이터가 폼에 올바르게 로드됨
- [ ] 저장 시 announcements 테이블이 UPDATE됨

### 삭제
- [ ] 확인 모달 이후 DELETE/소프트 삭제가 수행됨

## 3. 보안 검증
- [ ] 관리자 인증 체크가 페이지 로드 시 수행됨
- [ ] 비관리자 접근 시 리다이렉트됨
- [ ] Rich text 내용에 XSS 방어 처리됨

## 4. 통합 검증
- [ ] S8D1(announcements 테이블)과 정상 연동됨
- [ ] admin-common.js 함수를 올바르게 재사용함

## 5. 종합 판정

| 항목 | 결과 |
|------|------|
| 코드 품질 | PASS / FAIL |
| 기능 구현 | PASS / FAIL |
| 보안 | PASS / FAIL |
| 통합 | PASS / FAIL |
| **최종** | **PASS / FAIL** |
