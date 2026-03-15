# S2F5: 커뮤니티 페이지 구현

## Task 정보
- **Task ID**: S2F5
- **Task Name**: 커뮤니티 페이지 구현
- **Stage**: S2 (핵심 개발)
- **Area**: F (Frontend)
- **Dependencies**: S1D1, S1BI1, S2D1
- **Status**: Completed (소급 적용)

## Task 목표
AX-On Platform 커뮤니티 게시판을 구현한다.
게시글 CRUD, 댓글, 투표, 카테고리 기능을 구현하며
Supabase `community_posts`, `community_comments`, `post_votes`, `comment_votes` 테이블과 연동한다.

### 구현 내용
- **게시글 목록**: 카테고리별 게시글 목록, 페이지네이션
- **게시글 작성**: 제목, 내용, 카테고리 선택 (로그인 필요)
- **게시글 상세**: 본문, 댓글 목록, 투표 버튼
- **댓글**: 작성/삭제 기능
- **투표**: 게시글/댓글 좋아요 기능
- **액센트 색상**: violet(#7c5ce0) 적용

## 생성/수정 파일
- `community.html`

## 완료 기준
- [x] 게시글 목록 조회 및 표시 구현
- [x] 게시글 작성/수정/삭제 CRUD 구현
- [x] 댓글 작성/삭제 구현
- [x] 게시글 및 댓글 투표 기능 구현
- [x] 카테고리 필터 구현
- [x] Supabase RLS 정책에 맞는 권한 처리
- [x] violet 액센트 색상 적용
