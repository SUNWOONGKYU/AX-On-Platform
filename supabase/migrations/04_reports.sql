-- @task S5D2
-- reports 테이블 생성
-- community.html의 INSERT 컬럼: reporter_id, target_type, target_id, reason

CREATE TABLE IF NOT EXISTS reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL DEFAULT '부적절한 콘텐츠',
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 로그인 사용자만 INSERT (신고)
DROP POLICY IF EXISTS "reports_insert_auth" ON reports;
CREATE POLICY "reports_insert_auth" ON reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 관리자(authenticated)만 SELECT
DROP POLICY IF EXISTS "reports_select_auth" ON reports;
CREATE POLICY "reports_select_auth" ON reports
  FOR SELECT USING (auth.role() = 'authenticated');
