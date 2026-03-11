-- @task S5D5
-- =============================================================
-- S5D5: profiles/users_profiles 테이블 통합
-- profiles 단일 테이블로 통합 (users_profiles 제거)
-- =============================================================

-- ════════════════════════════════════════════
-- 1. profiles 테이블에 누락 컬럼 추가
--    (users_profiles의 name, nickname 컬럼 통합)
-- ════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS interests TEXT[],
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- users_profiles의 name/nickname은 profiles의 display_name/username으로 매핑

-- ════════════════════════════════════════════
-- 2. 기존 users_profiles 데이터를 profiles로 마이그레이션
--    (users_profiles에 있고 profiles에 없는 레코드만)
-- ════════════════════════════════════════════

INSERT INTO public.profiles (id, username, display_name, role, bio, avatar_url)
SELECT
  up.id,
  COALESCE(up.nickname, 'user_' || substring(up.id::text, 1, 8)) AS username,
  up.name AS display_name,
  CASE
    WHEN up.role = 'ai_expert' THEN 'ai_expert'::user_role
    WHEN up.role = 'company'   THEN 'company'::user_role
    ELSE 'general'::user_role
  END AS role,
  up.bio,
  up.avatar_url
FROM public.users_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = up.id
)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════
-- 3. auth.users 신규 사용자 자동 profiles 생성 트리거
-- ════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'general')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════
-- 4. profiles updated_at 자동 갱신 트리거
-- ════════════════════════════════════════════

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════
-- 5. profiles RLS 추가 정책 (자신의 프로필 삭제)
-- ════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- ════════════════════════════════════════════
-- 6. users_profiles 테이블 비활성화 (삭제 대신 주석 처리 권고)
--    실제 운영 환경에서는 데이터 마이그레이션 확인 후 DROP
-- ════════════════════════════════════════════

-- 주의: users_profiles 테이블은 아래 명령으로 제거 가능하나
-- 데이터 확인 후 수동으로 실행할 것을 권고합니다.
-- DROP TABLE IF EXISTS public.users_profiles CASCADE;

-- 대신, 새 데이터 삽입을 막는 RLS 정책으로 사실상 비활성화
-- (기존 정책은 auth.uid() = id 이므로 트리거 기반 삽입 외 차단됨)

-- ════════════════════════════════════════════
-- 7. 인덱스 추가
-- ════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles (display_name);

-- ════════════════════════════════════════════
-- 완료: profiles 단일 테이블로 통합
-- ════════════════════════════════════════════
