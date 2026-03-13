-- 게시글 작성자가 자기 글의 댓글/투표를 삭제할 수 있도록 RLS 추가
-- (게시글 삭제 시 연관 데이터 정리에 필요)

-- ax_comments: 게시글 작성자도 댓글 삭제 가능
CREATE POLICY "comments_delete_by_post_owner" ON ax_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ax_posts WHERE ax_posts.id = ax_comments.post_id AND ax_posts.user_id = auth.uid()
    )
  );

-- ax_votes: 게시글 작성자도 투표 삭제 가능
CREATE POLICY "votes_delete_by_post_owner" ON ax_votes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ax_posts WHERE ax_posts.id = ax_votes.post_id AND ax_posts.user_id = auth.uid()
    )
  );
