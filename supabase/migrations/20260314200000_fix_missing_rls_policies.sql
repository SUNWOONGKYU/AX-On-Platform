-- =============================================
-- ax_projects: UPDATE/DELETE 정책 추가
-- (자기가 만든 프로젝트만 수정/삭제 가능)
-- =============================================
CREATE POLICY "ax_projects_update_own" ON ax_projects
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "ax_projects_delete_own" ON ax_projects
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- =============================================
-- ax_comments: UPDATE 정책 추가
-- (자기가 쓴 댓글만 수정 가능)
-- =============================================
CREATE POLICY "ax_comments_update_own" ON ax_comments
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
