-- @task S6D2
-- 북마크 테이블 생성 — localStorage → Supabase 동기화

-- 1. bookmarks 테이블 생성
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'expert', 'program', 'article')),
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_target ON bookmarks(target_type, target_id);

-- 3. RLS 활성화
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책
DROP POLICY IF EXISTS bookmarks_select_own ON bookmarks;
CREATE POLICY bookmarks_select_own ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS bookmarks_insert_own ON bookmarks;
CREATE POLICY bookmarks_insert_own ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS bookmarks_delete_own ON bookmarks;
CREATE POLICY bookmarks_delete_own ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
