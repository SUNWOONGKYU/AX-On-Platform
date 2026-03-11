-- @task S5BI1
-- =============================================================
-- S5BI1: community-images Storage Bucket 생성
-- 커뮤니티 이미지 업로드를 위한 Supabase Storage 버킷 설정
-- =============================================================

-- ════════════════════════════════════════════
-- 1. community-images 버킷 생성 (public)
-- ════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  5242880,  -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ════════════════════════════════════════════
-- 2. Storage 정책 설정
-- ════════════════════════════════════════════

-- 읽기(SELECT): 모든 사용자(anon 포함) 허용
DROP POLICY IF EXISTS "Public read community images" ON storage.objects;
CREATE POLICY "Public read community images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-images');

-- 업로드(INSERT): 로그인한 사용자(authenticated)만 허용
DROP POLICY IF EXISTS "Authenticated upload community images" ON storage.objects;
CREATE POLICY "Authenticated upload community images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-images' AND auth.role() = 'authenticated');

-- 업데이트(UPDATE): 본인 파일만 허용
DROP POLICY IF EXISTS "Update own community images" ON storage.objects;
CREATE POLICY "Update own community images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'community-images' AND owner = auth.uid());

-- 삭제(DELETE): 본인 업로드 파일만 삭제 허용
DROP POLICY IF EXISTS "Delete own community images" ON storage.objects;
CREATE POLICY "Delete own community images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-images' AND owner = auth.uid());

-- ════════════════════════════════════════════
-- 완료: community-images 버킷 생성 및 정책 설정
-- ════════════════════════════════════════════
