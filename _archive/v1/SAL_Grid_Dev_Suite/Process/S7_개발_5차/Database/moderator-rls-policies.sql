-- @task S7S1
-- Moderator RLS 정책
-- moderator: 게시글/댓글 숨기기(is_hidden 업데이트), 신고 조회 가능
-- 사용자 차단(user_blocks)은 불가 — admin 전용

-- ============================================================
-- 헬퍼 함수: moderator 이상 여부 확인
-- (admin도 moderator 권한 포함)
-- ============================================================
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
  SELECT get_current_user_role() IN ('moderator', 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- posts 테이블 RLS (게시글 숨기기)
-- ============================================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 숨겨지지 않은 게시글은 누구나 SELECT (moderator/admin은 전체 조회)
CREATE POLICY "posts_select"
  ON posts
  FOR SELECT
  TO authenticated
  USING (is_hidden = FALSE OR is_moderator());

-- 본인 게시글 INSERT
CREATE POLICY "posts_insert_own"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- 본인 게시글 UPDATE (moderator/admin은 is_hidden만 업데이트 가능 — 앱 레이어에서 제한)
CREATE POLICY "posts_update"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR is_moderator())
  WITH CHECK (author_id = auth.uid() OR is_moderator());

-- 본인 게시글 DELETE (admin은 전체 삭제 가능)
CREATE POLICY "posts_delete"
  ON posts
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR is_admin());


-- ============================================================
-- comments 테이블 RLS (댓글 숨기기)
-- ============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 숨겨지지 않은 댓글은 누구나 SELECT (moderator/admin은 전체 조회)
CREATE POLICY "comments_select"
  ON comments
  FOR SELECT
  TO authenticated
  USING (is_hidden = FALSE OR is_moderator());

-- 본인 댓글 INSERT
CREATE POLICY "comments_insert_own"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- 본인 댓글 UPDATE (moderator/admin은 is_hidden 업데이트 가능)
CREATE POLICY "comments_update"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR is_moderator())
  WITH CHECK (author_id = auth.uid() OR is_moderator());

-- 본인 댓글 DELETE (admin은 전체 삭제 가능)
CREATE POLICY "comments_delete"
  ON comments
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR is_admin());


-- ============================================================
-- reports 테이블 RLS (신고 조회 — moderator도 가능)
-- admin-rls-policies.sql의 정책과 중복되지 않도록
-- moderator 전용 SELECT 정책 추가
-- ============================================================

-- moderator는 모든 신고 SELECT 가능 (처리는 admin 전용)
CREATE POLICY "reports_select_moderator"
  ON reports
  FOR SELECT
  TO authenticated
  USING (is_moderator());

-- NOTE: reports INSERT/UPDATE/DELETE는 admin-rls-policies.sql 에서 정의
-- moderator는 신고 처리(UPDATE/DELETE) 권한 없음


-- ============================================================
-- user_blocks 테이블 — moderator 접근 불가 (명시적 정책 없음)
-- admin-rls-policies.sql에서 admin 전용으로만 정의됨
-- moderator가 user_blocks에 접근을 시도하면 RLS에 의해 차단됨
-- ============================================================
-- (별도 정책 추가 없음 — admin-rls-policies.sql의 정책이 적용됨)
