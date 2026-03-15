-- INSERT ... RETURNING 을 위해 자기가 방금 넣은 행만 SELECT 가능
CREATE POLICY "anon_select_own_insert" ON public.ax_project_requests
  FOR SELECT
  TO anon
  USING (created_at > now() - interval '10 seconds');
