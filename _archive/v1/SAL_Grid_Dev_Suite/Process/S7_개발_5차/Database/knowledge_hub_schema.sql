-- @task S7F9
-- 지식허브 카테고리/태그 시스템 데이터베이스 스키마
-- AX-On Platform — Supabase PostgreSQL
-- 생성일: 2026-03-07

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 0. 기존 테이블 정리 (재실행 안전)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS knowledge_tags CASCADE;
DROP TABLE IF EXISTS knowledge_categories CASCADE;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. knowledge_categories — 2단계 카테고리 (대분류/소분류)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE knowledge_categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  parent_id   UUID        REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  icon        VARCHAR(10)  DEFAULT NULL,           -- 이모지 아이콘 (대분류용)
  description TEXT        DEFAULT NULL,            -- 카테고리 설명
  sort_order  INT         NOT NULL DEFAULT 0,      -- 정렬 순서
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,   -- 노출 여부
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_kcat_parent_id   ON knowledge_categories (parent_id);
CREATE INDEX idx_kcat_slug        ON knowledge_categories (slug);
CREATE INDEX idx_kcat_sort        ON knowledge_categories (sort_order);
CREATE INDEX idx_kcat_is_active   ON knowledge_categories (is_active);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. knowledge_tags — 태그 마스터
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE knowledge_tags (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50)  UNIQUE NOT NULL,
  slug        VARCHAR(50)  UNIQUE NOT NULL,
  usage_count INT         NOT NULL DEFAULT 0,      -- 사용 빈도 (태그 클라우드 크기 기준)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_ktag_slug        ON knowledge_tags (slug);
CREATE INDEX idx_ktag_usage_count ON knowledge_tags (usage_count DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. post_tags — 게시글-태그 연결 (N:M)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE post_tags (
  post_id     UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  tag_id      UUID        NOT NULL REFERENCES knowledge_tags(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- 인덱스
CREATE INDEX idx_post_tags_tag_id  ON post_tags (tag_id);
CREATE INDEX idx_post_tags_post_id ON post_tags (post_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. community_posts 테이블에 카테고리 컬럼 추가
--    (이미 존재하는 경우 안전하게 추가)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS category_id            UUID        REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_category_id     UUID        REFERENCES knowledge_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_slug          VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parent_category_slug   VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS author_initials        VARCHAR(5)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS excerpt                TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS view_count             INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count             INT         NOT NULL DEFAULT 0;

-- 인덱스 (카테고리 필터링용)
CREATE INDEX IF NOT EXISTS idx_posts_category_id         ON community_posts (category_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_category_id  ON community_posts (parent_category_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_slug       ON community_posts (category_slug);
CREATE INDEX IF NOT EXISTS idx_posts_parent_cat_slug     ON community_posts (parent_category_slug);
CREATE INDEX IF NOT EXISTS idx_posts_view_count          ON community_posts (view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_like_count          ON community_posts (like_count DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. updated_at 자동 갱신 트리거
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- knowledge_categories 트리거
DROP TRIGGER IF EXISTS trg_kcat_updated_at ON knowledge_categories;
CREATE TRIGGER trg_kcat_updated_at
  BEFORE UPDATE ON knowledge_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- knowledge_tags 트리거
DROP TRIGGER IF EXISTS trg_ktag_updated_at ON knowledge_tags;
CREATE TRIGGER trg_ktag_updated_at
  BEFORE UPDATE ON knowledge_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. post_tags 변경 시 usage_count 자동 갱신 트리거
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION sync_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE knowledge_tags
       SET usage_count = usage_count + 1,
           updated_at  = NOW()
     WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_tags
       SET usage_count = GREATEST(usage_count - 1, 0),
           updated_at  = NOW()
     WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_tags_usage ON post_tags;
CREATE TRIGGER trg_post_tags_usage
  AFTER INSERT OR DELETE ON post_tags
  FOR EACH ROW EXECUTE FUNCTION sync_tag_usage_count();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. RLS (Row Level Security) 정책
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- knowledge_categories RLS
ALTER TABLE knowledge_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kcat_select_public"  ON knowledge_categories;
DROP POLICY IF EXISTS "kcat_write_admin"    ON knowledge_categories;

CREATE POLICY "kcat_select_public" ON knowledge_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "kcat_write_admin" ON knowledge_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id = auth.uid()
         AND role IN ('admin', 'moderator')
    )
  );

-- knowledge_tags RLS
ALTER TABLE knowledge_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ktag_select_public"     ON knowledge_tags;
DROP POLICY IF EXISTS "ktag_insert_auth"       ON knowledge_tags;
DROP POLICY IF EXISTS "ktag_update_admin"      ON knowledge_tags;

CREATE POLICY "ktag_select_public" ON knowledge_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "ktag_insert_auth" ON knowledge_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ktag_update_admin" ON knowledge_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id = auth.uid()
         AND role IN ('admin', 'moderator')
    )
  );

-- post_tags RLS
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pt_select_public"  ON post_tags;
DROP POLICY IF EXISTS "pt_insert_owner"   ON post_tags;
DROP POLICY IF EXISTS "pt_delete_owner"   ON post_tags;

CREATE POLICY "pt_select_public" ON post_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "pt_insert_owner" ON post_tags
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM community_posts
       WHERE id = post_id
         AND author_id = auth.uid()
    )
  );

CREATE POLICY "pt_delete_owner" ON post_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_posts
       WHERE id = post_id
         AND author_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id = auth.uid()
         AND role IN ('admin', 'moderator')
    )
  );

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 8. 초기 카테고리 데이터 삽입
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 대분류 삽입
INSERT INTO knowledge_categories (name, slug, parent_id, icon, description, sort_order)
VALUES
  ('Programming',     'programming',  NULL, '💻', 'JavaScript, Python, Java, C++ 등 프로그래밍 언어 학습 자료', 1),
  ('Data Science',    'data-science', NULL, '📊', '머신러닝, 딥러닝, 데이터 분석 기술과 실습 가이드',            2),
  ('Web Development', 'web-dev',      NULL, '🌐', '프론트엔드, 백엔드, DevOps 웹 개발 기술 자료',               3),
  ('DevOps',          'devops',       NULL, '🔧', 'Docker, Kubernetes, CI/CD 파이프라인 구성 가이드',           4),
  ('Cloud',           'cloud',        NULL, '☁️', 'AWS, GCP, Azure 클라우드 플랫폼 활용 튜토리얼',              5)
