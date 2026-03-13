-- ax_projects: schedule 필드 추가 + status 값 변경
-- 진행 상태: 협의중 → 계약 체결 완료 → AI 전문가 배정 → 진행 중 → 완료

ALTER TABLE ax_projects ADD COLUMN IF NOT EXISTS schedule TEXT;

-- status 기존값 'active' → '진행 중' 으로 마이그레이션
UPDATE ax_projects SET status = '협의중' WHERE status = 'active';

-- status 컬럼에 CHECK 제약 추가
ALTER TABLE ax_projects DROP CONSTRAINT IF EXISTS ax_projects_status_check;
ALTER TABLE ax_projects ADD CONSTRAINT ax_projects_status_check
  CHECK (status IN ('협의중', '계약 체결 완료', 'AI 전문가 배정', '진행 중', '완료'));

-- status 기본값 변경
ALTER TABLE ax_projects ALTER COLUMN status SET DEFAULT '협의중';
