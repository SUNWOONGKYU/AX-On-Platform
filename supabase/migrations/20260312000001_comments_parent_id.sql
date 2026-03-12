-- ============================================================
-- ax_comments에 parent_id 추가 (답글/대댓글 지원)
-- ============================================================

ALTER TABLE ax_comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES ax_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_ax_comments_parent_id ON ax_comments (parent_id);
