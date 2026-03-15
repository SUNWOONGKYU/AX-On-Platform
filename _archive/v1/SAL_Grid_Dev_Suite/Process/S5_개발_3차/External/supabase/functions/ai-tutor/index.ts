// @task S5E1
// AI 튜터 Edge Function - Anthropic Claude API 연동
// AX-On Platform: 시니어 AI 창업 교육 및 기업 AX 프로젝트 지원

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─── CORS 헤더 설정 ──────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── 키워드 기반 폴백 응답 데이터 ────────────────────────────────────────────
interface FallbackEntry {
  keywords: string[];
  reply: string;
}

const fallbackResponses: FallbackEntry[] = [
  {
    keywords: ["ax-on", "ax on", "플랫폼", "서비스", "소개"],
    reply:
      "AX-On Platform은 시니어 AI 창업 교육과 기업 AX(AI Transformation) 프로젝트를 지원하는 종합 플랫폼입니다. 전문가 매칭, 커뮤니티, AI 학습 콘텐츠 등 다양한 기능을 제공합니다.",
  },
  {
    keywords: ["창업", "스타트업", "비즈니스", "사업"],
    reply:
      "AX-On에서는 시니어 창업가를 위한 AI 기반 창업 교육 프로그램을 제공합니다. 비즈니스 모델 수립부터 투자 유치까지 단계별로 도움을 드릴 수 있습니다. 구체적으로 어떤 단계에 대해 알고 싶으신가요?",
  },
  {
    keywords: ["ax", "ai 전환", "디지털 전환", "ai 도입", "자동화"],
    reply:
      "기업 AX(AI Transformation)는 비즈니스 프로세스에 AI를 도입하여 경쟁력을 강화하는 과정입니다. AX-On에서는 기업 맞춤형 AX 컨설팅과 전문가 매칭 서비스를 제공합니다.",
  },
  {
    keywords: ["전문가", "멘토", "컨설팅", "매칭"],
    reply:
      "AX-On의 전문가 매칭 서비스를 통해 AI·창업·경영 분야 전문가와 연결될 수 있습니다. 전문가 검색 페이지에서 분야별, 경력별로 전문가를 찾아보세요.",
  },
  {
    keywords: ["커뮤니티", "포럼", "게시판", "네트워킹"],
    reply:
      "AX-On 커뮤니티에서 같은 관심사를 가진 시니어 창업가, 기업인들과 교류할 수 있습니다. 경험 공유, 협업 기회, 최신 AI 트렌드 정보를 얻어보세요.",
  },
  {
    keywords: ["교육", "강의", "학습", "과정", "커리큘럼"],
    reply:
      "AX-On 교육 콘텐츠는 AI 기초부터 실전 적용까지 다양한 레벨로 구성되어 있습니다. 시니어 눈높이에 맞춘 체계적인 커리큘럼으로 AI 역량을 키워드릴 수 있습니다.",
  },
  {
    keywords: ["로그인", "회원가입", "계정", "인증"],
    reply:
      "AX-On 플랫폼은 Google 계정으로 간편하게 로그인할 수 있습니다. 회원가입 후 프로필을 설정하면 맞춤형 교육 콘텐츠와 전문가 매칭 서비스를 이용하실 수 있습니다.",
  },
  {
    keywords: ["ai", "인공지능", "머신러닝", "딥러닝", "gpt", "llm"],
    reply:
      "AI(인공지능)는 현재 비즈니스 혁신의 핵심 기술입니다. AX-On에서는 AI 트렌드, 활용 사례, 도입 방법론에 대한 전문적인 교육과 컨설팅을 제공합니다. 어떤 AI 주제에 관심이 있으신가요?",
  },
  {
    keywords: ["투자", "펀딩", "vc", "엔젤"],
    reply:
      "AX-On 플랫폼에서는 시니어 창업가를 위한 투자 유치 준비 교육과 IR 피칭 가이드를 제공합니다. 전문가 멘토링을 통해 투자자 미팅 준비를 도와드릴 수 있습니다.",
  },
  {
    keywords: ["사용법", "이용방법", "how", "방법", "가이드"],
    reply:
      "AX-On 플랫폼 이용 방법: 1) Google 계정으로 로그인 → 2) 프로필 설정 → 3) 관심 분야 선택 → 4) 교육 콘텐츠 및 전문가 매칭 이용. 더 자세한 내용은 도움말 페이지를 참고하세요.",
  },
];

