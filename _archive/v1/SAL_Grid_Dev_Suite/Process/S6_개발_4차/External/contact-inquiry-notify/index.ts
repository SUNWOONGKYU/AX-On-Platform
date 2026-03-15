// @task S6E2 — 문의 접수 담당자 알림 Edge Function
// @area E | @stage S6

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "admin@ax-on.net";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("NOTIFICATION_FROM_EMAIL") || "noreply@ax-on.net";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT";
  table: "contact_inquiries";
  record: ContactInquiry;
  schema: "public";
}

serve(async (req: Request) => {
  try {
    // CORS 처리
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload: WebhookPayload = await req.json();
    const inquiry = payload.record;

    if (!inquiry || !inquiry.name || !inquiry.message) {
      return new Response(
        JSON.stringify({ error: "Invalid inquiry data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const subject = `[새 문의] ${inquiry.name} - ${inquiry.subject || "제목 없음"}`;
    const createdDate = new Date(inquiry.created_at).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });

    const emailBody = `
새로운 문의가 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
문의 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

문의자: ${inquiry.name}
이메일: ${inquiry.email}
연락처: ${inquiry.phone || "미입력"}
제목: ${inquiry.subject || "미입력"}
접수일: ${createdDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
문의 내용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${inquiry.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AX-On Platform 관리자 알림
    `.trim();

    // SendGrid API로 이메일 발송
    if (SENDGRID_API_KEY) {
      const sendgridResponse = await fetch(
        "https://api.sendgrid.com/v3/mail/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: ADMIN_EMAIL }] }],
            from: { email: FROM_EMAIL, name: "AX-On Platform" },
            subject: subject,
            content: [{ type: "text/plain", value: emailBody }],
          }),
        }
      );

      if (!sendgridResponse.ok) {
        const errText = await sendgridResponse.text();
        console.error("SendGrid 발송 실패:", errText);
        // 실패해도 200 반환 (webhook 재시도 방지)
        return new Response(
          JSON.stringify({
            success: false,
            error: "Email delivery failed",
            logged: true,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      // SendGrid 키 없으면 로그만 기록
      console.log("=== 문의 접수 알림 (이메일 미설정) ===");
      console.log("수신자:", ADMIN_EMAIL);
      console.log("제목:", subject);
      console.log("내용:", emailBody);
      console.log("=====================================");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge Function 오류:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", logged: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
});
