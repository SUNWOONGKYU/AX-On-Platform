-- @task S6F6 — 역할 필터 서버사이드 처리 (DB 파트)
-- Supabase RPC 함수: 역할별 전문가/게시글 필터링

-- 전문가 역할별 조회 RPC 함수
CREATE OR REPLACE FUNCTION get_experts_by_role(p_role TEXT DEFAULT NULL)
RETURNS SETOF experts
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT *
  FROM experts
  WHERE (p_role IS NULL OR p_role = '' OR p_role = 'all' OR specialty = p_role)
  ORDER BY created_at DESC;
$$;

-- 게시글 카테고리별 조회 RPC 함수
CREATE OR REPLACE FUNCTION get_posts_by_role(p_role TEXT DEFAULT NULL, p_limit INT DEFAULT 20, p_offset INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  vote_count INT,
  comment_count INT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    cp.id,
    cp.title,
    cp.content,
    cp.category,
    cp.user_id AS author_id,
    COALESCE(p.full_name, '익명') AS author_name,
    p.avatar_url AS author_avatar,
    COALESCE(cp.vote_count, 0) AS vote_count,
    COALESCE(cp.comment_count, 0) AS comment_count,
    cp.created_at
  FROM community_posts cp
  LEFT JOIN profiles p ON p.id = cp.user_id
  WHERE (p_role IS NULL OR p_role = '' OR p_role = 'all' OR cp.category = p_role)
  ORDER BY cp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- 인덱스 추가 (필터 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_experts_specialty ON experts(specialty);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
