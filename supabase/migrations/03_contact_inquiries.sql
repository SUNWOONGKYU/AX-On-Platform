-- @task S5D2
-- contact_inquiries 테이블 생성
-- contact.html의 INSERT 컬럼: inquiry_type, name, email, phone, company, message

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type TEXT NOT NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  company      TEXT,
  message      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (문의 접수)
DROP POLICY IF EXISTS "contact_inquiries_insert_all" ON contact_inquiries;
CREATE POLICY "contact_inquiries_insert_all" ON contact_inquiries
  FOR INSERT WITH CHECK (true);

-- 관리자(authenticated)만 SELECT
DROP POLICY IF EXISTS "contact_inquiries_select_auth" ON contact_inquiries;
CREATE POLICY "contact_inquiries_select_auth" ON contact_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');
