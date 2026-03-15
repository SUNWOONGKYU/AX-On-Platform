// @task S5S1
// @description Vercel serverless function — 환경변수를 클라이언트에 안전하게 전달
// @area Security
// @stage S5

/**
 * GET /api/env-config
 *
 * Vercel 대시보드에 설정된 환경변수를 읽어 클라이언트에 JSON으로 반환합니다.
 * 민감한 서버 전용 키(SERVICE_ROLE_KEY 등)는 절대 포함하지 않습니다.
 *
 * 캐시 정책:
 *   - s-maxage=3600: CDN 엣지 캐시 1시간 (배포 후 값이 자주 바뀌지 않으므로)
 *   - stale-while-revalidate=60: 60초 동안 백그라운드 갱신 허용
 *
 * 보안 주의사항:
 *   - SUPABASE_ANON_KEY는 공개 허용 키(anon)이므로 클라이언트 노출 가능
 *   - SUPABASE_SERVICE_ROLE_KEY 등 서버 전용 키는 이 함수에 절대 포함하지 말 것
 */
export default function handler(req, res) {
  // CORS — 동일 출처 또는 Vercel 프리뷰 도메인 허용
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=60');

  res.status(200).json({
    SUPABASE_URL:      process.env.SUPABASE_URL      || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  });
}
