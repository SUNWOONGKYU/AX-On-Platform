-- @task S5D2
-- @description 신고 테이블 — community.html 신고 기능에서 INSERT하는 reports 테이블 생성
-- @area Database
-- @stage S5

-- =============================================================
--  reports 테이블
--  community.html reportContent() 함수 INSERT 필드 매핑:
--    reporter_id  ← currentUser.id         (신고자 auth.users FK, 필수)
--    target_type  ← type ('post'|'comment') (신고 대상 유형, 필수)
--    target_id    ← targetId               (신고 대상 ID, 필수)
--    reason       ← reason                 (신고 사유, 기본값 '부적절한 콘텐츠')
--
--  target_type='post'    → target_id는 community_posts(id) 참조
--  target_type='comment' → target_id는 community_comments(id) 참조
--  reporter_id → auth.users(id) 참조 (로그인 필수)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type  text        NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id    uuid        NOT NULL,
  reason       text        NOT NULL DEFAULT '부적절한 콘텐츠',
  status       text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
  ON public.reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_reports_target_type_target_id
  ON public.reports (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON public.reports (status);

-- 동일 사용자가 동일 대상을 중복 신고하지 못하도록 유니크 제약
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_reporter_target
  ON public.reports (reporter_id, target_type, target_id);

-- ── RLS ──
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 로그인한 사용자만 신고 INSERT 가능
DROP POLICY IF EXISTS "reports_insert_authenticated" ON public.reports;
CREATE POLICY "reports_insert_authenticated" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- 본인이 신고한 건만 SELECT 가능
DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());
