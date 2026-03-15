-- @task S5D2
-- @description 수강 신청 테이블 — enrollment.html 폼에서 INSERT하는 enrollments 테이블 생성
-- @area Database
-- @stage S5

-- =============================================================
--  enrollments 테이블
--  enrollment.html 수강 신청 폼 필드 매핑:
--    program_id      ← input[name="program"].value   (프로그램 슬러그, 필수)
--    program_name    ← input[name="program"][data-name] (프로그램 표시명, 필수)
--    applicant_name  ← #applicantName                 (이름, 필수)
--    phone           ← #applicantPhone                (연락처, 필수)
--    email           ← #applicantEmail                (이메일, 필수)
--    affiliation     ← #applicantAffiliation          (소속/직장, 선택)
--    motivation      ← #applicantMotivation           (신청 동기, 필수)
--  user_id는 로그인한 경우 서버에서 연결 가능 (현재 폼은 anon INSERT 허용)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id      text        NOT NULL,
  program_name    text        NOT NULL,
  applicant_name  text        NOT NULL,
  phone           text        NOT NULL,
  email           text        NOT NULL,
  affiliation     text,
  motivation      text        NOT NULL,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  status          text        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_program_id
  ON public.enrollments (program_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_email
  ON public.enrollments (email);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
  ON public.enrollments (user_id);

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER trg_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 로그인한 사용자만 INSERT 가능
DROP POLICY IF EXISTS "enrollments_insert_authenticated" ON public.enrollments;
CREATE POLICY "enrollments_insert_authenticated" ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 본인 이메일 일치 또는 user_id 일치 건만 SELECT 가능
DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
