-- ax_posts: 본인 글 수정/삭제 RLS 정책 추가
DROP POLICY IF EXISTS "posts_update_own" ON ax_posts;
CREATE POLICY "posts_update_own" ON ax_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON ax_posts;
CREATE POLICY "posts_delete_own" ON ax_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ax_comments: 본인 댓글 삭제 허용
DROP POLICY IF EXISTS "comments_delete_own" ON ax_comments;
CREATE POLICY "comments_delete_own" ON ax_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ax_votes: 본인 투표 삭제 허용
DROP POLICY IF EXISTS "votes_delete_own" ON ax_votes;
CREATE POLICY "votes_delete_own" ON ax_votes
  FOR DELETE USING (auth.uid() = user_id);
