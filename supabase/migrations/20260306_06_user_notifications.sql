-- @task S5D4
-- user_notifications 테이블 생성
-- 인앱 알림 시스템 기반 테이블 — S6F1(알림 드롭다운 UI) 선행 조건

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'reply', 'mention', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_post_id UUID REFERENCES community_posts(id) ON DELETE SET NULL,
  related_comment_id UUID REFERENCES community_comments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 — SELECT: 본인 알림만 조회
CREATE POLICY "user_notifications_select_own"
  ON user_notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- 4. RLS 정책 — UPDATE: 본인 알림만 읽음 처리
CREATE POLICY "user_notifications_update_own"
  ON user_notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. RLS 정책 — INSERT: service_role 및 트리거(SECURITY DEFINER)만 허용
--    일반 사용자(authenticated)는 직접 INSERT 불가
CREATE POLICY "user_notifications_insert_system_only"
  ON user_notifications
  FOR INSERT
  WITH CHECK (FALSE);  -- 일반 클라이언트 INSERT 차단; 트리거/service_role만 우회 가능

-- 6. 댓글 INSERT 시 게시글 작성자에게 알림 생성 트리거 함수
CREATE OR REPLACE FUNCTION notify_post_author_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notifications (user_id, type, content, related_post_id, related_comment_id)
  SELECT p.author_id, 'comment', '내 게시글에 댓글이 달렸습니다.', NEW.post_id, NEW.id
  FROM community_posts p WHERE p.id = NEW.post_id AND p.author_id != NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. comments 테이블에 트리거 연결
DROP TRIGGER IF EXISTS trigger_notify_on_comment ON community_comments;
CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_post_author_on_comment();

-- 8. 알림 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read_created
  ON user_notifications(user_id, is_read, created_at DESC);
