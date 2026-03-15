-- ax_project_requests 테이블 생성
CREATE TABLE IF NOT EXISTS public.ax_project_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  industry text NOT NULL,
  company_size text NOT NULL,
  selected_areas jsonb NOT NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.ax_project_requests ENABLE ROW LEVEL SECURITY;

-- anon 사용자 INSERT만 허용
CREATE POLICY "anon_insert_only" ON public.ax_project_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);