// ─── 키워드 기반 폴백 함수 ────────────────────────────────────────────────────
function getFallbackReply(query: string): string {
  const lowerQuery = query.toLowerCase();

  for (const entry of fallbackResponses) {
    if (entry.keywords.some((keyword) => lowerQuery.includes(keyword))) {
      return entry.reply;
    }
  }

  return "안녕하세요! AX-On Platform AI 튜터입니다. 시니어 AI 창업 교육, 기업 AX 프로젝트, 전문가 매칭, 커뮤니티 등에 대해 도움을 드릴 수 있습니다. 궁금하신 점을 편하게 질문해 주세요.";
}

// ─── 응답 타입 정의 ───────────────────────────────────────────────────────────
interface TutorResponse {
  reply: string;
  source: "llm" | "fallback";
  error?: string;
}

// ─── 메인 핸들러 ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // OPTIONS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // POST 요청만 허용
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 요청 본문 파싱
    const body = await req.json();
    const query: string = body?.query || body?.message || "";

    if (!query || query.trim() === "") {
      return new Response(
        JSON.stringify({ error: "query 파라미터가 필요합니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ANTHROPIC_API_KEY 확인
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicApiKey) {
      // API 키 미설정 → 키워드 기반 폴백
      console.warn("[AI Tutor] ANTHROPIC_API_KEY가 설정되지 않았습니다. 폴백 모드로 동작합니다.");
      const fallbackReply = getFallbackReply(query);
      const response: TutorResponse = {
        reply: fallbackReply,
        source: "fallback",
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Anthropic Claude API 호출 ───────────────────────────────────────────
    let llmResponse: Response;

    try {
      llmResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system:
            "AX-On Platform AI 튜터입니다. 시니어 AI 창업 교육과 기업 AX 프로젝트에 대해 도움을 드립니다. 한국어로 친절하고 이해하기 쉽게 답변해 주세요. 전문 용어는 쉬운 말로 풀어서 설명하고, 실용적인 정보를 제공하세요.",
          messages: [{ role: "user", content: query }],
        }),
      });
    } catch (fetchError) {
      // 네트워크 오류 → 폴백
      console.error("[AI Tutor] Anthropic API 네트워크 오류:", fetchError);
      const fallbackReply = getFallbackReply(query);
      const response: TutorResponse = {
        reply: fallbackReply,
        source: "fallback",
        error: "API 연결 오류로 기본 응답을 제공합니다.",
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit 처리 (429)
    if (llmResponse.status === 429) {
      console.warn("[AI Tutor] Rate limit 도달");
      const response: TutorResponse = {
        reply:
          "현재 AI 튜터 사용량이 많아 잠시 후 다시 시도해 주세요. 보통 1-2분 후에 정상 이용 가능합니다.",
        source: "fallback",
        error: "Rate limit exceeded. 잠시 후 다시 시도해 주세요.",
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // API 오류 처리
    if (!llmResponse.ok) {
      const errorBody = await llmResponse.text();
      console.error(
        `[AI Tutor] Anthropic API 오류 ${llmResponse.status}:`,
        errorBody
      );
      const fallbackReply = getFallbackReply(query);
      const response: TutorResponse = {
        reply: fallbackReply,
        source: "fallback",
        error: `API 오류 (${llmResponse.status}). 기본 응답을 제공합니다.`,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // LLM 응답 파싱
    const llmData = await llmResponse.json();
    const llmReply: string =
      llmData?.content?.[0]?.text || getFallbackReply(query);

    const response: TutorResponse = {
      reply: llmReply,
      source: "llm",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // 예상치 못한 오류 처리
    console.error("[AI Tutor] 예상치 못한 오류:", error);
    const response: TutorResponse = {
      reply: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
