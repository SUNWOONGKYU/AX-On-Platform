# S5E1: AI 튜터 Edge Function 배포

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S5E1 |
| Task 이름 | AI 튜터 Edge Function 배포 |
| Stage | S5 — 개발 3차 |
| Area | E — External |
| Dependencies | S5S1 |
| 실행 방식 | AI-Only |
| Task Agent | backend-developer-core |

## 배경 및 목적

AI 튜터 챗봇의 백엔드 로직이 현재 키워드 기반 폴백(fallback)만으로 동작하고 있으며, 실제 LLM(Language Model)과 연동되지 않았다. S5S1에서 설정된 보안 정책을 바탕으로 Supabase Edge Function을 구현하여 Claude 또는 다른 LLM API와 연동한다. 사용자 질문을 받으면 Edge Function이 LLM으로 전달하고 응답을 반환한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `supabase/functions/ai-tutor/index.ts` | Edge Function 구현 |
| `pages/tutoring.js` | LLM 호출 로직 수정 |

## 세부 작업 지시

1. Supabase Edge Function을 생성한다:
   - 경로: `supabase/functions/ai-tutor/index.ts`
   - 사용자 쿼리를 입력받음
   - Claude API 또는 설정된 LLM과 통신
   - 응답을 반환

2. Edge Function 환경 변수 설정:
   - `ANTHROPIC_API_KEY` (또는 다른 LLM 제공자의 API 키)
   - LLM 모델명 (예: `claude-opus-4-6`)

3. `tutoring.js`에서 기존 키워드 기반 로직을 대체한다:
   - 기존: `getKeywordBasedAnswer(query)`
   - 신규: `fetch('/functions/v1/ai-tutor', { method: 'POST', body: JSON.stringify({ query }) })`

4. 에러 처리를 추가한다:
   - API 키 미설정 시 폴백 응답
   - 네트워크 오류 시 재시도 로직
   - API 할당량 초과 시 사용자 안내

5. 응답 시간 최적화 고려 (스트리밍 응답 사용 여부 판단)

## 완료 기준

- [ ] Supabase Edge Function 생성됨
- [ ] LLM API 연동 완료
- [ ] 환경 변수 설정 완료
- [ ] `tutoring.js` LLM 호출 로직 수정됨
- [ ] 사용자 질문 → LLM 응답 동작 확인
- [ ] 에러 처리 구현됨
- [ ] AI 튜터 챗봇이 실제 LLM 답변 반환
