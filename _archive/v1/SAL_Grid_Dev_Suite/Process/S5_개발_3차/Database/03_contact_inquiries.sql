-- @task S5D2
-- @description 문의 테이블 — contact.html 폼에서 INSERT하는 contact_inquiries 테이블 생성
-- @area Database
-- @stage S5

-- =============================================================
--  contact_inquiries 테이블
--  contact.html 문의 폼 필드 매핑:
--    inquiry_type ← #contactType    (문의 유형 select, 필수)
--    name         ← #contactName    (이름, 필수)
--    email        ← #contactEmail   (이메일, 필수)
--    phone        ← #contactPhone   (연락처, 선택)
--    company      ← #contactOrg     (소속 기업/기관명, 선택)
--    message      ← #contactMessage (문의 내용, 필수)
--  문의 유형 옵션:
--    '서비스 문의' | 'AX 프로젝트 상담' | 'AI 전문가 등록' |
--    '교육 프로그램 문의' | '제휴/협업 제안' | '기술 지원' | '기타'
-- =============================================================

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_type text        NOT NULL
                             CHECK (inquiry_type IN (
                               '서비스 문의',
                               'AX 프로젝트 상담',
                               'AI 전문가 등록',
                               '교육 프로그램 문의',
                               '제휴/협업 제안',
                               '기술 지원',
                               '기타'
                             )),
  name         text        NOT NULL,
  email        text        NOT NULL,
  phone        text,
  company      text,
  message      text        NOT NULL,
  status       text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status
  ON public.contact_inquiries (status);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_inquiry_type
  ON public.contact_inquiries (inquiry_type);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at
  ON public.contact_inquiries (created_at DESC);

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS trg_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER trg_contact_inquiries_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 비로그인(anon) 포함 누구나 문의 INSERT 가능
DROP POLICY IF EXISTS "contact_inquiries_insert_anon" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_insert_anon" ON public.contact_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 관리자(admin/super_admin)만 문의 목록 조회 가능
DROP POLICY IF EXISTS "contact_inquiries_select_admin" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_select_admin" ON public.contact_inquiries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('admin', 'super_admin')
    )
  );

-- 관리자(admin/super_admin)만 문의 상태(status) 변경 가능
DROP POLICY IF EXISTS "contact_inquiries_update_admin" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_update_admin" ON public.contact_inquiries
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('admin', 'super_admin')
    )
  );
