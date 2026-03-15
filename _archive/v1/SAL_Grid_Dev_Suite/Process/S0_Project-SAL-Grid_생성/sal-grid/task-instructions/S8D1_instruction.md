# S8D1: 공지사항/설정 테이블 생성

## Task 정보
- **Task ID**: S8D1
- **Task Name**: 공지사항/설정 테이블 생성
- **Stage**: S8 (개발 6차)
- **Area**: D (Database)
- **Priority**: Medium
- **Complexity**: Low
- **Execution Type**: AI-Only
- **Task Agent**: database-developer
- **Verification Agent**: code-reviewer
- **Dependencies**: S5D1

## Task 목표

공지사항(announcements) 테이블을 생성하고 RLS 정책을 설정한다. 이 테이블은 S8F7(공지사항 관리 CRUD)의 데이터 소스가 된다.

## 상세 구현 요구사항

### 1. announcements 테이블 생성

```sql
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'page', 'popup')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. 인덱스 생성

```sql
-- 활성 공지 조회 최적화
CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
```

### 3. updated_at 자동 갱신 트리거

```sql
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_announcements_updated_at();
```

### 4. RLS 정책

```sql
-- RLS 활성화
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 관리자만 CRUD 가능
CREATE POLICY "admins_can_manage_announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- 일반 사용자는 활성 + 기간 내 공지만 SELECT
CREATE POLICY "users_can_read_active_announcements"
  ON announcements
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );
```

### 5. 마이그레이션 파일

Supabase 마이그레이션 파일로 작성한다.

## 생성/수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `supabase/migrations/20260305_create_announcements.sql` | announcements 테이블 생성 마이그레이션 |

## 완료 기준

- [ ] announcements 테이블이 정상 생성됨
- [ ] 인덱스 4개가 생성됨
- [ ] updated_at 트리거가 정상 동작함
- [ ] RLS 정책이 적용됨 (관리자 CRUD, 일반 사용자 조건부 SELECT)
- [ ] SQL 문법 오류가 없음
