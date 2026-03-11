-- @task S5D2
-- enrollments 테이블 생성
-- enrollment.html의 INSERT 컬럼: program_id, program_name, applicant_name, phone, email, affiliation, motivation

CREATE TABLE IF NOT EXISTS enrollments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id     TEXT NOT NULL,
  program_name   TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT NOT NULL,
  affiliation    TEXT,
  motivation     TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (수강신청)
DROP POLICY IF EXISTS "enrollments_insert_all" ON enrollments;
CREATE POLICY "enrollments_insert_all" ON enrollments
  FOR INSERT WITH CHECK (true);

-- 관리자(authenticated)만 SELECT
DROP POLICY IF EXISTS "enrollments_select_auth" ON enrollments;
CREATE POLICY "enrollments_select_auth" ON enrollments
  FOR SELECT USING (auth.role() = 'authenticated');
