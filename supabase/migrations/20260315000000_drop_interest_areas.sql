-- interest_areas 컬럼 삭제 (전문 분야와 중복, 더 이상 사용하지 않음)
ALTER TABLE ax_experts DROP COLUMN IF EXISTS interest_areas;
