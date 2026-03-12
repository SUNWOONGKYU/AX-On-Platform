-- ============================================================
-- ax_knowledge_revisions — 지식Hub 편집 기록 (위키 방식)
-- ============================================================

CREATE TABLE IF NOT EXISTS ax_knowledge_revisions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES ax_posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    editor_name TEXT NOT NULL,
    content     TEXT NOT NULL,
    edit_summary TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ax_knowledge_revisions_post_id ON ax_knowledge_revisions (post_id);
CREATE INDEX IF NOT EXISTS idx_ax_knowledge_revisions_created_at ON ax_knowledge_revisions (created_at DESC);

-- RLS
ALTER TABLE ax_knowledge_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_revisions_select" ON ax_knowledge_revisions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "knowledge_revisions_insert" ON ax_knowledge_revisions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- knowledge 카테고리 게시글은 모든 인증 사용자가 수정 가능 (위키 방식)
CREATE POLICY "ax_posts_update_knowledge" ON ax_posts
    FOR UPDATE TO authenticated
    USING (category = 'knowledge')
    WITH CHECK (category = 'knowledge');
