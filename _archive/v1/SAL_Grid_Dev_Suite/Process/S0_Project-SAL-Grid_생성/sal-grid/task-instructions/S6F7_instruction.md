# S6F7: OG URL 메타태그 정비

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S6F7 |
| Task 이름 | OG URL 메타태그 정비 |
| Stage | S6 — 개발 4차 |
| Area | F — Frontend |
| Dependencies | S5F3 |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

S5F3에서 OG 메타태그의 도메인을 수정했으나, `og:url` 값이 각 페이지별로 일관성 있게 설정되지 않은 상태일 수 있다. 소셜 미디어 공유 시 정확한 URL이 전달되도록 모든 페이지의 `og:url` 메타태그를 정비하고 통일한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/*.html` | 모든 HTML의 og:url 메타태그 정비 |
| `pages/config.js` | URL 생성 유틸리티 함수 추가 |

## 세부 작업 지시

1. 각 페이지의 현재 `og:url` 메타태그 확인:
   - 정적 페이지: 고정 URL 확인
   - 동적 페이지: 현재 페이지 URL 확인

2. `config.js`에 URL 생성 함수 추가:
   ```javascript
   function getOGUrl(path = '') {
     return `${DEPLOYMENT_DOMAIN}${path}`;
   }
   ```

3. 모든 HTML 파일의 `og:url` 업데이트:
   - `og:url`은 해당 페이지의 절대 경로를 명시적으로 포함
   - 예: `/index.html` → `https://example.com/index.html`
   - 예: `/community.html` → `https://example.com/community.html`

4. 동적 페이지에서 `og:url` 동적 생성:
   - 게시글 상세 페이지: 게시글 ID를 포함한 URL
   - 사용자 프로필: 사용자 ID를 포함한 URL

5. Open Graph Debugger 등의 도구로 검증

## 완료 기준

- [ ] 모든 정적 페이지의 og:url 정비됨
- [ ] 동적 페이지의 og:url 함수 추가됨
- [ ] og:url과 실제 페이지 경로 일치 확인
- [ ] 소셜 미디어 공유 테스트 완료
- [ ] Open Graph Debugger에서 올바른 URL 표시됨
