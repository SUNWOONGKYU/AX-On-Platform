-- @task S7F8
-- @description 신고/차단 관리 RPC 함수 및 관련 스키마
-- 실행 환경: Supabase SQL Editor (PostgreSQL 15+)

-- =============================================================
-- 0. 사전 테이블 확인 (필요 시 생성)
-- =============================================================

-- reports 테이블 (신고 내역)
CREATE TABLE IF NOT EXISTS reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_user_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_type     TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user')),
    target_id       UUID,
    reason          TEXT NOT NULL CHECK (reason IN ('spam', 'abuse', 'false_info', 'other')),
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    resolved_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at     TIMESTAMPTZ,
    resolved_note   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_bans 테이블 (차단 내역)
CREATE TABLE IF NOT EXISTS user_bans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason          TEXT,
    ban_duration    INT,                          -- 일(day) 단위, NULL = 영구
    is_permanent    BOOLEAN NOT NULL DEFAULT false,
    banned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    unban_at        TIMESTAMPTZ,                  -- NULL = 영구
    is_active       BOOLEAN NOT NULL DEFAULT true,
    banned_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
    unbanned_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
    report_id       UUID REFERENCES reports(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- warning_logs 테이블 (경고 내역)
CREATE TABLE IF NOT EXISTS warning_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    report_id       UUID REFERENCES reports(id) ON DELETE SET NULL,
    warned_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 1. 인덱스
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target_user ON reports(target_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON user_bans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_bans_unban_at ON user_bans(unban_at);

CREATE INDEX IF NOT EXISTS idx_warning_logs_user_id ON warning_logs(user_id);

-- =============================================================
-- 2. process_report(p_report_id, p_action, p_ban_duration)
--    신고를 처리합니다.
--    p_action: 'warn' | 'ban' | 'dismiss'
--    p_ban_duration: 차단 일수 (NULL = 영구, 0도 영구로 처리)
-- =============================================================
CREATE OR REPLACE FUNCTION process_report(
    p_report_id   UUID,
    p_action      TEXT,
    p_ban_duration INT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report         reports%ROWTYPE;
    v_admin_id       UUID;
    v_warning_count  INT;
    v_unban_at       TIMESTAMPTZ;
    v_is_permanent   BOOLEAN;
BEGIN
    -- 관리자 권한 확인
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = v_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Admin privileges required';
    END IF;

    -- 신고 조회
    SELECT * INTO v_report FROM reports WHERE id = p_report_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report not found: %', p_report_id;
    END IF;

    IF v_report.status <> 'pending' THEN
        RAISE EXCEPTION 'Report already processed: status = %', v_report.status;
    END IF;

    -- 액션 처리
    CASE p_action

        WHEN 'warn' THEN
            -- 경고 로그 INSERT
            INSERT INTO warning_logs (user_id, report_id, warned_by, reason)
            VALUES (v_report.target_user_id, p_report_id, v_admin_id, '신고에 의한 경고');

            -- 누적 경고 수 집계
            SELECT COUNT(*) INTO v_warning_count
            FROM warning_logs
            WHERE user_id = v_report.target_user_id;

            -- 경고 3회 누적 시 자동 7일 차단
            IF v_warning_count >= 3 THEN
                -- 기존 활성 차단 해제
                UPDATE user_bans
                SET is_active = false
                WHERE user_id = v_report.target_user_id AND is_active = true;

                v_unban_at := now() + INTERVAL '7 days';

                INSERT INTO user_bans (user_id, reason, ban_duration, is_permanent, banned_at, unban_at, is_active, banned_by, report_id)
                VALUES (
                    v_report.target_user_id,
                    '경고 3회 누적에 의한 자동 차단',
                    7,
                    false,
                    now(),
                    v_unban_at,
                    true,
                    v_admin_id,
                    p_report_id
                );

                -- profiles.is_banned 상태 업데이트 (컬럼 존재 시)
                UPDATE profiles
                SET is_banned = true, ban_until = v_unban_at
                WHERE id = v_report.target_user_id;
            END IF;

            -- 신고 처리완료 업데이트
            UPDATE reports
            SET status = 'processed',
                resolved_by = v_admin_id,
                resolved_at = now(),
                resolved_note = CASE WHEN v_warning_count >= 3 THEN '경고 3회 누적 → 자동 7일 차단' ELSE '경고 발송' END,
                updated_at = now()
            WHERE id = p_report_id;

        WHEN 'ban' THEN
            -- 기존 활성 차단 비활성화
            UPDATE user_bans
            SET is_active = false
            WHERE user_id = v_report.target_user_id AND is_active = true;

            -- 영구 차단 여부 결정 (duration NULL 또는 0 → 영구)
            IF p_ban_duration IS NULL OR p_ban_duration = 0 THEN
                v_is_permanent := true;
                v_unban_at := NULL;
            ELSE
                v_is_permanent := false;
                v_unban_at := now() + (p_ban_duration || ' days')::INTERVAL;
            END IF;

            -- 차단 INSERT
            INSERT INTO user_bans (user_id, reason, ban_duration, is_permanent, banned_at, unban_at, is_active, banned_by, report_id)
            VALUES (
                v_report.target_user_id,
                '신고에 의한 차단',
                CASE WHEN v_is_permanent THEN NULL ELSE p_ban_duration END,
                v_is_permanent,
                now(),
                v_unban_at,
                true,
                v_admin_id,
                p_report_id
            );

            -- profiles 차단 상태 업데이트 (컬럼 존재 시)
            UPDATE profiles
            SET is_banned = true, ban_until = v_unban_at
            WHERE id = v_report.target_user_id;

            -- 신고 처리완료
            UPDATE reports
            SET status = 'processed',
                resolved_by = v_admin_id,
                resolved_at = now(),
                resolved_note = CASE WHEN v_is_permanent THEN '영구 차단' ELSE (p_ban_duration || '일 차단') END,
                updated_at = now()
            WHERE id = p_report_id;

        WHEN 'dismiss' THEN
            -- 기각
            UPDATE reports
            SET status = 'rejected',
                resolved_by = v_admin_id,
                resolved_at = now(),
                updated_at = now()
            WHERE id = p_report_id;

        ELSE
            RAISE EXCEPTION 'Invalid action: %. Must be warn | ban | dismiss', p_action;
    END CASE;

END;
$$;

-- =============================================================
-- 3. unblock_user(p_user_id)
--    사용자의 차단을 즉시 해제합니다.
-- =============================================================
CREATE OR REPLACE FUNCTION unblock_user(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- 관리자 권한 확인
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = v_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Admin privileges required';
    END IF;

    -- 대상 사용자 존재 확인
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;

    -- 활성 차단 해제
    UPDATE user_bans
    SET is_active    = false,
        unbanned_by  = v_admin_id,
        unban_at     = now()
    WHERE user_id = p_user_id AND is_active = true;

    -- profiles 차단 상태 해제 (컬럼 존재 시)
    UPDATE profiles
    SET is_banned = false, ban_until = NULL
    WHERE id = p_user_id;

END;
$$;

-- =============================================================
-- 4. extend_ban(p_user_id, p_additional_days)
--    차단 기간을 연장합니다 (현재 unban_at 기준으로 추가).
-- =============================================================
CREATE OR REPLACE FUNCTION extend_ban(
    p_user_id        UUID,
    p_additional_days INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id    UUID;
    v_ban         user_bans%ROWTYPE;
    v_new_unban_at TIMESTAMPTZ;
BEGIN
    -- 관리자 권한 확인
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = v_admin_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Admin privileges required';
    END IF;

    IF p_additional_days IS NULL OR p_additional_days <= 0 THEN
        RAISE EXCEPTION 'p_additional_days must be a positive integer';
    END IF;

    -- 활성 임시 차단 조회
    SELECT * INTO v_ban
    FROM user_bans
    WHERE user_id = p_user_id AND is_active = true AND is_permanent = false
    ORDER BY banned_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active temporary ban found for user: %', p_user_id;
    END IF;

    -- 연장: unban_at이 미래면 거기서부터 추가, 과거면 now()부터 추가
    v_new_unban_at := GREATEST(v_ban.unban_at, now()) + (p_additional_days || ' days')::INTERVAL;

    UPDATE user_bans
    SET unban_at     = v_new_unban_at,
        ban_duration = EXTRACT(DAY FROM (v_new_unban_at - banned_at))::INT
    WHERE id = v_ban.id;

    -- profiles ban_until 동기화
    UPDATE profiles
    SET ban_until = v_new_unban_at
    WHERE id = p_user_id;

END;
$$;

-- =============================================================
-- 5. RLS 정책
-- =============================================================

-- reports 테이블 RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_admin_all" ON reports;
CREATE POLICY "reports_admin_all" ON reports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "reports_user_insert" ON reports;
CREATE POLICY "reports_user_insert" ON reports
    FOR INSERT
    TO authenticated
    WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "reports_user_select_own" ON reports;
CREATE POLICY "reports_user_select_own" ON reports
    FOR SELECT
    TO authenticated
    USING (reporter_id = auth.uid());

-- user_bans 테이블 RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_bans_admin_all" ON user_bans;
CREATE POLICY "user_bans_admin_all" ON user_bans
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "user_bans_user_select_own" ON user_bans;
CREATE POLICY "user_bans_user_select_own" ON user_bans
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- warning_logs 테이블 RLS
ALTER TABLE warning_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "warning_logs_admin_all" ON warning_logs;
CREATE POLICY "warning_logs_admin_all" ON warning_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =============================================================
-- 6. RPC 함수 실행 권한
-- =============================================================
GRANT EXECUTE ON FUNCTION process_report(UUID, TEXT, INT)  TO authenticated;
GRANT EXECUTE ON FUNCTION unblock_user(UUID)               TO authenticated;
GRANT EXECUTE ON FUNCTION extend_ban(UUID, INT)            TO authenticated;

-- =============================================================
-- 7. 만료된 차단 자동 해제 함수 (선택: pg_cron 등으로 주기 실행)
-- =============================================================
CREATE OR REPLACE FUNCTION auto_expire_bans()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- unban_at이 지난 임시 차단 비활성화
    UPDATE user_bans
    SET is_active = false
    WHERE is_active = true
      AND is_permanent = false
      AND unban_at IS NOT NULL
      AND unban_at <= now();

    -- profiles 차단 상태 동기화
    UPDATE profiles p
    SET is_banned = false, ban_until = NULL
    WHERE p.is_banned = true
      AND p.ban_until IS NOT NULL
      AND p.ban_until <= now()
      AND NOT EXISTS (
          SELECT 1 FROM user_bans ub
          WHERE ub.user_id = p.id AND ub.is_active = true
      );
END;
$$;

-- =============================================================
-- 8. 사용 예시
-- =============================================================
-- 경고 발송:
--   SELECT process_report('<report_uuid>', 'warn', NULL);
--
-- 3일 차단:
--   SELECT process_report('<report_uuid>', 'ban', 3);
--
-- 7일 차단:
--   SELECT process_report('<report_uuid>', 'ban', 7);
--
-- 30일 차단:
--   SELECT process_report('<report_uuid>', 'ban', 30);
--
-- 영구 차단:
--   SELECT process_report('<report_uuid>', 'ban', NULL);
--
-- 기각:
--   SELECT process_report('<report_uuid>', 'dismiss', NULL);
--
-- 차단 해제:
--   SELECT unblock_user('<user_uuid>');
--
-- 차단 연장 (+7일):
--   SELECT extend_ban('<user_uuid>', 7);
