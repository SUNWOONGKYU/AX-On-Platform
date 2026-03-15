-- @task S5D4
-- @description 사용자 알림 시스템 테이블 및 트리거
-- @area Database
-- @stage S5

-- 1. 알림 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'vote', 'mention', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_post_id UUID REFERENCES public.community_posts(id) ON DELETE SET NULL,
  related_comment_id UUID REFERENCES public.community_comments(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.user_notifications(created_at DESC);

-- 3. RLS 활성화
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 조회
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 본인 알림 읽음 처리
DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 시스템/트리거만 INSERT (인증된 사용자)
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.user_notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 본인 알림 삭제
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.user_notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- 4. 댓글 작성 시 자동 알림 트리거
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
  v_parent_author_id UUID;
BEGIN
  -- 게시물 작성자 ID 조회
  SELECT user_id INTO v_post_author_id
  FROM public.community_posts WHERE id = NEW.post_id;

  -- 게시물 작성자에게 알림 (본인 댓글 제외)
  IF NEW.user_id != v_post_author_id THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, link, related_post_id, related_comment_id, actor_id)
    VALUES (
      v_post_author_id,
      CASE WHEN NEW.parent_id IS NULL THEN 'comment' ELSE 'reply' END,
      CASE WHEN NEW.parent_id IS NULL THEN '새 댓글이 달렸습니다' ELSE '대댓글이 달렸습니다' END,
      LEFT(NEW.content, 100),
      '/community.html?post=' || NEW.post_id::TEXT,
      NEW.post_id,
      NEW.id,
      NEW.user_id
    );
  END IF;

  -- 대댓글인 경우 부모 댓글 작성자에게도 알림
  -- (본인 제외 + 게시물 작성자와 중복 방지)
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO v_parent_author_id
    FROM public.community_comments WHERE id = NEW.parent_id;

    IF NEW.user_id != v_parent_author_id AND v_parent_author_id != v_post_author_id THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, link, related_post_id, related_comment_id, actor_id)
      VALUES (
        v_parent_author_id,
        'reply',
        '대댓글이 달렸습니다',
        LEFT(NEW.content, 100),
        '/community.html?post=' || NEW.post_id::TEXT,
        NEW.post_id,
        NEW.id,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 트리거 멱등성 보장
DROP TRIGGER IF EXISTS trigger_notify_on_comment ON public.community_comments;

CREATE TRIGGER trigger_notify_on_comment
  AFTER INSERT ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();
