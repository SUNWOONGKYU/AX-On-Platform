-- @task S5D1
-- @description 커뮤니티 투표 스키마 수정 (vote SMALLINT → vote_type TEXT)
--
-- 대상 테이블: post_votes, comment_votes
-- 변경 내용: vote SMALLINT NOT NULL CHECK (vote IN (1, -1))
--            → vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down'))
-- 데이터 마이그레이션: 1 → 'up', -1 → 'down'
-- 멱등성: 재실행해도 에러 없음 (컬럼 존재 여부 확인 후 처리)
-- 실행 환경: PostgreSQL
-- 작성일: 2026-03-06

BEGIN;

-- ============================================================
-- 1. post_votes 테이블: vote → vote_type 변환
-- ============================================================
DO $$
BEGIN
    -- 1-1. vote_type 컬럼이 아직 없는 경우에만 추가
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'post_votes'
          AND column_name = 'vote_type'
    ) THEN
        -- 임시로 NOT NULL 제약 없이 컬럼 추가
        ALTER TABLE post_votes ADD COLUMN vote_type TEXT;

        -- 기존 데이터 마이그레이션: 1 → 'up', -1 → 'down'
        UPDATE post_votes SET vote_type = 'up'   WHERE vote = 1;
        UPDATE post_votes SET vote_type = 'down' WHERE vote = -1;

        -- NOT NULL 제약 추가
        ALTER TABLE post_votes ALTER COLUMN vote_type SET NOT NULL;

        -- CHECK 제약 추가
        ALTER TABLE post_votes
            ADD CONSTRAINT post_votes_vote_type_check
            CHECK (vote_type IN ('up', 'down'));

        RAISE NOTICE 'post_votes: vote_type 컬럼 추가 및 데이터 마이그레이션 완료';
    ELSE
        RAISE NOTICE 'post_votes: vote_type 컬럼이 이미 존재합니다. 건너뜁니다.';
    END IF;

    -- 1-2. vote 컬럼이 아직 남아 있는 경우에만 삭제
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'post_votes'
          AND column_name = 'vote'
    ) THEN
        ALTER TABLE post_votes DROP COLUMN vote;
        RAISE NOTICE 'post_votes: 기존 vote 컬럼 삭제 완료';
    ELSE
        RAISE NOTICE 'post_votes: 기존 vote 컬럼이 이미 없습니다. 건너뜁니다.';
    END IF;
END;
$$;

-- ============================================================
-- 2. comment_votes 테이블: vote → vote_type 변환
-- ============================================================
DO $$
BEGIN
    -- 2-1. vote_type 컬럼이 아직 없는 경우에만 추가
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'comment_votes'
          AND column_name = 'vote_type'
    ) THEN
        -- 임시로 NOT NULL 제약 없이 컬럼 추가
        ALTER TABLE comment_votes ADD COLUMN vote_type TEXT;

        -- 기존 데이터 마이그레이션: 1 → 'up', -1 → 'down'
        UPDATE comment_votes SET vote_type = 'up'   WHERE vote = 1;
        UPDATE comment_votes SET vote_type = 'down' WHERE vote = -1;

        -- NOT NULL 제약 추가
        ALTER TABLE comment_votes ALTER COLUMN vote_type SET NOT NULL;

        -- CHECK 제약 추가
        ALTER TABLE comment_votes
            ADD CONSTRAINT comment_votes_vote_type_check
            CHECK (vote_type IN ('up', 'down'));

        RAISE NOTICE 'comment_votes: vote_type 컬럼 추가 및 데이터 마이그레이션 완료';
    ELSE
        RAISE NOTICE 'comment_votes: vote_type 컬럼이 이미 존재합니다. 건너뜁니다.';
    END IF;

    -- 2-2. vote 컬럼이 아직 남아 있는 경우에만 삭제
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'comment_votes'
          AND column_name = 'vote'
    ) THEN
        ALTER TABLE comment_votes DROP COLUMN vote;
        RAISE NOTICE 'comment_votes: 기존 vote 컬럼 삭제 완료';
    ELSE
        RAISE NOTICE 'comment_votes: 기존 vote 컬럼이 이미 없습니다. 건너뜁니다.';
    END IF;
END;
$$;

COMMIT;
