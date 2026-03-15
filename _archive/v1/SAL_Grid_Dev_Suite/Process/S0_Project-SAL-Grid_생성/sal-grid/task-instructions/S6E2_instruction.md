# S6E2: 문의 접수 담당자 알림

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6E2 |
| Task 이름 | 문의 접수 담당자 알림 |
| Stage | S6 — 개발 4차 |
| Area | E — External |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | backend-developer-core |

## 배경 및 목적

사용자가 문의 양식을 통해 접수할 때, 담당자(어드민)가 즉시 이를 인지할 수 있도록 이메일 또는 푸시 알림을 보내야 한다. Supabase Database Webhook 또는 Edge Function을 활용하여 새로운 문의가 접수되면 자동으로 담당자에게 알림을 전송한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/functions/contact-inquiry-notify/index.ts` | Edge Function 구현 |
| `supabase/migrations/XX_webhook_config.sql` | 웹훅 설정 |

## 세부 작업 지시

1. Supabase Edge Function 작성:
   - 함수 이름: `contact-inquiry-notify`
   - 트리거: `contact_inquiries` 테이블에 INSERT
   - 동작: 이메일 또는 푸시 알림 전송

2. Edge Function 구현 로직:
   - 웹훅 요청으로부터 새 문의 데이터 추출
   - 이메일 제목: `[새 문의] {문의자 이름} - {제목}`
   - 이메일 본문: 문의자 정보 및 문의 내용
   - 담당자 이메일로 발송

3. Supabase 웹훅 설정:
   - Supabase 콘솔 → Database → Extensions
   - `pg_net` 또는 `http` 확장 활성화
   - `contact_inquiries` 테이블에 대한 INSERT 트리거 생성

4. 이메일 서비스 선택:
   - SendGrid, Mailgun, AWS SES 등 이메일 API 사용
   - 또는 Supabase 제공 이메일 서비스

5. 에러 처리:
   - 알림 발송 실패 시 로그 기록
   - 재시도 메커니즘 (선택사항)

## 완료 기준

- [ ] Edge Function 생성됨
- [ ] Database Webhook 설정 완료
- [ ] 새 문의 접수 시 담당자 이메일 수신 확인
- [ ] 이메일 내용 정확성 확인
- [ ] 담당자 이메일 주소 올바르게 설정됨
- [ ] 에러 로그 기록됨
