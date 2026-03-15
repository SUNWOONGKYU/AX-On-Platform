-- ax_experts 테이블에 첨부파일 JSONB 컬럼 추가
ALTER TABLE ax_experts ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Storage bucket 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-files', 'expert-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 인증된 사용자가 자기 폴더에 업로드 가능
CREATE POLICY "expert_files_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'expert-files' AND (storage.foldername(name))[1] = 'attachments' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Storage RLS: 누구나 읽기 가능 (public bucket)
CREATE POLICY "expert_files_select" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'expert-files');
