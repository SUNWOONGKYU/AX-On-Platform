# S8F7: 공지사항 관리 (CRUD)

## Task 정보
- **Task ID**: S8F7
- **Task Name**: 공지사항 관리 (CRUD)
- **Stage**: S8 (개발 6차)
- **Area**: F (Frontend)
- **Priority**: Medium
- **Complexity**: Medium
- **Execution Type**: AI-Only
- **Task Agent**: frontend-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S8D1

## Task 목표

관리자가 공지사항을 작성·수정·삭제하고, 게시 기간(시작일~종료일)을 설정하며, 커뮤니티 상단 배너 또는 전체 페이지 공지로 표시할 수 있는 관리 페이지를 구현한다.

## 상세 구현 요구사항

### 1. 공지사항 목록
- 컬럼: 번호, 제목, 타입, 게시 기간, 활성 여부, 작성자, 작성일, 액션
- announcements 테이블 조회 (전체 목록, 만료 포함)
- 활성/비활성 토글 스위치

### 2. 공지사항 작성 폼
- 제목 (text input)
- 내용 (Rich text editor — 볼드, 이탤릭, 링크 삽입 지원)
- 타입 선택 (banner / page / popup)
- 게시 시작일 / 종료일 (date picker)
- 활성 여부 체크박스

### 3. 공지사항 수정
- 목록에서 수정 버튼 클릭 → 작성 폼에 기존 데이터 로드
- announcements 테이블 UPDATE

### 4. 공지사항 삭제
- 삭제 버튼 클릭 → 확인 모달 → 하드 DELETE (또는 소프트 삭제)

### 5. 공지사항 미리보기
- 배너/팝업 타입의 경우 실제 표시 모양 미리보기

### 6. Rich Text Editor
- 간단한 툴바: 볼드(B), 이탤릭(I), 링크 삽입
- contenteditable div 기반 또는 경량 라이브러리 사용 (외부 CDN 의존 최소화)

### 7. 접근 제어
- admin-common.js의 인증 체크 함수 재사용

## 기술 스택
- Vanilla HTML/CSS/JS
- Supabase JS Client
- admin-common.css / admin-common.js

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/admin/announcements.html` | 공지사항 관리 페이지 |

## 완료 기준

- [ ] 공지사항 목록이 announcements 테이블 기반으로 정상 렌더링됨
- [ ] 작성/수정/삭제가 정상 동작함
- [ ] 게시 기간 설정이 저장됨
- [ ] 활성/비활성 토글이 정상 동작함
- [ ] 비관리자 접근 시 리다이렉트 처리됨
