-- @task S7E1
-- email_logs_schema.sql
-- 이메일 발송 로그 테이블 스키마
-- 의존: enrollments 테이블 (UUID PK)

-- ============================================================
-- 1. email_logs 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id    UUID         REFERENCES enrollments(id) ON DELETE SET NULL,
  recipient_email  VARCHAR(255) NOT NULL,
  email_type       VARCHAR(50)  NOT NULL DEFAULT 'enrollment_confirmation',
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
  sent_at          TIMESTAMPTZ,
  attempt_count    INT          NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error       TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  email_logs                IS '이메일 발송 이력 및 상태 로그';
COMMENT ON COLUMN email_logs.id             IS '로그 레코드 고유 ID';
COMMENT ON COLUMN email_logs.enrollment_id  IS '연결된 수강 신청 ID (삭제 시 NULL 유지)';
COMMENT ON COLUMN email_logs.recipient_email IS '수신자 이메일 주소';
COMMENT ON COLUMN email_logs.email_type     IS '이메일 종류 (enrollment_confirmation 등)';
COMMENT ON COLUMN email_logs.status         IS 'pending=대기 / sent=발송완료 / failed=실패 / retrying=재시도중';
COMMENT ON COLUMN email_logs.sent_at        IS '실제 발송 완료 시각 (실패 시 NULL)';
COMMENT ON COLUMN email_logs.attempt_count  IS '총 발송 시도 횟수';
COMMENT ON COLUMN email_logs.last_error     IS '마지막 오류 메시지 (성공 시 NULL)';
COMMENT ON COLUMN email_logs.created_at     IS '레코드 최초 생성 시각';
COMMENT ON COLUMN email_logs.updated_at     IS '레코드 마지막 수정 시각';

-- ============================================================
-- 2. updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION set_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_logs_updated_at ON email_logs;

CREATE TRIGGER trg_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_email_logs_updated_at();

-- ============================================================
-- 3. 인덱스
-- ============================================================
-- enrollment_id 기반 조회 (수강 신청별 발송 이력 확인)
CREATE INDEX IF NOT EXISTS idx_email_logs_enrollment_id
  ON email_logs (enrollment_id);

-- status 기반 조회 (실패 건 재처리 배치용)
CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON email_logs (status)
  WHERE status IN ('pending', 'failed', 'retrying');

-- recipient_email 기반 조회 (특정 수신자 발송 이력 확인)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email
  ON email_logs (recipient_email);

-- 최신 레코드 조회 최적화 (created_at DESC)
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at
  ON email_logs (created_at DESC);

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 관리자(service_role)만 전체 접근 허용
CREATE POLICY "email_logs: service_role full access"
  ON email_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 일반 인증 사용자는 자신의 enrollment와 연결된 로그만 조회 가능
CREATE POLICY "email_logs: authenticated read own"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM enrollments
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. 실패 건 재처리용 뷰 (배치/모니터링)
-- ============================================================
CREATE OR REPLACE VIEW v_email_logs_failed AS
SELECT
  el.id,
  el.enrollment_id,
  el.recipient_email,
  el.email_type,
  el.status,
  el.attempt_count,
  el.last_error,
  el.created_at,
  el.updated_at,
  -- 마지막 실패 후 경과 시간
  EXTRACT(EPOCH FROM (NOW() - el.updated_at)) / 60 AS minutes_since_last_attempt
FROM email_logs el
WHERE el.status IN ('failed', 'retrying')
  AND el.attempt_count < 10  -- 10회 이상 시도한 건은 수동 검토 대상에서 제외
ORDER BY el.created_at ASC;

COMMENT ON VIEW v_email_logs_failed IS '재처리 대상 실패 이메일 목록 (attempt_count < 10)';

-- ============================================================
-- 6. 발송 통계 뷰 (대시보드용)
-- ============================================================
CREATE OR REPLACE VIEW v_email_logs_stats AS
SELECT
  email_type,
  status,
  COUNT(*)                                          AS count,
  AVG(attempt_count)                                AS avg_attempts,
  MIN(created_at)                                   AS first_created,
  MAX(created_at)                                   AS last_created
FROM email_logs
GROUP BY email_type, status
ORDER BY email_type, status;

COMMENT ON VIEW v_email_logs_stats IS '이메일 유형별 발송 현황 통계';
