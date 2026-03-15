-- =============================================================
-- @task S5D5
-- @description profiles/users_profiles 통합 + 자동 프로필 생성 트리거
-- @area Database
-- @stage S5
--
-- 목적:
--   1. profiles 테이블에 users_profiles의 고유 컬럼 추가 (name, nickname)
--   2. users_profiles → profiles 데이터 마이그레이션
--   3. users_profiles 테이블 DROP
--   4. auth.users 가입 시 profiles 자동 INSERT 트리거 (handle_new_user)
--   5. profiles에 updated_at 컬럼 추가 + 자동 갱신 트리거
--
-- 실행 전 확인:
--   - profiles: id, username (UNIQUE NOT NULL), display_name, role, bio,
--               avatar_url, karma, is_verified, created_at
--   - users_profiles: id, name (NOT NULL), nickname (NOT NULL), role,
--                     bio, avatar_url, created_at
--   - users_profiles를 외래 키로 참조하는 테이블 없음 (DROP 안전)
--   - profiles를 참조하는 테이블:
--       community_posts(author_id) ON DELETE SET NULL
--       post_votes(user_id)        ON DELETE CASCADE
--       community_comments(author_id) ON DELETE SET NULL
--       comment_votes(user_id)     ON DELETE CASCADE
-- =============================================================


-- ════════════════════════════════════════════
-- STEP 1: profiles 테이블에 고유 컬럼 추가
--         (name, nickname — 없는 경우에만)
-- ════════════════════════════════════════════

-- name 컬럼 추가 (users_profiles.name 에 해당, 실명/법인명)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
    RAISE NOTICE 'profiles.name 컬럼 추가 완료';
  ELSE
    RAISE NOTICE 'profiles.name 컬럼 이미 존재 — 건너뜀';
  END IF;
END $$;

-- nickname 컬럼 추가 (users_profiles.nickname 에 해당, 서비스 내 별명)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'nickname'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN nickname TEXT;
    RAISE NOTICE 'profiles.nickname 컬럼 추가 완료';
  ELSE
    RAISE NOTICE 'profiles.nickname 컬럼 이미 존재 — 건너뜀';
  END IF;
END $$;

-- updated_at 컬럼 추가 (STEP 5 트리거와 연동)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'profiles.updated_at 컬럼 추가 완료';
  ELSE
    RAISE NOTICE 'profiles.updated_at 컬럼 이미 존재 — 건너뜀';
  END IF;
END $$;


-- ════════════════════════════════════════════
-- STEP 2: users_profiles → profiles 데이터 마이그레이션
--
--   users_profiles에만 존재하는 행: profiles에 INSERT
--   users_profiles와 profiles 양쪽 모두 존재하는 행:
--     profiles의 name / nickname을 users_profiles 값으로 UPDATE
--     (단, profiles의 기존 값이 NULL인 경우에만 덮어씀)
-- ════════════════════════════════════════════

-- users_profiles 테이블이 존재할 때만 마이그레이션 수행
-- (재실행 시 STEP 3에서 이미 DROP 되었으면 안전하게 스킵)
DO $$
DECLARE
  v_profiles_count      BIGINT;
  v_users_profiles_count BIGINT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users_profiles'
  ) THEN
    -- users_profiles에만 존재하는 행: profiles에 INSERT
    INSERT INTO public.profiles (
      id, username, display_name, role, bio, avatar_url,
      karma, is_verified, name, nickname, created_at, updated_at
    )
    SELECT
      up.id,
      up.nickname                          AS username,
      up.nickname                          AS display_name,
      up.role,
      up.bio,
      up.avatar_url,
      0                                    AS karma,
      false                                AS is_verified,
      up.name,
      up.nickname,
      up.created_at,
      NOW()                                AS updated_at
    FROM public.users_profiles up
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = up.id
    )
    ON CONFLICT (id) DO NOTHING;

    -- 양쪽 모두 존재하는 행: name / nickname 보완 (NULL인 경우에만 덮어씀)
    UPDATE public.profiles p
    SET
      name     = COALESCE(p.name,     up.name),
      nickname = COALESCE(p.nickname, up.nickname),
      updated_at = NOW()
    FROM public.users_profiles up
    WHERE p.id = up.id
      AND (p.name IS NULL OR p.nickname IS NULL);

    -- 마이그레이션 결과 확인용
    SELECT COUNT(*) INTO v_profiles_count      FROM public.profiles;
    SELECT COUNT(*) INTO v_users_profiles_count FROM public.users_profiles;
    RAISE NOTICE '마이그레이션 후 profiles 행 수: %, users_profiles 행 수: %',
      v_profiles_count, v_users_profiles_count;
  ELSE
    RAISE NOTICE 'users_profiles 테이블 없음 — 마이그레이션 스킵 (이미 완료된 상태)';
  END IF;
END $$;


-- ════════════════════════════════════════════
-- STEP 3: users_profiles 테이블 DROP
--
--   DROP 전 의존성 확인:
--     - users_profiles를 참조하는 FK 없음 (S2 마이그레이션 기준)
--     - 인덱스만 존재: idx_users_profiles_role, idx_users_profiles_nickname
--       → CASCADE로 자동 삭제됨
--   DROP 전 RLS 정책도 CASCADE 삭제됨
-- ════════════════════════════════════════════

