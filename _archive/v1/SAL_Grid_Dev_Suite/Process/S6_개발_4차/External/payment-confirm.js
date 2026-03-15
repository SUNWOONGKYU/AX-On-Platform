// @task S6E1
// TossPayments 결제 확인 API (Vercel Serverless Function)
// 배포 경로: api/External/payment-confirm.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentKey, orderId, amount } = req.body;

  // 필수 파라미터 검증
  if (!paymentKey || !orderId || !amount) {
    return res.status(400).json({ error: 'paymentKey, orderId, amount는 필수입니다.' });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: '유효하지 않은 결제 금액입니다.' });
  }

  // 환경변수에서 Secret Key 가져오기
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    console.error('TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.');
    return res.status(500).json({ error: '서버 설정 오류입니다. 관리자에게 문의하세요.' });
  }

  try {
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentKey, orderId, amount })
    });

    const data = await response.json();

    if (!response.ok) {
      // TossPayments API 오류 응답 전달
      console.error('TossPayments 결제 확인 실패:', data);
      return res.status(response.status).json(data);
    }

    // 결제 확인 성공
    return res.status(200).json(data);
  } catch (err) {
    console.error('결제 확인 요청 오류:', err);
    return res.status(500).json({ error: 'Payment confirmation failed' });
  }
}
