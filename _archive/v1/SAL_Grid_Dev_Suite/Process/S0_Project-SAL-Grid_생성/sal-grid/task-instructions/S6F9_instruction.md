# S6F9: AI 튜터 챗봇 전 페이지 확대

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F9 |
| Task 이름 | AI 튜터 챗봇 전 페이지 확대 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | S5E1 |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

AI 튜터 챗봇은 현재 홈페이지(`index.html`)에만 포함되어 있다. 사용자가 다른 페이지에서도 언제든지 AI 튜터에 질문할 수 있도록 모든 페이지에 챗봇 위젯을 추가한다. S5E1에서 구현된 Edge Function을 활용하여 전체 페이지에서 챗봇 기능이 동작하도록 확대한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/components/chatbot-widget.js` | 챗봇 위젯 공유 컴포넌트 추출 |
| `pages/*.html` | 모든 페이지에 챗봇 위젯 추가 |

## 세부 작업 지시

1. 현재 `index.html`의 AI 튜터 챗봇 코드 분석:
   - HTML 마크업 추출
   - JavaScript 로직 분리
   - CSS 스타일 확인

2. 챗봇 위젯 컴포넌트 작성 (`chatbot-widget.js`):
   - 재사용 가능한 함수로 캡슐화
   - `initChatbot()` 함수로 위젯 초기화
   - 페이지별 고유 구성 가능하도록 설정

3. 모든 HTML 파일에 챗봇 추가:
   - 페이지 하단에 챗봇 위젯 HTML 추가
   - `<script src="components/chatbot-widget.js"></script>` 추가
   - `initChatbot()` 호출

4. 챗봇 위젯 스타일 개선:
   - 화면 우측 하단 고정 위치
   - 모바일 친화적 디자인
   - 화면 크기에 따라 반응형 조정

5. 성능 최적화:
   - 지연 로딩 (페이지 로드 후 로드)
   - 중복 요청 방지

## 완료 기준

- [ ] `chatbot-widget.js` 컴포넌트 생성됨
- [ ] 모든 HTML에 챗봇 위젯 추가됨
- [ ] 챗봇 초기화 함수 호출됨
- [ ] 모든 페이지에서 챗봇 동작 확인
- [ ] 모바일 반응형 디자인 적용
- [ ] 성능 저하 없음 확인
