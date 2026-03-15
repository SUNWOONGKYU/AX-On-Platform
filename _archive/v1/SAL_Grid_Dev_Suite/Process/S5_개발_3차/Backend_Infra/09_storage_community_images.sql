-- @task S5BI1
-- @description 커뮤니티 이미지 Storage 버킷 생성 + RLS
-- @area Backend_Infra
-- @stage S5

-- 1. Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS 정책

-- 공개 읽기 (누구나 이미지 조회 가능)
CREATE POLICY "Public read access for community images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-images');

-- 인증 사용자만 업로드
CREATE POLICY "Authenticated users can upload community images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-images'
    AND auth.role() = 'authenticated'
  );

-- 본인 업로드 파일만 수정
CREATE POLICY "Users can update own community images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 본인 업로드 파일만 삭제
CREATE POLICY "Users can delete own community images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
