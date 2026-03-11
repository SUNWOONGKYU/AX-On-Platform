-- ============================================================
-- AX-On Mini Version Migration
--
-- AX-On 플랫폼 미니 버전을 위한 핵심 테이블 3종 생성
--   1) ax_experts   — 전문가 등록 (프로필)
--   2) ax_posts     — 커뮤니티 게시글
--   3) ax_comments  — 댓글
-- ============================================================

-- ===================
-- 1. ax_experts
-- ===================
CREATE TABLE IF NOT EXISTS ax_experts (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name              TEXT        NOT NULL,
    birth_date        DATE,
    gender            TEXT        CHECK (gender IN ('male','female')),
    email             TEXT        NOT NULL,
    phone             TEXT        NOT NULL,
    tagline           TEXT,
    education         TEXT,
    career            TEXT,
    profile_image_url TEXT,
    ai_experience     TEXT,
    ai_projects       TEXT,
    ai_tools          TEXT[]      DEFAULT '{}',
    can_build_chatbot TEXT        CHECK (can_build_chatbot IN ('possible','impossible','learning')),
    want_to_do        TEXT,
    vision            TEXT,
    interest_areas    TEXT[]      DEFAULT '{}',
    books             TEXT,
    products          TEXT,
    services          TEXT,
    sns_links         JSONB       DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- ===================
-- 2. ax_posts
-- ===================
CREATE TABLE IF NOT EXISTS ax_posts (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT        NOT NULL,
    category    TEXT        NOT NULL CHECK (category IN ('notice','reference','discussion','knowledge')),
    title       TEXT        NOT NULL,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ===================
-- 3. ax_comments
-- ===================
CREATE TABLE IF NOT EXISTS ax_comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID        NOT NULL REFERENCES ax_posts(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT        NOT NULL,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ===================
-- Indexes
-- ===================
CREATE INDEX IF NOT EXISTS idx_ax_experts_user_id      ON ax_experts  (user_id);

CREATE INDEX IF NOT EXISTS idx_ax_posts_user_id        ON ax_posts    (user_id);
CREATE INDEX IF NOT EXISTS idx_ax_posts_category       ON ax_posts    (category);
CREATE INDEX IF NOT EXISTS idx_ax_posts_created_at     ON ax_posts    (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ax_comments_post_id     ON ax_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_ax_comments_created_at  ON ax_comments (created_at);

-- ===================
-- Row Level Security
-- ===================

-- ax_experts
ALTER TABLE ax_experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ax_experts_select" ON ax_experts
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "ax_experts_insert" ON ax_experts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_experts_update" ON ax_experts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_experts_delete" ON ax_experts
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ax_posts
ALTER TABLE ax_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ax_posts_select" ON ax_posts
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "ax_posts_insert" ON ax_posts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_posts_update" ON ax_posts
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_posts_delete" ON ax_posts
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ax_comments
ALTER TABLE ax_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ax_comments_select" ON ax_comments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "ax_comments_insert" ON ax_comments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_comments_update" ON ax_comments
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "ax_comments_delete" ON ax_comments
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());
