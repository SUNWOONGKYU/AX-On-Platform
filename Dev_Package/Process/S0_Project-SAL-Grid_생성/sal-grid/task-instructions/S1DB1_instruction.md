# S1DB1 — ax_mini_version DB 마이그레이션

## Task 정보
- **Task ID**: S1DB1 | **Stage**: 1 | **Area**: DB
- **Agent**: database-engineer | **Type**: AI-Only

## 목적
미니버전에 필요한 3개 테이블(ax_experts, ax_posts, ax_comments) 생성

## 세부 작업
1. `supabase/migrations/10_ax_mini_version.sql` 생성
2. ax_experts: 전문가 등록 (22개 컬럼, user_id UNIQUE)
3. ax_posts: 게시글 (category CHECK 4종)
4. ax_comments: 댓글 (post_id CASCADE)
5. 각 테이블 인덱스 추가
6. RLS: 인증 사용자 읽기, 본인 쓰기/수정/삭제

## 완료 기준
- [ ] 3테이블 CREATE 문 정상
- [ ] RLS 정책 6개 이상
- [ ] 인덱스 적용
