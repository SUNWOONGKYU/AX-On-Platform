-- @task S5S2
-- @description expert_applications, enrollments, contact_inquiries, reports 테이블 RLS 정책 적용
-- @area Security
-- @stage S5
--
-- =============================================================
-- 대상 테이블 (S5D2에서 생성됨):
--   1. expert_applications  — 전문가 신청
--   2. enrollments          — 수강신청
--   3. contact_inquiries    — 문의하기
--   4. reports              — 신고
--
-- admin 판별 전략:
--   - profiles.role ENUM 은 ('ai_expert', 'company', 'general') 만 존재
--     → 'admin' 값이 ENUM에 없으므로 JWT role 기반 admin 헬퍼 함수 사용
--   - Supabase service_role 또는 Supabase Dashboard에서
--     auth.users.raw_app_meta_data->>'role' = 'admin' 으로 관리자 설정 가능
--   - is_admin() 함수: JWT app_metadata.role = 'admin' 또는 service_role 체크
--
-- 멱등성 보장: 모든 정책은 DROP POLICY IF EXISTS 후 CREATE
-- =============================================================


-- ════════════════════════════════════════════
-- 헬퍼 함수: is_admin()
--
--   Supabase에서 관리자 판별 방법:
--     1) service_role 키로 호출 시 → auth.role() = 'service_role'
--     2) 사용자 JWT의 app_metadata.role = 'admin'
--        (Supabase Dashboard > Auth > Users에서 수동 설정 또는
--         Supabase Admin API로 set_user_app_metadata() 호출)
--
--   두 조건 중 하나를 만족하면 admin으로 간주
-- ════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- service_role 키(서버사이드 API 호출)
    auth.role() = 'service_role'
    OR
    -- JWT app_metadata에 role = 'admin' 설정된 사용자
    (auth.jwt() ->> 'role') = 'admin'
    OR
    coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
      false
    )
$$;


-- ════════════════════════════════════════════
-- 1. expert_applications RLS
--
--   INSERT : anon + authenticated (비로그인도 신청 가능)
--   SELECT : admin만
--   UPDATE : admin만 (상태 변경)
-- ════════════════════════════════════════════

ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;

-- INSERT: anon 및 authenticated 허용
DROP POLICY IF EXISTS "expert_applications_insert_anon" ON public.expert_applications;
CREATE POLICY "expert_applications_insert_anon"
  ON public.expert_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT: admin만
DROP POLICY IF EXISTS "expert_applications_select_admin" ON public.expert_applications;
CREATE POLICY "expert_applications_select_admin"
  ON public.expert_applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- UPDATE: admin만 (상태 변경)
DROP POLICY IF EXISTS "expert_applications_update_admin" ON public.expert_applications;
CREATE POLICY "expert_applications_update_admin"
  ON public.expert_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════
-- 2. enrollments RLS
--
--   INSERT : anon + authenticated (비로그인도 수강신청 가능)
--   SELECT : 본인(user_id = auth.uid()) 또는 admin
--   UPDATE : admin만
-- ════════════════════════════════════════════

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- INSERT: anon 및 authenticated 허용
DROP POLICY IF EXISTS "enrollments_insert_anon" ON public.enrollments;
CREATE POLICY "enrollments_insert_anon"
  ON public.enrollments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT: 본인(user_id 일치) 또는 admin
DROP POLICY IF EXISTS "enrollments_select_own_or_admin" ON public.enrollments;
CREATE POLICY "enrollments_select_own_or_admin"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- UPDATE: admin만
DROP POLICY IF EXISTS "enrollments_update_admin" ON public.enrollments;
CREATE POLICY "enrollments_update_admin"
  ON public.enrollments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════
-- 3. contact_inquiries RLS
--
--   INSERT : anon + authenticated (비로그인 문의 가능)
--   SELECT : admin만
--   UPDATE : admin만 (처리 상태 변경)
-- ════════════════════════════════════════════

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- INSERT: anon 및 authenticated 허용
DROP POLICY IF EXISTS "contact_inquiries_insert_anon" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_insert_anon"
  ON public.contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- SELECT: admin만
DROP POLICY IF EXISTS "contact_inquiries_select_admin" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_select_admin"
  ON public.contact_inquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- UPDATE: admin만
DROP POLICY IF EXISTS "contact_inquiries_update_admin" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_update_admin"
  ON public.contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════
-- 4. reports RLS
--
--   INSERT : authenticated만 (로그인 사용자만 신고 가능)
--            reporter_id = auth.uid() 강제
--   SELECT : 본인(reporter_id = auth.uid()) 또는 admin
--   UPDATE : admin만
-- ════════════════════════════════════════════

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- INSERT: authenticated만, 본인 reporter_id 강제
DROP POLICY IF EXISTS "reports_insert_authenticated" ON public.reports;
CREATE POLICY "reports_insert_authenticated"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- SELECT: 본인(reporter_id 일치) 또는 admin
DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
CREATE POLICY "reports_select_own_or_admin"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (
    reporter_id = auth.uid()
    OR public.is_admin()
  );

-- UPDATE: admin만
DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════
-- 완료 알림
-- ════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'S5S2 RLS 정책 적용 완료';
  RAISE NOTICE '  - is_admin() 헬퍼 함수 생성/갱신';
  RAISE NOTICE '  - expert_applications: INSERT(anon+auth), SELECT(admin), UPDATE(admin)';
  RAISE NOTICE '  - enrollments: INSERT(anon+auth), SELECT(본인+admin), UPDATE(admin)';
  RAISE NOTICE '  - contact_inquiries: INSERT(anon+auth), SELECT(admin), UPDATE(admin)';
  RAISE NOTICE '  - reports: INSERT(auth), SELECT(본인+admin), UPDATE(admin)';
  RAISE NOTICE '==============================================';
END $$;
