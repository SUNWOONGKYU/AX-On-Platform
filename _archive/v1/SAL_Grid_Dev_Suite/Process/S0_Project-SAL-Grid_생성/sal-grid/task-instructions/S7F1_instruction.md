# S7F1: 404/500 에러 페이지 구현

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S7F1 |
| Task 이름 | 404/500 에러 페이지 구현 |
| Stage | S7 — 개발 5차 |
| Area | F — Frontend |
| Dependencies | S5F1 |
| 실행 방식 | Automated |
| Task Agent | frontend-developer-core |

## 배경 및 목적
사용자가 존재하지 않는 페이지에 접근하거나 서버 오류가 발생했을 때 사용자 친화적인 에러 페이지를 제공하여 사용성을 향상시킵니다. 기존 디자인 시스템을 활용하여 일관된 브랜드 경험을 유지합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S7_개발_5차/Frontend/pages/404.html` | 404 Not Found 에러 페이지 |
| `Process/S7_개발_5차/Frontend/pages/500.html` | 500 Internal Server Error 페이지 |
| `Process/S7_개발_5차/Frontend/css/error-pages.css` | 에러 페이지 스타일 |
| `Process/S7_개발_5차/Frontend/js/error-handler.js` | 에러 핸들링 로직 |

## 세부 작업 지시
1. 404 페이지 디자인 (기존 디자인 시스템 활용)
   - 헤더: "404 - 페이지를 찾을 수 없습니다"
   - 설명: 요청한 페이지가 존재하지 않음을 알리는 친화적인 메시지
   - 아이콘: SVG 기반 에러 아이콘 삽입
   - 반응형: 모바일 320px부터 지원

2. 500 페이지 디자인
   - 헤더: "500 - 서버 오류가 발생했습니다"
   - 설명: 서버 일시적 문제임을 명시하고 재시도 권유
   - 아이콘: 서버 오류를 표현하는 SVG 아이콘
   - 자동 새로고침: 선택적 자동 새로고침 버튼

3. 메인으로 돌아가기 버튼
   - Primary CTA: "홈으로 돌아가기" (href="/")
   - Secondary CTA: "이전 페이지로" (JavaScript history.back())
   - 버튼 스타일: 기존 디자인 시스템의 primary/secondary 스타일 적용

4. 반응형 적용
   - 모바일(≤576px): 세로 레이아웃, 패딩 16px
   - 태블릿(577-992px): 중간 레이아웃, 패딩 24px
   - 데스크톱(>992px): 가로 중앙 정렬, 패딩 32px
   - 최소 높이: 100vh (전체 뷰포트 높이)

## 완료 기준
- [ ] 404.html 파일 생성 및 마크업 완료
- [ ] 500.html 파일 생성 및 마크업 완료
- [ ] error-pages.css에서 반응형 스타일 적용
- [ ] error-handler.js에서 에러 핸들링 로직 구현
- [ ] 데스크톱/태블릿/모바일에서 시각적 테스트 완료
- [ ] 메인으로 돌아가기 버튼 동작 확인
- [ ] JSON 상태 업데이트 완료
