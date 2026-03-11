// @task S5S1
// Vercel Serverless Function — 클라이언트에 Supabase 설정 제공
// service_role key는 절대 여기에 포함하지 않음

export default function handler(req, res) {
  // CORS 설정 — 자사 도메인만 허용
  const allowedOrigins = ['https://www.ax-on.net', 'https://ax-on-platform.vercel.app'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 캐시

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 환경 변수에서 값 읽기 (Vercel 대시보드에서 설정)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  res.status(200).json({
    supabaseUrl,
    supabaseAnonKey
  });
}