ON CONFLICT (slug) DO NOTHING;

-- 소분류 삽입 (부모 카테고리 slug를 조회해서 삽입)
WITH parents AS (
  SELECT id, slug FROM knowledge_categories WHERE parent_id IS NULL
)
INSERT INTO knowledge_categories (name, slug, parent_id, sort_order)
SELECT sub.name, sub.slug, p.id, sub.ord
FROM (VALUES
  -- Programming 하위
  ('JavaScript',    'javascript',    'programming',  1),
  ('Python',        'python',        'programming',  2),
  ('Java',          'java',          'programming',  3),
  ('C++',           'cpp',           'programming',  4),
  -- Data Science 하위
  ('ML',            'ml',            'data-science', 1),
  ('Deep Learning', 'deep-learning', 'data-science', 2),
  ('Data Analysis', 'data-analysis', 'data-science', 3),
  -- Web Development 하위
  ('Frontend',      'frontend',      'web-dev',      1),
  ('Backend',       'backend',       'web-dev',      2),
  ('DevOps',        'devops-w',      'web-dev',      3),
  -- DevOps 하위
  ('Docker',        'docker',        'devops',        1),
  ('K8s',           'k8s',           'devops',        2),
  ('CI/CD',         'cicd',          'devops',        3),
  -- Cloud 하위
  ('AWS',           'aws',           'cloud',         1),
  ('GCP',           'gcp',           'cloud',         2),
  ('Azure',         'azure',         'cloud',         3)
) AS sub(name, slug, parent_slug, ord)
JOIN parents p ON p.slug = sub.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9. 초기 인기 태그 데이터 삽입
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO knowledge_tags (name, slug, usage_count)
VALUES
  ('JavaScript',            'javascript',            45),
  ('Python',                'python',                38),
  ('Docker',                'docker',                32),
  ('React',                 'react',                 28),
  ('AWS',                   'aws',                   25),
  ('ML',                    'ml',                    22),
  ('DevOps',                'devops',                20),
  ('K8s',                   'k8s',                   18),
  ('DataScience',           'datascience',           17),
  ('Serverless',            'serverless',            15),
  ('CI/CD',                 'cicd',                  14),
  ('DeepLearning',          'deeplearning',          12),
  ('Java',                  'java',                  11),
  ('Cloud',                 'cloud',                 10),
  ('FunctionalProgramming', 'functionalprogramming', 8),
  ('async',                 'async',                 7),
  ('Promise',               'promise',               6),
  ('Pandas',                'pandas',                6),
  ('TensorFlow',            'tensorflow',            5),
  ('GitHub',                'github',                5)
