# S7F13: 게시글/댓글 콘텐츠 직접 관리 페이지

## Task 정보
- **Task ID**: S7F13
- **Task Name**: 게시글/댓글 콘텐츠 직접 관리 페이지
- **Stage**: S7 (개발 5차)
- **Area**: F (Frontend)
- **Priority**: Medium
- **Complexity**: Medium
- **Execution Type**: AI-Only
- **Task Agent**: frontend-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S7S1, S5D1

## Task 목표

관리자가 커뮤니티 게시글과 댓글을 직접 관리하는 페이지를 구현한다. 신고 처리(S7F8)와 별개로, 전체 게시글/댓글 목록을 조회하고 직접 삭제, 게시글 고정(pin), 핫 표시(hot) 등을 수행한다.

## 상세 구현 요구사항

### 1. 게시글 목록 탭
- 컬럼: 번호, 제목, 작성자, 카테고리, 작성일, 조회수, 좋아요 수, 상태, 액션
- community_posts 테이블 조회 (소프트 삭제 포함 전체 조회)
- 페이지네이션 (20건/페이지)

### 2. 댓글 목록 탭
- 컬럼: 번호, 내용(요약), 작성자, 원글 제목, 작성일, 상태, 액션
- community_comments 테이블 조회

### 3. 검색 및 필터
- 키워드 검색 (제목, 내용, 작성자 이름)
- 카테고리 필터
- 날짜 범위 필터 (시작일 ~ 종료일)
- 상태 필터 (정상 / 삭제됨 / 신고됨)

### 4. 관리 액션 (게시글)
- **삭제**: 소프트 삭제 (is_deleted=true, deleted_at=now())
- **고정**: 게시글 상단 고정 (is_pinned 토글)
- **핫**: 핫 게시글 표시 (is_hot 토글)
- **복구**: 삭제된 게시글 복구 (is_deleted=false)

### 5. 관리 액션 (댓글)
- **삭제**: 소프트 삭제 (is_deleted=true)
- **복구**: 삭제된 댓글 복구

### 6. 게시글/댓글 상세 미리보기
- 클릭 시 슬라이드 패널 또는 모달로 원문 확인 가능

### 7. 접근 제어
- admin-common.js의 인증 체크 함수 재사용

## 기술 스택
- Vanilla HTML/CSS/JS
- Supabase JS Client
- admin-common.css / admin-common.js (S7F11에서 생성)

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `pages/admin/content.html` | 게시글/댓글 콘텐츠 관리 페이지 |

## 완료 기준

- [ ] 게시글/댓글 목록이 탭으로 구분되어 정상 렌더링됨
- [ ] 검색/필터가 정상 동작함
- [ ] 삭제/고정/핫 액션이 Supabase 테이블에 정상 반영됨
- [ ] 비관리자 접근 시 리다이렉트 처리됨
