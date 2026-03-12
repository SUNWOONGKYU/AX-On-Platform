-- ============================================================
-- ax_votes 테이블 — 업보트/다운보트 지원
-- ============================================================

CREATE TABLE IF NOT EXISTS ax_votes (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id   UUID NOT NULL REFERENCES ax_posts(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ax_votes_post_id ON ax_votes (post_id);
CREATE INDEX IF NOT EXISTS idx_ax_votes_user_id ON ax_votes (user_id);

-- RLS
ALTER TABLE ax_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ax_votes_select" ON ax_votes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "ax_votes_insert" ON ax_votes
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_votes_update" ON ax_votes
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_votes_delete" ON ax_votes
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());