ON CONFLICT (slug) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 10. 유용한 뷰 — 카테고리별 게시글 수
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_category_post_counts AS
SELECT
  kc.id,
  kc.name,
  kc.slug,
  kc.parent_id,
  kc.icon,
  kc.sort_order,
  COUNT(cp.id) AS post_count
FROM knowledge_categories kc
LEFT JOIN community_posts cp
  ON cp.category_slug = kc.slug
  OR cp.parent_category_slug = kc.slug
WHERE kc.is_active = TRUE
GROUP BY kc.id, kc.name, kc.slug, kc.parent_id, kc.icon, kc.sort_order
ORDER BY kc.sort_order;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 11. 유용한 뷰 — 게시글 + 태그 조합 (지식허브 목록용)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE VIEW v_knowledge_posts AS
SELECT
  cp.id,
  cp.title,
  cp.excerpt,
  cp.content,
  cp.category_slug,
  cp.parent_category_slug,
  cp.author_name,
  cp.author_initials,
  cp.created_at,
  cp.updated_at,
  cp.view_count,
  cp.like_count,
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT('id', kt.id, 'name', kt.name, 'slug', kt.slug)
      ORDER BY kt.usage_count DESC
    ) FILTER (WHERE kt.id IS NOT NULL),
    '[]'::JSON
  ) AS tags
FROM community_posts cp
LEFT JOIN post_tags pt ON pt.post_id = cp.id
LEFT JOIN knowledge_tags kt ON kt.id = pt.tag_id
GROUP BY
  cp.id, cp.title, cp.excerpt, cp.content,
  cp.category_slug, cp.parent_category_slug,
  cp.author_name, cp.author_initials,
  cp.created_at, cp.updated_at,
  cp.view_count, cp.like_count;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 12. RPC 함수 — 조회수 증가 (클라이언트에서 직접 UPDATE 불가 시 사용)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION increment_post_view_count(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts
     SET view_count = view_count + 1
   WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 13. RPC 함수 — 태그 OR 필터 게시글 조회
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION get_posts_by_tags(
  p_tag_names TEXT[],
  p_limit     INT  DEFAULT 20,
  p_offset    INT  DEFAULT 0,
  p_sort_by   TEXT DEFAULT 'latest'
)
RETURNS TABLE (
  id                    UUID,
  title                 TEXT,
  excerpt               TEXT,
  category_slug         VARCHAR,
  parent_category_slug  VARCHAR,
  author_name           TEXT,
  author_initials       VARCHAR,
  created_at            TIMESTAMPTZ,
  view_count            INT,
  like_count            INT,
  tags                  JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (cp.id)
    cp.id,
    cp.title::TEXT,
    cp.excerpt::TEXT,
    cp.category_slug,
    cp.parent_category_slug,
    cp.author_name::TEXT,
    cp.author_initials,
    cp.created_at,
    cp.view_count,
    cp.like_count,
    (
      SELECT COALESCE(
        JSON_AGG(JSON_BUILD_OBJECT('name', kt2.name, 'slug', kt2.slug)),
        '[]'::JSON
      )
      FROM post_tags pt2
      JOIN knowledge_tags kt2 ON kt2.id = pt2.tag_id
      WHERE pt2.post_id = cp.id
    ) AS tags
  FROM community_posts cp
  JOIN post_tags pt  ON pt.post_id = cp.id
  JOIN knowledge_tags kt ON kt.id = pt.tag_id
  WHERE kt.name = ANY(p_tag_names)
  ORDER BY cp.id,
    CASE p_sort_by
      WHEN 'views' THEN cp.view_count
      WHEN 'likes' THEN cp.like_count
      ELSE 0
    END DESC,
    cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 스키마 생성 완료 확인
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO $$
BEGIN
  RAISE NOTICE '=== knowledge_hub_schema.sql 실행 완료 ===';
  RAISE NOTICE '테이블 생성: knowledge_categories, knowledge_tags, post_tags';
  RAISE NOTICE '뷰 생성: v_category_post_counts, v_knowledge_posts';
  RAISE NOTICE 'RPC 함수: increment_post_view_count, get_posts_by_tags';
  RAISE NOTICE '초기 데이터: 5개 대분류 + 16개 소분류 카테고리, 20개 태그';
END;
$$;
