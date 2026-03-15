-- @task S8F2 — 댓글 대댓글 depth 확장 (3단계)
-- Stage: S8 | Area: F | File: sql/comments_schema.sql
-- Supabase 댓글 스키마: comments + comment_likes, RLS, 인덱스, 체크 제약조건

-- ─────────────────────────────────────────────
-- Extension (UUID 생성)
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. comments 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id     UUID NOT NULL,                          -- 게시글 ID (foreign key 는 게시글 테이블에 맞게 추가)
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES public.comments(id) ON DELETE SET NULL,  -- self-referential (대댓글)
    depth       INTEGER NOT NULL DEFAULT 0
                    CHECK (depth >= 0 AND depth <= 3),  -- 최대 3단계 depth 제한
    content     TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
    likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    is_edited   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.comments IS '커뮤니티 댓글 및 대댓글 (최대 depth 3)';
COMMENT ON COLUMN public.comments.parent_id IS 'NULL이면 최상위 댓글, 값이 있으면 대댓글';
COMMENT ON COLUMN public.comments.depth IS '댓글 깊이: 0(최상위) ~ 3(3단계 대댓글)';

-- ─────────────────────────────────────────────
-- 2. comment_likes 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id  UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT comment_likes_unique UNIQUE (comment_id, user_id)  -- 사용자당 1회만 좋아요
);

COMMENT ON TABLE public.comment_likes IS '댓글 좋아요 (comment_id + user_id 조합 유니크)';

-- ─────────────────────────────────────────────
-- 3. 인덱스
-- ─────────────────────────────────────────────

-- 게시글별 댓글 조회 (가장 빈번한 쿼리)
CREATE INDEX IF NOT EXISTS idx_comments_post_id
    ON public.comments (post_id);

-- 부모 댓글별 자식 댓글 조회 (대댓글 로드)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id
    ON public.comments (parent_id)
    WHERE parent_id IS NOT NULL;

-- 시간순 정렬 지원
CREATE INDEX IF NOT EXISTS idx_comments_created_at
    ON public.comments (created_at);

-- 게시글 + 시간 복합 인덱스 (페이지네이션 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_post_created
    ON public.comments (post_id, created_at)
    WHERE parent_id IS NULL;  -- 최상위 댓글만

-- 좋아요 조회 최적화
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id
    ON public.comment_likes (comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id
    ON public.comment_likes (user_id);

-- ─────────────────────────────────────────────
-- 4. updated_at 자동 갱신 트리거
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_comments_updated_at ON public.comments;
CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- 5. likes_count 자동 동기화 트리거
--    comment_likes INSERT/DELETE 시 comments.likes_count 반영
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_comment_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_likes_count ON public.comment_likes;
CREATE TRIGGER trg_sync_likes_count
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_comment_likes_count();

-- ─────────────────────────────────────────────
-- 6. depth 자동 계산 트리거
--    INSERT 시 parent_id 의 depth + 1 로 자동 설정
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_comment_depth()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.depth := 0;
    ELSE
        SELECT depth INTO parent_depth
        FROM public.comments
        WHERE id = NEW.parent_id;

        IF parent_depth IS NULL THEN
            RAISE EXCEPTION 'Parent comment not found: %', NEW.parent_id;
        END IF;

        IF parent_depth >= 3 THEN
            RAISE EXCEPTION 'Maximum comment depth (3) exceeded.';
        END IF;

        NEW.depth := parent_depth + 1;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_comment_depth ON public.comments;
CREATE TRIGGER trg_set_comment_depth
    BEFORE INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_comment_depth();

-- ─────────────────────────────────────────────
-- 7. RLS (Row Level Security) 활성화
-- ─────────────────────────────────────────────

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ── comments 정책 ──

-- 누구나 읽기 (비로그인 포함)
DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
CREATE POLICY "comments_select_public"
    ON public.comments FOR SELECT
    USING (TRUE);

-- 인증된 사용자만 댓글 작성
DROP POLICY IF EXISTS "comments_insert_authenticated" ON public.comments;
CREATE POLICY "comments_insert_authenticated"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 본인 댓글만 수정 가능
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 삭제 가능
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- ── comment_likes 정책 ──

-- 누구나 읽기
DROP POLICY IF EXISTS "comment_likes_select_public" ON public.comment_likes;
CREATE POLICY "comment_likes_select_public"
    ON public.comment_likes FOR SELECT
    USING (TRUE);

-- 인증된 사용자만 좋아요 추가
DROP POLICY IF EXISTS "comment_likes_insert_authenticated" ON public.comment_likes;
CREATE POLICY "comment_likes_insert_authenticated"
    ON public.comment_likes FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 본인 좋아요만 취소
DROP POLICY IF EXISTS "comment_likes_delete_own" ON public.comment_likes;
CREATE POLICY "comment_likes_delete_own"
    ON public.comment_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 8. profiles 뷰 (닉네임 + 아바타 공개 조회용)
--    이미 profiles 테이블이 있다면 생략 가능
-- ─────────────────────────────────────────────
-- CREATE TABLE IF NOT EXISTS public.profiles (
--     id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     nickname   TEXT NOT NULL DEFAULT '익명',
--     avatar_url TEXT
-- );
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────
-- 9. 샘플 데이터 (개발/테스트용, 운영 시 제거)
-- ─────────────────────────────────────────────
-- INSERT INTO public.comments (post_id, user_id, content)
-- VALUES
--     ('00000000-0000-0000-0000-000000000001'::uuid, auth.uid(), '최상위 댓글 예시'),
--     ('00000000-0000-0000-0000-000000000001'::uuid, auth.uid(), '또 다른 최상위 댓글');
