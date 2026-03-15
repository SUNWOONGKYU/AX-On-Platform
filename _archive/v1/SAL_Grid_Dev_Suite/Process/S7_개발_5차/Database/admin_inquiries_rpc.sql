-- @task S7F7
-- @description 문의 관리자 대시보드 — RPC 함수 및 관련 테이블 정의
-- @area Database
-- @stage S7

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. inquiry_responses 테이블
--    문의 답변 내용을 저장합니다.
--    contact_inquiries 테이블이 먼저 존재해야 합니다.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS public.inquiry_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id      UUID NOT NULL
                        REFERENCES public.contact_inquiries(id)
                        ON DELETE CASCADE,
    response_text   TEXT NOT NULL,
    responded_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    responded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스: inquiry_id 기준 조회 최적화
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_inquiry_id
    ON public.inquiry_responses (inquiry_id);

-- 인덱스: responded_at 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_responded_at
    ON public.inquiry_responses (responded_at DESC);

COMMENT ON TABLE public.inquiry_responses IS '문의 답변 이력 테이블';
COMMENT ON COLUMN public.inquiry_responses.inquiry_id   IS '원본 문의 ID (contact_inquiries.id)';
COMMENT ON COLUMN public.inquiry_responses.response_text IS '답변 내용 (일반 텍스트 또는 HTML)';
COMMENT ON COLUMN public.inquiry_responses.responded_by  IS '답변한 관리자의 auth.uid()';
COMMENT ON COLUMN public.inquiry_responses.responded_at  IS '답변 작성 시각';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. contact_inquiries 테이블 — 필드 보완
--    category, status, answered_at 컬럼이 없다면 추가합니다.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTER TABLE public.contact_inquiries
    ADD COLUMN IF NOT EXISTS category    TEXT DEFAULT 'other',
    ADD COLUMN IF NOT EXISTS status      TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::JSONB;

COMMENT ON COLUMN public.contact_inquiries.category    IS '문의 카테고리: lecture | tech | payment | other';
COMMENT ON COLUMN public.contact_inquiries.status      IS '문의 상태: pending | answered';
COMMENT ON COLUMN public.contact_inquiries.answered_at IS '최초 답변 완료 시각';
COMMENT ON COLUMN public.contact_inquiries.attachments IS '첨부파일 메타데이터 배열 [{name, url, size}]';


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. RPC: submit_inquiry_response
--    관리자가 문의에 답변을 제출합니다.
--
--    동작:
--      1) inquiry_responses 에 답변 INSERT
--      2) contact_inquiries.status = 'answered', answered_at = NOW() UPDATE
--
--    보안: SECURITY DEFINER — RLS 우회, 함수 소유자 권한으로 실행
--    호출 권한: authenticated (관리자만 호출해야 하므로 클라이언트에서 admin 체크 필수)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION public.submit_inquiry_response(
    p_inquiry_id UUID,
    p_response   TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 파라미터 유효성 검사
    IF p_inquiry_id IS NULL THEN
        RAISE EXCEPTION 'p_inquiry_id는 필수 값입니다.' USING ERRCODE = '22000';
    END IF;
    IF p_response IS NULL OR trim(p_response) = '' THEN
        RAISE EXCEPTION '답변 내용(p_response)은 필수 값입니다.' USING ERRCODE = '22000';
    END IF;

    -- 1) 답변 저장
    INSERT INTO public.inquiry_responses (
        inquiry_id,
        response_text,
        responded_by,
        responded_at
    ) VALUES (
        p_inquiry_id,
        p_response,
        auth.uid(),
        NOW()
    );

    -- 2) 문의 상태 업데이트 (answered, answered_at)
    UPDATE public.contact_inquiries
    SET
        status      = 'answered',
        answered_at = COALESCE(answered_at, NOW())  -- 최초 답변 시각만 기록
    WHERE id = p_inquiry_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION '존재하지 않는 문의입니다: %', p_inquiry_id USING ERRCODE = 'P0002';
    END IF;
END;
$$;

COMMENT ON FUNCTION public.submit_inquiry_response(UUID, TEXT) IS
'관리자가 문의에 답변을 제출합니다. inquiry_responses에 INSERT 후 contact_inquiries.status를 answered로 업데이트합니다.';

-- 호출 권한 부여 (인증된 사용자 — 실제 admin 여부는 클라이언트에서 검증)
GRANT EXECUTE ON FUNCTION public.submit_inquiry_response(UUID, TEXT) TO authenticated;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. RLS (Row Level Security) 정책
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 4-1. inquiry_responses RLS 활성화
ALTER TABLE public.inquiry_responses ENABLE ROW LEVEL SECURITY;

-- 4-1-a. 관리자만 모든 답변 SELECT 가능
DROP POLICY IF EXISTS "admin_select_responses" ON public.inquiry_responses;
CREATE POLICY "admin_select_responses"
    ON public.inquiry_responses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- 4-1-b. INSERT는 RPC(SECURITY DEFINER)를 통해서만 허용 (직접 INSERT 차단)
DROP POLICY IF EXISTS "deny_direct_insert_responses" ON public.inquiry_responses;
CREATE POLICY "deny_direct_insert_responses"
    ON public.inquiry_responses
    FOR INSERT
    TO authenticated
    WITH CHECK (FALSE);

-- 4-2. contact_inquiries — 관리자 SELECT 정책 보완
--      (기존 정책이 있다면 중복 생성을 피하기 위해 DROP 후 재생성)
DROP POLICY IF EXISTS "admin_select_inquiries" ON public.contact_inquiries;
CREATE POLICY "admin_select_inquiries"
    ON public.contact_inquiries
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- 4-3. contact_inquiries — 관리자 UPDATE 정책 (status, answered_at 수정 허용)
DROP POLICY IF EXISTS "admin_update_inquiries" ON public.contact_inquiries;
CREATE POLICY "admin_update_inquiries"
    ON public.contact_inquiries
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. (선택) 테스트 데이터 — 개발 환경에서만 실행
--    실제 운영 환경에서는 아래 블록을 실행하지 마세요.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/*
DO $$
BEGIN
    INSERT INTO public.contact_inquiries
        (name, email, subject, message, category, status)
    VALUES
        ('홍길동', 'hong@example.com', '강의 수강 방법 문의',   '강의를 어떻게 수강하나요?',         'lecture',  'pending'),
        ('김철수', 'kim@example.com',  '로그인 오류 문제',       '로그인 시 오류가 발생합니다.',       'tech',     'pending'),
        ('이영희', 'lee@example.com',  '결제 취소 요청',         '결제를 취소하고 싶습니다.',          'payment',  'answered'),
        ('박민준', 'park@example.com', '플랫폼 사용법 질문',     '처음 사용하는데 도움이 필요합니다.', 'other',    'pending')
    ON CONFLICT DO NOTHING;
END;
$$;
*/
