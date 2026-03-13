ALTER TABLE ax_posts ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]'::jsonb;

-- 기존 단일 파일 데이터를 files 배열로 마이그레이션
UPDATE ax_posts
SET files = jsonb_build_array(jsonb_build_object('url', file_url, 'name', file_name))
WHERE file_url IS NOT NULL AND file_name IS NOT NULL;
