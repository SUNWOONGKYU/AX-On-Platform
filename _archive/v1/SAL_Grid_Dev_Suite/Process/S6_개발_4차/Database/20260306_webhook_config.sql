-- @task S6E2 — 문의 접수 담당자 알림 (Webhook 설정)
-- contact_inquiries 테이블 INSERT 시 Edge Function 호출

-- pg_net 확장 활성화 (Supabase 콘솔에서도 활성화 가능)
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Database Webhook 트리거 함수
-- Supabase Dashboard > Database > Webhooks에서 설정 권장
-- 아래는 pg_net을 사용한 수동 설정 예시

CREATE OR REPLACE FUNCTION notify_contact_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url TEXT;
  payload JSONB;
BEGIN
  -- Edge Function URL (Supabase 프로젝트별 설정)
  edge_function_url := current_setting('app.settings.supabase_url', true)
    || '/functions/v1/contact-inquiry-notify';

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'contact_inquiries',
    'schema', 'public',
    'record', row_to_json(NEW)::jsonb
  );

  -- pg_net으로 비동기 HTTP 호출 (Supabase에서 지원)
  -- PERFORM net.http_post(
  --   url := edge_function_url,
  --   headers := jsonb_build_object(
  --     'Content-Type', 'application/json',
  --     'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
  --   ),
  --   body := payload
  -- );

  -- 참고: Supabase Dashboard > Database > Webhooks에서
  -- contact_inquiries 테이블의 INSERT 이벤트에
  -- Edge Function URL을 연결하는 방식을 권장합니다.

  RETURN NEW;
END;
$$;

-- 트리거 생성 (pg_net 사용 시 활성화)
-- CREATE TRIGGER on_contact_inquiry_insert
--   AFTER INSERT ON contact_inquiries
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_contact_inquiry();

-- 참고: 위 트리거 대신 Supabase Dashboard에서
-- Database Webhook을 설정하면 더 안정적입니다.
-- 설정 경로: Supabase Dashboard > Database > Webhooks > Create Webhook
-- Event: INSERT on contact_inquiries
-- URL: https://{project-ref}.supabase.co/functions/v1/contact-inquiry-notify
