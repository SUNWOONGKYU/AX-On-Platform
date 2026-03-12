-- ============================================================
-- ax_posts에 file_url, file_name 컬럼 추가 (참고자료 업로드 지원)
-- ============================================================

ALTER TABLE ax_posts ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE ax_posts ADD COLUMN IF NOT EXISTS file_name TEXT;
