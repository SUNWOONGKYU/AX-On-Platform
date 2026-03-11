-- @task S5D2
-- expert_applications 테이블 생성
-- expert.html의 INSERT 컬럼: name, email, phone, category_id, career_summary, portfolio_url, status

CREATE TABLE IF NOT EXISTS expert_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  category_id    TEXT,
  career_summary TEXT,
  portfolio_url  TEXT,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE expert_applications ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (전문가 신청)
DROP POLICY IF EXISTS "expert_applications_insert_all" ON expert_applications;
CREATE POLICY "expert_applications_insert_all" ON expert_applications
  FOR INSERT WITH CHECK (true);

-- 관리자(authenticated)만 SELECT
DROP POLICY IF EXISTS "expert_applications_select_auth" ON expert_applications;
CREATE POLICY "expert_applications_select_auth" ON expert_applications
  FOR SELECT USING (auth.role() = 'authenticated');
