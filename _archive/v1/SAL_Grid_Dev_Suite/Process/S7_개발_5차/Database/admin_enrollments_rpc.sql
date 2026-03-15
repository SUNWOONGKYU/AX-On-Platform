-- @task S7F6
-- @description 수강신청 승인/거부 RPC 함수 및 관련 테이블 DDL

-- ============================================================
-- 0. 전제 조건: enrollments 테이블이 존재해야 함
--    (이미 존재하는 경우 스킵 가능)
-- ============================================================

-- 수강신청 테이블 (참고용 — 이미 존재하면 실행 불필요)
/*
CREATE TABLE IF NOT EXISTS public.enrollments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id       UUID        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected')),
    reject_reason   TEXT,
    approved_at     TIMESTAMPTZ,
    rejected_at     TIMESTAMPTZ,
    processed_by    UUID        REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
*/

-- ============================================================
-- 1. approve_enrollment(p_enrollment_id)
--    수강신청을 승인 상태로 변경하는 RPC 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_enrollment(
    p_enrollment_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id  UUID;
    v_caller_role TEXT;
    v_current_status TEXT;
BEGIN
    -- 호출자 확인
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: 로그인이 필요합니다.' USING ERRCODE = 'P0001';
    END IF;

    -- 관리자 역할 확인 (profiles 테이블에 role 컬럼이 있다고 가정)
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id;

    IF v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'FORBIDDEN: 관리자 권한이 필요합니다.' USING ERRCODE = 'P0002';
    END IF;

    -- 대상 신청 상태 확인
    SELECT status INTO v_current_status
    FROM public.enrollments
    WHERE id = p_enrollment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NOT_FOUND: 수강신청 ID %를 찾을 수 없습니다.', p_enrollment_id
            USING ERRCODE = 'P0003';
    END IF;

    -- 이미 처리된 경우 방어
    IF v_current_status = 'approved' THEN
        RAISE EXCEPTION 'CONFLICT: 이미 승인된 수강신청입니다.' USING ERRCODE = 'P0004';
    END IF;

    -- 승인 처리
    UPDATE public.enrollments
    SET
        status        = 'approved',
        reject_reason = NULL,             -- 이전 거부 사유 초기화
        approved_at   = now(),
        processed_by  = v_caller_id,
        updated_at    = now()
    WHERE id = p_enrollment_id;

    -- 감사 로그 (enrollment_audit_logs 테이블이 있는 경우 선택적 사용)
    -- INSERT INTO public.enrollment_audit_logs(enrollment_id, action, actor_id, note)
    -- VALUES (p_enrollment_id, 'approved', v_caller_id, '관리자 승인');

END;
$$;

-- 함수 권한 (anon 제외, authenticated만)
REVOKE ALL ON FUNCTION public.approve_enrollment(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_enrollment(UUID) TO authenticated;

-- 함수 주석
COMMENT ON FUNCTION public.approve_enrollment(UUID) IS
    '@task S7F6 — 수강신청 승인 RPC. 관리자(admin 역할)만 호출 가능.';


-- ============================================================
-- 2. reject_enrollment(p_enrollment_id, p_reason)
--    수강신청을 거부 상태로 변경하는 RPC 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.reject_enrollment(
    p_enrollment_id UUID,
    p_reason        TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id   UUID;
    v_caller_role TEXT;
    v_current_status TEXT;
BEGIN
    -- 입력값 검증
    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'BAD_REQUEST: 거부 사유는 필수입니다.' USING ERRCODE = 'P0010';
    END IF;

    -- 사유 길이 제한 (500자)
    IF char_length(trim(p_reason)) > 500 THEN
        RAISE EXCEPTION 'BAD_REQUEST: 거부 사유는 500자 이내여야 합니다.' USING ERRCODE = 'P0011';
    END IF;

    -- 호출자 확인
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHORIZED: 로그인이 필요합니다.' USING ERRCODE = 'P0001';
    END IF;

    -- 관리자 역할 확인
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id;

    IF v_caller_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'FORBIDDEN: 관리자 권한이 필요합니다.' USING ERRCODE = 'P0002';
    END IF;

    -- 대상 신청 상태 확인
    SELECT status INTO v_current_status
    FROM public.enrollments
    WHERE id = p_enrollment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'NOT_FOUND: 수강신청 ID %를 찾을 수 없습니다.', p_enrollment_id
            USING ERRCODE = 'P0003';
    END IF;

    -- 이미 거부된 경우 방어
    IF v_current_status = 'rejected' THEN
        RAISE EXCEPTION 'CONFLICT: 이미 거부된 수강신청입니다.' USING ERRCODE = 'P0004';
    END IF;

    -- 거부 처리
    UPDATE public.enrollments
    SET
        status        = 'rejected',
        reject_reason = trim(p_reason),
        approved_at   = NULL,             -- 승인 시각 초기화
        rejected_at   = now(),
        processed_by  = v_caller_id,
        updated_at    = now()
    WHERE id = p_enrollment_id;

    -- 감사 로그 (선택적)
    -- INSERT INTO public.enrollment_audit_logs(enrollment_id, action, actor_id, note)
    -- VALUES (p_enrollment_id, 'rejected', v_caller_id, trim(p_reason));

END;
$$;

-- 함수 권한
REVOKE ALL ON FUNCTION public.reject_enrollment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_enrollment(UUID, TEXT) TO authenticated;

-- 함수 주석
COMMENT ON FUNCTION public.reject_enrollment(UUID, TEXT) IS
    '@task S7F6 — 수강신청 거부 RPC. 관리자(admin 역할)만 호출 가능. 거부 사유 필수.';


-- ============================================================
-- 3. RLS (Row Level Security) 정책
--    enrollments 테이블 접근 제어
-- ============================================================

-- RLS 활성화
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 관리자: 전체 행 조회 가능
DROP POLICY IF EXISTS "admin_select_all_enrollments" ON public.enrollments;
CREATE POLICY "admin_select_all_enrollments"
    ON public.enrollments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 일반 사용자: 본인 신청만 조회
DROP POLICY IF EXISTS "user_select_own_enrollments" ON public.enrollments;
CREATE POLICY "user_select_own_enrollments"
    ON public.enrollments
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 수강신청 등록: 본인만 가능
DROP POLICY IF EXISTS "user_insert_own_enrollment" ON public.enrollments;
CREATE POLICY "user_insert_own_enrollment"
    ON public.enrollments
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- UPDATE/DELETE는 RPC(SECURITY DEFINER)로만 처리
-- (직접 업데이트 차단 — 관리자도 RPC 사용)
DROP POLICY IF EXISTS "deny_direct_update_enrollments" ON public.enrollments;
-- (정책 없으면 기본 차단됨)


-- ============================================================
-- 4. 인덱스 (성능 최적화)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_status
    ON public.enrollments (status);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
    ON public.enrollments (user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
    ON public.enrollments (course_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_created_at
    ON public.enrollments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_processed_by
    ON public.enrollments (processed_by)
    WHERE processed_by IS NOT NULL;


-- ============================================================
-- 5. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON public.enrollments;
CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 6. 검증용 쿼리 (실행 후 확인)
-- ============================================================
-- 함수 존재 여부 확인
-- SELECT routine_name, routine_type, security_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN ('approve_enrollment', 'reject_enrollment');

-- RLS 정책 확인
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename = 'enrollments';

-- 인덱스 확인
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'enrollments';
