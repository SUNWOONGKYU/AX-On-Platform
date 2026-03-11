// @task S5E1
// AX-On Platform — AI 튜터 Edge Function
// Supabase Edge Function: /functions/v1/ai-tutor
// Claude API(Anthropic)와 연동하여 사용자 질문에 LLM 응답 제공

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `당신은 AX-On Platform의 AI 튜터입니다.
AX-On은 AI 전문가, 시니어 AI 창업 교육, 기업 AX(AI Transformation) 프로젝트, 커뮤니티가 연결된 플랫폼입니다.

다음 역할을 수행합니다:
- AX-On Platform의 서비스(AI 전문가 매칭, 창업 교육, AX 프로젝트, 커뮤니티)를 안내
- AI 활용법, AX 전략, 창업 관련 질문에 친절하고 전문적으로 답변
- 한국어로 간결하고 실용적인 답변 제공

답변은 2-4문장으로 간결하게 작성하세요.`;

serve(async (req: Request) => {
  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { query, message } = await req.json();
    const userMessage = query || message;

    if (!userMessage || typeof userMessage !== 'string') {
      return new Response(JSON.stringify({ error: 'query 또는 message 필드가 필요합니다.' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      // API 키 미설정 시 폴백 응답
      return new Response(JSON.stringify({
        reply: 'AI 튜터 서비스가 준비 중입니다. 문의사항은 contact 페이지를 이용해 주세요.'
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const modelName = Deno.env.get('LLM_MODEL') || 'claude-haiku-4-5-20251001';

    // Claude API 호출 (최대 1회 재시도)
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 512,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessage }],
          }),
        });

        if (response.status === 429) {
          // API 할당량 초과
          return new Response(JSON.stringify({
            reply: '현재 AI 튜터 서비스 요청이 많습니다. 잠시 후 다시 시도해 주세요. 급한 문의는 contact 페이지를 이용해 주세요.'
          }), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Anthropic API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const reply = data.content?.[0]?.text || 'AX-On에 대해 궁금한 점이 있으시면 편하게 질문해 주세요!';

        return new Response(JSON.stringify({ reply }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        lastError = err as Error;
        if (attempt === 0) {
          // 첫 번째 시도 실패 시 재시도
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    // 재시도 후에도 실패 — 폴백 응답
    console.error('[ai-tutor] LLM 호출 실패:', lastError?.message);
    return new Response(JSON.stringify({
      reply: 'AI 튜터가 일시적으로 응답하지 못하고 있습니다. AX-On 플랫폼 관련 문의는 "AI", "프로젝트", "교육", "전문가" 등의 키워드로 질문해 주세요.'
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[ai-tutor] 요청 처리 오류:', err);
    return new Response(JSON.stringify({ error: '요청 처리 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