-- 의존성 이중 점검: users_profiles를 참조하는 FK가 있으면 에러로 중단
DO $$
DECLARE
  v_fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_fk_count
  FROM information_schema.referential_constraints rc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = rc.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = rc.unique_constraint_name
  WHERE ccu.table_schema = 'public'
    AND ccu.table_name   = 'users_profiles';

  IF v_fk_count > 0 THEN
    RAISE EXCEPTION
      'users_profiles를 참조하는 FK가 % 개 발견됨. 수동으로 확인 후 DROP 하세요.',
      v_fk_count;
  ELSE
    RAISE NOTICE 'users_profiles 의존 FK 없음 — DROP 진행';
  END IF;
END $$;

DROP TABLE IF EXISTS public.users_profiles CASCADE;


-- ════════════════════════════════════════════
-- STEP 4: auth.users 가입 시 profiles 자동 INSERT 트리거
--         (handle_new_user)
--
--   Supabase 신규 가입 → auth.users INSERT 발생
--   → handle_new_user() 함수가 profiles에 기본 행 자동 생성
--
--   username 기본값 우선순위:
--     1) raw_user_meta_data->>'username'
--     2) raw_user_meta_data->>'nickname'
--     3) email 로컬 파트 (@이전 부분) + 4자리 랜덤 접미사 (중복 방지)
--
--   name / nickname 기본값:
--     raw_user_meta_data->>'name' / raw_user_meta_data->>'nickname'
-- ════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username    TEXT;
  v_name        TEXT;
  v_nickname    TEXT;
  v_display_name TEXT;
  v_email_local TEXT;
  v_suffix      TEXT;
  v_candidate   TEXT;
  v_attempt     INTEGER := 0;
BEGIN
  -- 메타데이터에서 기본값 추출
  v_name     := NEW.raw_user_meta_data->>'name';
  v_nickname := NEW.raw_user_meta_data->>'nickname';

  -- username 후보 생성
  v_email_local := split_part(NEW.email, '@', 1);

  v_candidate := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'nickname',
    v_email_local
  );

  -- username 유일성 보장 (최대 10회 시도)
  LOOP
    IF v_attempt = 0 THEN
      v_username := v_candidate;
    ELSE
      -- 4자리 랜덤 숫자 접미사 추가
      v_suffix   := lpad((floor(random() * 9000) + 1000)::TEXT, 4, '0');
      v_username := left(v_candidate, 46) || '_' || v_suffix;
    END IF;

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = v_username
    );

    v_attempt := v_attempt + 1;
    IF v_attempt > 10 THEN
      -- 최후 수단: UUID 기반 username
      v_username := 'user_' || replace(NEW.id::TEXT, '-', '');
      EXIT;
    END IF;
  END LOOP;

  -- display_name: name > nickname > email 로컬 파트 순
  v_display_name := COALESCE(v_name, v_nickname, v_email_local);

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    role,
    name,
    nickname,
    bio,
    avatar_url,
    karma,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_username,
    v_display_name,
    'general',        -- 신규 가입자 기본 역할
    v_name,
    v_nickname,
    NULL,             -- bio: 가입 시 미입력
    NULL,             -- avatar_url: 가입 시 미입력
    0,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- 이미 profiles 행이 있으면 건너뜀

  RETURN NEW;
END;
$$;

-- 기존 트리거 제거 후 재등록 (멱등성 보장)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ════════════════════════════════════════════
-- STEP 5: profiles.updated_at 자동 갱신 트리거
--
--   profiles 행이 UPDATE될 때마다
--   updated_at을 NOW()로 자동 갱신
-- ════════════════════════════════════════════

-- update_updated_at 함수는 S2 마이그레이션에서 이미 생성되어 있음
-- (community_posts, community_comments 용으로 사용 중)
-- 동일 함수를 재사용하거나 OR REPLACE로 갱신

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ════════════════════════════════════════════
-- STEP 6: profiles RLS 정책 보완
--
--   S2 마이그레이션에서 이미 아래 정책 존재:
--     profiles_select_all  (SELECT)
--     profiles_update_own  (UPDATE)
--     profiles_insert_own  (INSERT)
--
--   신규 가입 트리거(SECURITY DEFINER)가 INSERT하므로
--   service_role 우회가 필요한 경우는 없음.
--   다만 관리자(service_role)가 프로필 수정할 수 있도록
--   정책 충돌 없이 멱등적으로 재적용.
-- ════════════════════════════════════════════

-- 기존 정책 재적용 (멱등성 — 이미 존재하면 DROP 후 재생성)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ════════════════════════════════════════════
-- 실행 완료
-- ════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'S5D5 profiles 통합 마이그레이션 완료';
  RAISE NOTICE '  - profiles.name, nickname, updated_at 컬럼 추가';
  RAISE NOTICE '  - users_profiles → profiles 데이터 마이그레이션 완료';
  RAISE NOTICE '  - users_profiles 테이블 삭제 완료';
  RAISE NOTICE '  - handle_new_user() 트리거 등록 완료';
  RAISE NOTICE '  - trg_profiles_updated_at 트리거 등록 완료';
  RAISE NOTICE '==============================================';
END $$;
