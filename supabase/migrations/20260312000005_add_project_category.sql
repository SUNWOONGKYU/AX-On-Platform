-- ============================================================
-- 프로젝트 게시판 + 태그 기능 지원
-- ============================================================

-- 1. ax_posts category에 'project' 추가
ALTER TABLE ax_posts DROP CONSTRAINT IF EXISTS ax_posts_category_check;
ALTER TABLE ax_posts ADD CONSTRAINT ax_posts_category_check
    CHECK (category IN ('notice','reference','discussion','knowledge','project'));

-- 2. ax_projects 테이블 (프로젝트 목록)
CREATE TABLE IF NOT EXISTS ax_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
    assigned_experts TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ax_projects_status ON ax_projects (status);

ALTER TABLE ax_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ax_projects_select" ON ax_projects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "ax_projects_insert" ON ax_projects
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- 3. ax_posts에 project_id, tags 컬럼 추가
ALTER TABLE ax_posts ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES ax_projects(id) ON DELETE SET NULL;
ALTER TABLE ax_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_ax_posts_project_id ON ax_posts (project_id);
