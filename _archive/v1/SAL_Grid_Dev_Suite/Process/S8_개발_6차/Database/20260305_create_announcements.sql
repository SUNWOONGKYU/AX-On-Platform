-- @task S8D1
-- @description 공지사항/설정 테이블 생성

-- ============================================================
-- announcements 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS public.announcements (
    id          uuid        NOT NULL DEFAULT gen_random_uuid(),
    title       text        NOT NULL,
    content     text        NOT NULL,
    category    text        NOT NULL DEFAULT 'general',   -- general | maintenance | update | event
    priority    text        NOT NULL DEFAULT 'normal',    -- low | normal | high | urgent
    is_pinned   boolean     NOT NULL DEFAULT false,
    is_published boolean    NOT NULL DEFAULT true,
    published_at timestamptz NOT NULL DEFAULT now(),
    expires_at  timestamptz,
    author_id   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT announcements_pkey PRIMARY KEY (id),
    CONSTRAINT announcements_category_check CHECK (
        category IN ('general', 'maintenance', 'update', 'event')
    ),
    CONSTRAINT announcements_priority_check CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    )
);

COMMENT ON TABLE  public.announcements                IS '플랫폼 공지사항';
COMMENT ON COLUMN public.announcements.category       IS 'general | maintenance | update | event';
COMMENT ON COLUMN public.announcements.priority       IS 'low | normal | high | urgent';
COMMENT ON COLUMN public.announcements.is_pinned      IS '상단 고정 여부';
COMMENT ON COLUMN public.announcements.is_published   IS '게시 여부';
COMMENT ON COLUMN public.announcements.published_at   IS '게시 시각';
COMMENT ON COLUMN public.announcements.expires_at     IS '게시 만료 시각 (null = 무기한)';
COMMENT ON COLUMN public.announcements.author_id      IS '작성자 (auth.users 참조)';

-- ============================================================
-- site_settings 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id          uuid        NOT NULL DEFAULT gen_random_uuid(),
    key         text        NOT NULL,
    value       jsonb       NOT NULL,
    description text,
    updated_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT site_settings_pkey    PRIMARY KEY (id),
    CONSTRAINT site_settings_key_key UNIQUE (key)
);

COMMENT ON TABLE  public.site_settings             IS '사이트 전역 설정 (key-value)';
COMMENT ON COLUMN public.site_settings.key         IS '설정 키 (고유)';
COMMENT ON COLUMN public.site_settings.value       IS '설정 값 (jsonb)';
COMMENT ON COLUMN public.site_settings.description IS '설정 설명';
COMMENT ON COLUMN public.site_settings.updated_by  IS '최종 수정자 (auth.users 참조)';

-- ============================================================
-- 인덱스
-- ============================================================

-- announcements
CREATE INDEX IF NOT EXISTS idx_announcements_category
    ON public.announcements (category);

CREATE INDEX IF NOT EXISTS idx_announcements_is_published
    ON public.announcements (is_published);

CREATE INDEX IF NOT EXISTS idx_announcements_published_at
    ON public.announcements (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_is_pinned
    ON public.announcements (is_pinned);

-- site_settings 의 key 는 UNIQUE 제약이 자동 인덱스를 생성하므로 별도 추가 불필요.

-- ============================================================
-- updated_at 자동 갱신 트리거 함수
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at IS 'updated_at 컬럼을 현재 시각으로 자동 갱신';

-- announcements 트리거
CREATE OR REPLACE TRIGGER trg_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- site_settings 트리거
CREATE OR REPLACE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings  ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- announcements RLS 정책
-- ------------------------------------------------------------

-- anon: 게시된 공지사항 조회
CREATE POLICY "anon_select_published_announcements"
    ON public.announcements
    FOR SELECT
    TO anon
    USING (is_published = true);

-- authenticated: 게시된 공지사항 조회
CREATE POLICY "auth_select_published_announcements"
    ON public.announcements
    FOR SELECT
    TO authenticated
    USING (is_published = true);

-- authenticated: 공지사항 등록
CREATE POLICY "auth_insert_announcements"
    ON public.announcements
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- authenticated: 공지사항 수정
CREATE POLICY "auth_update_announcements"
    ON public.announcements
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- authenticated: 공지사항 삭제
CREATE POLICY "auth_delete_announcements"
    ON public.announcements
    FOR DELETE
    TO authenticated
    USING (true);

-- ------------------------------------------------------------
-- site_settings RLS 정책
-- ------------------------------------------------------------

-- anon: 설정 조회
CREATE POLICY "anon_select_site_settings"
    ON public.site_settings
    FOR SELECT
    TO anon
    USING (true);

-- authenticated: 설정 조회
CREATE POLICY "auth_select_site_settings"
    ON public.site_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- authenticated: 설정 수정
CREATE POLICY "auth_update_site_settings"
    ON public.site_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
