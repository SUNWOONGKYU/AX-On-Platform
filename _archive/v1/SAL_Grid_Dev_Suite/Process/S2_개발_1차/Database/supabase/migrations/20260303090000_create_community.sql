-- =============================================================
--  MAN IN AI 커뮤니티 스키마
--  AX-On Platform · Supabase / PostgreSQL
-- =============================================================

-- ── 사용자 역할 ENUM ──
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('ai_expert', 'company', 'general');

-- ── 게시판 카테고리 ENUM ──
CREATE TYPE IF NOT EXISTS post_category AS ENUM (
  'free',           -- 자유 토론
  'ax_case',        -- AX 사례 공유
  'ai_tips',        -- AI 활용법
  'expert_column',  -- 전문가 칼럼 (ai_expert 전용)
  'company_qna',    -- 기업 Q&A (company 전용)
  'recruit'         -- 채용 / 협업
);

-- ── 프로필 테이블 (auth.users 기반 확장) ──
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  role         user_role NOT NULL DEFAULT 'general',
  bio          TEXT,
  avatar_url   TEXT,
  karma        INTEGER DEFAULT 0,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 게시글 테이블 ──
CREATE TABLE IF NOT EXISTS community_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(500) NOT NULL,
  content       TEXT NOT NULL,
  category      post_category NOT NULL DEFAULT 'free',
  author_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  upvotes       INTEGER DEFAULT 0,
  downvotes     INTEGER DEFAULT 0,
  views         INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned     BOOLEAN DEFAULT FALSE,
  is_hot        BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 게시글 투표 테이블 (중복 방지) ──
CREATE TABLE IF NOT EXISTS post_votes (
  post_id    UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote       SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- ── 댓글 테이블 (무한 중첩 — parent_id 자기참조) ──
CREATE TABLE IF NOT EXISTS community_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  author_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  upvotes    INTEGER DEFAULT 0,
  downvotes  INTEGER DEFAULT 0,
  depth      INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── 댓글 투표 테이블 ──
CREATE TABLE IF NOT EXISTS comment_votes (
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote       SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- ── 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_community_posts_category    ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_author      ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created     ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post     ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent   ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created  ON community_comments(created_at ASC);

-- ── updated_at 자동 갱신 트리거 ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── comment_count 자동 증감 트리거 ──
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_count
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ── RLS 활성화 ──
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes      ENABLE ROW LEVEL SECURITY;

-- ── profiles RLS ──
-- 누구나 프로필 읽기
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);
-- 본인만 프로필 수정
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);
-- 가입 시 자동 생성 (서비스 롤 또는 트리거로 처리)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ── community_posts RLS ──
-- 누구나 게시글 읽기
CREATE POLICY "posts_select_all" ON community_posts
  FOR SELECT USING (true);
-- 로그인한 사용자만 작성
CREATE POLICY "posts_insert_auth" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- expert_column은 ai_expert만 작성
CREATE POLICY "posts_expert_column" ON community_posts
  FOR INSERT WITH CHECK (
    category != 'expert_column' OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'ai_expert'
  );
-- company_qna는 company 이상만 작성
CREATE POLICY "posts_company_qna" ON community_posts
  FOR INSERT WITH CHECK (
    category != 'company_qna' OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company', 'ai_expert')
  );
-- 본인 게시글만 수정/삭제
CREATE POLICY "posts_update_own" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete_own" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- ── post_votes RLS ──
CREATE POLICY "post_votes_select_all" ON post_votes
  FOR SELECT USING (true);
CREATE POLICY "post_votes_insert_auth" ON post_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_votes_update_own" ON post_votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_votes_delete_own" ON post_votes
  FOR DELETE USING (auth.uid() = user_id);

-- ── community_comments RLS ──
CREATE POLICY "comments_select_all" ON community_comments
  FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON community_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "comments_update_own" ON community_comments
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete_own" ON community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- ── comment_votes RLS ──
CREATE POLICY "comment_votes_select_all" ON comment_votes
  FOR SELECT USING (true);
CREATE POLICY "comment_votes_insert_auth" ON comment_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_votes_update_own" ON comment_votes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comment_votes_delete_own" ON comment_votes
  FOR DELETE USING (auth.uid() = user_id);
