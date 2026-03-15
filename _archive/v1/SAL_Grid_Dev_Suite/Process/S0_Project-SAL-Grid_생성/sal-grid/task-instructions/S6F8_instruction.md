# S6F8: CSS 공유 파일 분리

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F8 |
| Task 이름 | CSS 공유 파일 분리 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

현재 HTML 파일들에 인라인 스타일(`<style>` 태그)이 분산되어 있어 스타일 관리 및 유지보수가 어렵다. 공통으로 사용되는 스타일을 별도의 CSS 파일로 분리하여 중복을 제거하고 코드 재사용성을 높인다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `assets/css/shared.css` | 공유 스타일 (버튼, 폼, 카드 등) |
| `assets/css/layouts.css` | 레이아웃 스타일 (그리드, 플렉스 등) |
| `pages/*.html` | 인라인 style 제거, 외부 CSS 링크 추가 |

## 세부 작업 지시

1. 현재 인라인 스타일 분석:
   - 각 HTML 파일의 `<style>` 태그 내용 검토
   - 공통 스타일 식별 (버튼, 입력 필드, 카드 등)
   - 페이지별 고유 스타일 식별

2. 공유 CSS 파일 생성:
   - `shared.css`: 버튼, 폼 요소, 카드, 테이블 스타일
   - `layouts.css`: 그리드, 플렉스, 반응형 스타일
   - `colors.css`: 컬러 팔레트 및 테마 변수 (선택사항)

3. 각 HTML에서 인라인 스타일 제거 및 링크 추가:
   ```html
   <link rel="stylesheet" href="../assets/css/shared.css">
   <link rel="stylesheet" href="../assets/css/layouts.css">
   ```

4. 페이지별 고유 스타일은 유지하되, 클래스 기반으로 재구성

5. CSS 검증:
   - 모든 스타일이 제대로 적용되는지 확인
   - 반응형 디자인 테스트

## 완료 기준

- [ ] `shared.css` 생성됨
- [ ] `layouts.css` 생성됨
- [ ] 모든 HTML에서 인라인 스타일 제거됨
- [ ] 외부 CSS 링크 추가됨
- [ ] 모든 페이지 스타일 정상 적용됨
- [ ] 스타일 중복 제거됨
- [ ] 반응형 디자인 유지됨
