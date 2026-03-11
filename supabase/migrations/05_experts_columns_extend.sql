-- @task S5D3
-- experts 테이블 컬럼 확장
-- expert-template.html이 참조하는 7개 컬럼 추가

ALTER TABLE experts ADD COLUMN IF NOT EXISTS description    TEXT;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS skills         TEXT[];
ALTER TABLE experts ADD COLUMN IF NOT EXISTS career_history JSONB;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS portfolio      JSONB;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS github_url     TEXT;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS linkedin_url   TEXT;
ALTER TABLE experts ADD COLUMN IF NOT EXISTS location       TEXT;
