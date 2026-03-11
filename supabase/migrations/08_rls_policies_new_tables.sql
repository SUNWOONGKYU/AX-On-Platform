-- @task S5S2
-- 누락 테이블 4개 RLS 정책 적용
-- S5D2에서 생성된 테이블: expert_applications, enrollments, contact_inquiries, reports
-- 주의: S5D2 마이그레이션(01~04)의 기본 RLS를 대체하는 세밀한 정책 적용

-- ── helper: admin 여부 확인 ──────────────────────────────────────────────
-- profiles 테이블에 role 컬럼이 있다고 가정
-- (없을 경우 auth.jwt() ->> 'role' = 'admin' 방식 사용)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- JWT custom claim 기반 admin 체크 (user_role ENUM에 admin 없으므로)
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 1. expert_applications ──────────────────────────────────────────────
ALTER TABLE expert_applications ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (S5D2에서 생성된 기본 정책)
DROP POLICY IF EXISTS "expert_applications_insert_all" ON expert_applications;
DROP POLICY IF EXISTS "expert_applications_select_auth" ON expert_applications;

-- INSERT: anon + authenticated 모두 허용 (비로그인 신청 가능)
CREATE POLICY "expert_applications_insert_all" ON expert_applications
  FOR INSERT WITH CHECK (true);

-- SELECT: admin만 허용
DROP POLICY IF EXISTS "expert_applications_select_admin" ON expert_applications;
CREATE POLICY "expert_applications_select_admin" ON expert_applications
  FOR SELECT USING (is_admin());

-- UPDATE: admin만 허용 (신청 상태 변경)
DROP POLICY IF EXISTS "expert_applications_update_admin" ON expert_applications;
CREATE POLICY "expert_applications_update_admin" ON expert_applications
  FOR UPDATE USING (is_admin());

-- ── 2. enrollments ──────────────────────────────────────────────────────
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "enrollments_insert_all" ON enrollments;
DROP POLICY IF EXISTS "enrollments_select_auth" ON enrollments;

-- INSERT: anon + authenticated 허용
CREATE POLICY "enrollments_insert_all" ON enrollments
  FOR INSERT WITH CHECK (true);

-- SELECT: admin만 허용 (enrollments에 user_id 없으므로 관리자만 조회)
DROP POLICY IF EXISTS "enrollments_select_admin" ON enrollments;
CREATE POLICY "enrollments_select_admin" ON enrollments
  FOR SELECT USING (is_admin());

-- UPDATE: admin만 허용
DROP POLICY IF EXISTS "enrollments_update_admin" ON enrollments;
CREATE POLICY "enrollments_update_admin" ON enrollments
  FOR UPDATE USING (is_admin());

-- ── 3. contact_inquiries ────────────────────────────────────────────────
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "contact_inquiries_insert_all" ON contact_inquiries;
DROP POLICY IF EXISTS "contact_inquiries_select_auth" ON contact_inquiries;

-- INSERT: anon 허용 (비로그인 문의 가능)
CREATE POLICY "contact_inquiries_insert_all" ON contact_inquiries
  FOR INSERT WITH CHECK (true);

-- SELECT: admin만 허용
DROP POLICY IF EXISTS "contact_inquiries_select_admin" ON contact_inquiries;
CREATE POLICY "contact_inquiries_select_admin" ON contact_inquiries
  FOR SELECT USING (is_admin());

-- UPDATE: admin만 허용 (처리 상태 변경)
DROP POLICY IF EXISTS "contact_inquiries_update_admin" ON contact_inquiries;
CREATE POLICY "contact_inquiries_update_admin" ON contact_inquiries
  FOR UPDATE USING (is_admin());

-- ── 4. reports ──────────────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "reports_insert_auth" ON reports;
DROP POLICY IF EXISTS "reports_select_auth" ON reports;

-- INSERT: authenticated만 허용 (로그인 사용자만 신고 가능)
CREATE POLICY "reports_insert_auth" ON reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: 신고자 본인 또는 admin
DROP POLICY IF EXISTS "reports_select_own_or_admin" ON reports;
CREATE POLICY "reports_select_own_or_admin" ON reports
  FOR SELECT USING (
    reporter_id = auth.uid() OR is_admin()
  );

-- UPDATE: admin만 허용
DROP POLICY IF EXISTS "reports_update_admin" ON reports;
CREATE POLICY "reports_update_admin" ON reports
  FOR UPDATE USING (is_admin());
