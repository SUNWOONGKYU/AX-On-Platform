-- @task S7E1
-- enrollment_triggers.sql
-- 수강 신청 승인 시 이메일 발송 트리거
-- 의존: enrollments 테이블, pg_net 확장, app.settings.edge_function_url 설정

-- ============================================================
-- 0. 사전 요건: pg_net 확장 활성화
-- ============================================================
-- Supabase 대시보드 > Database > Extensions > pg_net 활성화 필요
-- 또는 아래 명령 실행 (superuser 권한 필요):
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- 1. 트리거 함수: notify_enrollment_approved
-- ============================================================
CREATE OR REPLACE FUNCTION notify_enrollment_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_edge_function_url TEXT;
  v_request_id        BIGINT;
BEGIN
  -- 환경 설정에서 Edge Function URL 조회
  BEGIN
    v_edge_function_url := current_setting('app.settings.edge_function_url');
  EXCEPTION WHEN OTHERS THEN
    -- 설정 누락 시 오류 로그 후 정상 완료 처리 (이메일 발송 실패가 enrollment 상태 변경을 막지 않도록)
    RAISE WARNING '[notify_enrollment_approved] app.settings.edge_function_url 설정 누락. enrollment_id: %', NEW.id;
    RETURN NEW;
  END;

  IF v_edge_function_url IS NULL OR v_edge_function_url = '' THEN
    RAISE WARNING '[notify_enrollment_approved] edge_function_url이 비어있음. enrollment_id: %', NEW.id;
    RETURN NEW;
  END IF;

  -- pg_net을 통해 Edge Function에 비동기 HTTP POST 요청
  SELECT net.http_post(
    url     := v_edge_function_url || '/send-enrollment-email',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body    := json_build_object('enrollment_id', NEW.id)::text
  ) INTO v_request_id;

  -- 요청 ID 로깅 (디버깅용)
  RAISE NOTICE '[notify_enrollment_approved] HTTP 요청 전송 완료. enrollment_id: %, request_id: %',
    NEW.id, v_request_id;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- 네트워크 오류 등 예외 발생 시 경고만 기록하고 트랜잭션 계속 진행
  RAISE WARNING '[notify_enrollment_approved] HTTP 요청 실패. enrollment_id: %, error: %',
    NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public;

-- 함수 소유권 및 실행 권한 설정
ALTER FUNCTION notify_enrollment_approved() OWNER TO postgres;
REVOKE ALL ON FUNCTION notify_enrollment_approved() FROM PUBLIC;

-- ============================================================
-- 2. 트리거: enrollment_approved_trigger
-- ============================================================
-- 기존 트리거 제거 후 재생성 (멱등성 보장)
DROP TRIGGER IF EXISTS enrollment_approved_trigger ON enrollments;

CREATE TRIGGER enrollment_approved_trigger
  AFTER UPDATE OF status ON enrollments
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
  EXECUTE FUNCTION notify_enrollment_approved();

COMMENT ON TRIGGER enrollment_approved_trigger ON enrollments IS
  'pending → approved 상태 전환 시 수강 확인 이메일 자동 발송 (pg_net → Edge Function)';

-- ============================================================
-- 3. 트리거 동작 확인용 뷰 (선택적)
-- ============================================================
-- 발송이 요청된 enrollment를 조회 (email_logs 연동)
CREATE OR REPLACE VIEW v_enrollment_email_status AS
SELECT
  e.id                AS enrollment_id,
  e.status            AS enrollment_status,
  e.updated_at        AS approved_at,
  p.email             AS recipient_email,
  p.full_name         AS user_name,
  c.title             AS course_name,
  el.status           AS email_status,
  el.sent_at,
  el.attempt_count,
  el.last_error
FROM enrollments e
LEFT JOIN profiles  p  ON p.id = e.user_id
LEFT JOIN courses   c  ON c.id = e.course_id
LEFT JOIN email_logs el
  ON  el.enrollment_id = e.id
  AND el.email_type    = 'enrollment_confirmation'
WHERE e.status = 'approved'
ORDER BY e.updated_at DESC;

COMMENT ON VIEW v_enrollment_email_status IS
  '승인된 수강 신청 및 이메일 발송 상태 현황';

-- ============================================================
-- 4. app.settings 구성 예시 (참고용 — 실제 적용은 Supabase 대시보드에서)
-- ============================================================
-- ALTER DATABASE postgres SET app.settings.edge_function_url  = 'https://<project-ref>.supabase.co/functions/v1';
-- ALTER DATABASE postgres SET app.settings.service_role_key   = '<service-role-key>';
