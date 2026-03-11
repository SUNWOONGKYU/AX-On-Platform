-- ============================================================
-- 11_admin_columns.sql
-- 어드민 대시보드를 위한 admin_notes + updated_at 컬럼 추가
-- ============================================================

-- contact_inquiries
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- expert_applications
ALTER TABLE expert_applications ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE expert_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- reports
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- contact_inquiries
DROP TRIGGER IF EXISTS trg_contact_inquiries_updated_at ON contact_inquiries;
CREATE TRIGGER trg_contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- expert_applications
DROP TRIGGER IF EXISTS trg_expert_applications_updated_at ON expert_applications;
CREATE TRIGGER trg_expert_applications_updated_at
  BEFORE UPDATE ON expert_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- enrollments
DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON enrollments;
CREATE TRIGGER trg_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- reports
DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS: 관리자만 UPDATE 가능 (is_admin 함수 사용)
-- ============================================================

-- contact_inquiries
DROP POLICY IF EXISTS "contact_inquiries_update_admin" ON contact_inquiries;
CREATE POLICY "contact_inquiries_update_admin" ON contact_inquiries
  FOR UPDATE USING (is_admin());

-- expert_applications
DROP POLICY IF EXISTS "expert_applications_update_admin" ON expert_applications;
CREATE POLICY "expert_applications_update_admin" ON expert_applications
  FOR UPDATE USING (is_admin());

-- enrollments
DROP POLICY IF EXISTS "enrollments_update_admin" ON enrollments;
CREATE POLICY "enrollments_update_admin" ON enrollments
  FOR UPDATE USING (is_admin());

-- reports
DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE USING (is_admin());

-- ============================================================
-- RLS: 관리자만 SELECT (기존 정책을 is_admin()으로 강화)
-- ============================================================

-- contact_inquiries: 기존 정책 교체
DROP POLICY IF EXISTS "contact_inquiries_select_auth" ON contact_inquiries;
CREATE POLICY "contact_inquiries_select_admin" ON contact_inquiries
  FOR SELECT USING (is_admin());

-- expert_applications: 기존 정책 교체
DROP POLICY IF EXISTS "expert_applications_select_auth" ON expert_applications;
CREATE POLICY "expert_applications_select_admin" ON expert_applications
  FOR SELECT USING (is_admin());

-- enrollments: 기존 정책 교체
DROP POLICY IF EXISTS "enrollments_select_auth" ON enrollments;
CREATE POLICY "enrollments_select_admin" ON enrollments
  FOR SELECT USING (is_admin());

-- reports: 기존 정책 교체
DROP POLICY IF EXISTS "reports_select_auth" ON reports;
CREATE POLICY "reports_select_admin" ON reports
  FOR SELECT USING (is_admin());
