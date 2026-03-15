# S5D4: user_notifications 테이블 생성

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S5D4 |
| Task 이름 | user_notifications 테이블 생성 |
| Stage | S5 — 개발 3차 |
| Area | D — Database |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | claude-sonnet-4-6 |

## 배경 및 목적

인앱 알림 시스템의 기반 테이블이 필요하다. 사용자가 커뮤니티에서 활동할 때(내 게시글에 댓글이 달리거나 투표가 발생할 때) 알림을 기록하는 테이블을 생성한다. S6F1(알림 드롭다운 UI) 구현의 전제 조건이다.

## 세부 작업 지시

1. `user_notifications` 테이블을 다음 스키마로 CREATE TABLE 한다:
   ```sql
   CREATE TABLE IF NOT EXISTS user_notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     type TEXT NOT NULL CHECK (type IN ('comment', 'vote', 'reply', 'mention', 'system')),
     content TEXT NOT NULL,
     is_read BOOLEAN DEFAULT FALSE,
     related_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
     related_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
2. RLS(Row Level Security)를 활성화한다:
   ```sql
   ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
   ```
3. RLS 정책을 정의한다:
   - SELECT: 본인의 알림만 조회 (`user_id = auth.uid()`)
   - UPDATE: 본인의 알림만 읽음 처리 (`user_id = auth.uid()`)
   - INSERT: 시스템(service_role) 또는 트리거만 허용
4. 댓글 INSERT 시 게시글 작성자에게 알림을 생성하는 트리거 함수를 작성한다:
   ```sql
   CREATE OR REPLACE FUNCTION notify_post_author_on_comment()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO user_notifications (user_id, type, content, related_post_id, related_comment_id)
     SELECT p.user_id, 'comment', '내 게시글에 댓글이 달렸습니다.', NEW.post_id, NEW.id
     FROM posts p WHERE p.id = NEW.post_id AND p.user_id != NEW.user_id;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```
5. 트리거를 `comments` 테이블에 연결한다.
6. 인덱스를 생성한다: `CREATE INDEX ON user_notifications(user_id, is_read, created_at DESC);`

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/migrations/06_user_notifications.sql` | user_notifications 테이블 생성, RLS 정책, 알림 트리거 함수 |

## 완료 기준
- [ ] `user_notifications` 테이블이 Supabase에 생성됨
- [ ] RLS가 활성화되고 정책이 올바르게 적용됨
- [ ] 본인의 알림만 SELECT 가능함
- [ ] 댓글 INSERT 시 게시글 작성자에게 알림 레코드가 자동 생성됨
- [ ] 인덱스가 생성되어 알림 조회 성능이 확보됨
- [ ] S6F1 구현의 기반으로 활용 가능한 상태
