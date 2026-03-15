-- @task S7S1
-- Admin RLS 정책
-- admin은 모든 주요 테이블에 대해 CRUD 가능
-- enrollments status 업데이트, reports 조회/처리, user_blocks CRUD 포함

-- ============================================================
-- 헬퍼 함수: 현재 사용자의 역할 반환
-- ============================================================
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
  SELECT COALESCE(
    (SELECT role FROM user_roles WHERE user_id = auth.uid()),
    'user'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 헬퍼 함수: admin 여부 확인
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_current_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- user_roles 테이블 RLS
-- ============================================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 본인 역할 SELECT 허용 (모든 인증 사용자)
CREATE POLICY "user_roles_select_own"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- admin만 INSERT 가능
CREATE POLICY "user_roles_insert_admin"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- admin만 UPDATE 가능
CREATE POLICY "user_roles_update_admin"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- admin만 DELETE 가능
CREATE POLICY "user_roles_delete_admin"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- enrollments 테이블 RLS
-- ============================================================
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 본인 수강 신청 SELECT (admin은 전체 조회)
CREATE POLICY "enrollments_select"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- 본인 INSERT
CREATE POLICY "enrollments_insert_own"
  ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- admin만 status UPDATE 가능
CREATE POLICY "enrollments_update_admin"
  ON enrollments
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- admin만 DELETE 가능
CREATE POLICY "enrollments_delete_admin"
  ON enrollments
  FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- reports 테이블 RLS
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- admin만 모든 신고 SELECT 가능
CREATE POLICY "reports_select_admin"
  ON reports
  FOR SELECT
  TO authenticated
  USING (is_admin() OR reporter_id = auth.uid());

-- 인증 사용자는 신고 INSERT 가능
CREATE POLICY "reports_insert_authenticated"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- admin만 신고 처리(UPDATE) 가능
CREATE POLICY "reports_update_admin"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- admin만 DELETE 가능
CREATE POLICY "reports_delete_admin"
  ON reports
  FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- user_blocks 테이블 RLS
-- ============================================================
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- admin만 차단 목록 SELECT 가능
CREATE POLICY "user_blocks_select_admin"
  ON user_blocks
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- admin만 차단 INSERT 가능
CREATE POLICY "user_blocks_insert_admin"
  ON user_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- admin만 차단 UPDATE 가능
CREATE POLICY "user_blocks_update_admin"
  ON user_blocks
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- admin만 차단 해제(DELETE) 가능
CREATE POLICY "user_blocks_delete_admin"
  ON user_blocks
  FOR DELETE
  TO authenticated
  USING (is_admin());
