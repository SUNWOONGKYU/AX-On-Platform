-- ax_experts: 익명 사용자도 전문가 목록 조회 가능 (전문가 풀 공개, 메인 카운트)
DROP POLICY IF EXISTS "anon can view experts" ON ax_experts;
CREATE POLICY "anon can view experts" ON ax_experts
  FOR SELECT USING (true);