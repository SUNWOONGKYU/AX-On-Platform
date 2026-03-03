-- experts 테이블 생성
CREATE TABLE IF NOT EXISTS public.experts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  industry text[] NOT NULL DEFAULT '{}',
  functions text[] NOT NULL DEFAULT '{}',
  bio text,
  photo_url text,
  website_url text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

-- anon 사용자: SELECT만 허용
CREATE POLICY "anon_select_only" ON public.experts
  FOR SELECT
  TO anon
  USING (true);

-- authenticated 사용자: INSERT 허용
CREATE POLICY "auth_insert" ON public.experts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 전문가 시드 데이터는 20260303080003_seed_experts_data.sql 참조
