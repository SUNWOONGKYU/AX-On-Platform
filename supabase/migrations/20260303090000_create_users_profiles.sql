-- ============================================================
-- AX-On Platform: users_profiles 테이블 생성
-- Migration: 20260303090000_create_users_profiles.sql
-- ============================================================

-- 역할 ENUM 타입
CREATE TYPE user_role AS ENUM ('ai_expert', 'company', 'general');

-- users_profiles 테이블 (auth.users 확장)
CREATE TABLE IF NOT EXISTS public.users_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  nickname    text NOT NULL,
  role        user_role NOT NULL DEFAULT 'general',
  bio         text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_profiles_role ON public.users_profiles (role);
CREATE INDEX IF NOT EXISTS idx_users_profiles_nickname ON public.users_profiles (nickname);

-- RLS 활성화
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 프로필만 읽기 가능
CREATE POLICY "users_profiles_select_own"
  ON public.users_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 정책: 자신의 프로필만 수정 가능
CREATE POLICY "users_profiles_update_own"
  ON public.users_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 정책: 자신의 프로필 INSERT (회원가입 시)
CREATE POLICY "users_profiles_insert_own"
  ON public.users_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 댓글: 전문가 목록 등 공개 읽기가 필요한 경우 아래 정책을 활성화
-- CREATE POLICY "users_profiles_public_read"
--   ON public.users_profiles
--   FOR SELECT
--   USING (true);
