-- @task S5D2
-- @description 전문가 신청 테이블 — expert.html 폼에서 INSERT하는 expert_applications 테이블 생성
-- @area Database
-- @stage S5

-- =============================================================
--  expert_applications 테이블
--  expert.html 전문가 등록 신청 폼 필드 매핑:
--    name           ← form[name="name"]        (이름, 필수)
--    email          ← form[name="email"]        (이메일, 필수)
--    phone          ← #reg-phone               (연락처, 필수)
--    category_id    ← form[name="category_id"] (전문분야, expert_categories FK, 필수)
--    career_summary ← form[name="career_summary"] (경력요약, 필수)
--    portfolio_url  ← form[name="portfolio_url"]  (포트폴리오 URL, 선택)
--    status         ← 코드에서 'pending' 고정값으로 삽입
-- =============================================================

CREATE TABLE IF NOT EXISTS public.expert_applications (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name           text        NOT NULL,
  email          text        NOT NULL,
  phone          text        NOT NULL,
  category_id    text        NOT NULL REFERENCES public.expert_categories(id) ON DELETE RESTRICT,
  career_summary text        NOT NULL,
  portfolio_url  text,
  status         text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expert_applications_status
  ON public.expert_applications (status);

CREATE INDEX IF NOT EXISTS idx_expert_applications_email
  ON public.expert_applications (email);

-- updated_at 자동 갱신 트리거 (update_updated_at 함수는 00_RUN_ALL_IN_ORDER.sql에 정의됨)
DROP TRIGGER IF EXISTS trg_expert_applications_updated_at ON public.expert_applications;
CREATE TRIGGER trg_expert_applications_updated_at
  BEFORE UPDATE ON public.expert_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──
ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;

-- 비로그인(anon) 포함 누구나 신청 INSERT 가능
DROP POLICY IF EXISTS "expert_applications_insert_anon" ON public.expert_applications;
CREATE POLICY "expert_applications_insert_anon" ON public.expert_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 본인 이메일과 일치하는 신청 건만 SELECT 가능 (로그인 사용자)
DROP POLICY IF EXISTS "expert_applications_select_own" ON public.expert_applications;
CREATE POLICY "expert_applications_select_own" ON public.expert_applications
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
