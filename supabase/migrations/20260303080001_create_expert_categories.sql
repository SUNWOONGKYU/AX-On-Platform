-- expert_categories 테이블: 산업 분류 및 기능 분야 마스터 데이터
CREATE TABLE IF NOT EXISTS public.expert_categories (
  id text PRIMARY KEY,          -- 'manufacturing', 'FN' 등 코드값
  type text NOT NULL            -- 'industry' 또는 'function'
    CHECK (type IN ('industry', 'function')),
  label text NOT NULL,          -- '제조업', '경영·재무' 등 표시명
  icon text NOT NULL,           -- '🏭', '💰' 등 이모지
  sort_order int NOT NULL DEFAULT 0
);

-- RLS 활성화
ALTER TABLE public.expert_categories ENABLE ROW LEVEL SECURITY;

-- anon 사용자: SELECT만 허용
CREATE POLICY "anon_select_categories" ON public.expert_categories
  FOR SELECT
  TO anon
  USING (true);
