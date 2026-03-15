# S5F3: OG 이미지/메타태그 도메인 수정

## Task 정보

| 항목 | 값 |
|------|---|
| Task ID | S5F3 |
| Task 이름 | OG 이미지/메타태그 도메인 수정 |
| Stage | S5 — 개발 3차 |
| Area | F — Frontend |
| Dependencies | - |
| 실행 방식 | AI-Only |
| Task Agent | frontend-developer-core |

## 배경 및 목적

프로젝트의 Open Graph(OG) 메타태그에서 도메인이 `axon-platform.com`으로 하드코딩되어 있으나, 실제 배포 도메인이 다르다. 소셜 미디어에서 게시글 공유 시 잘못된 도메인으로 미리보기가 표시되는 문제가 발생한다. 모든 HTML 파일의 OG 메타태그를 실제 배포 도메인으로 수정한다.

## 생성/수정 대상 파일

| 파일 경로 | 변경 내용 |
|----------|----------|
| `pages/*.html` | og:url, og:image 도메인을 실제 배포 도메인으로 수정 |
| `pages/config.js` | 배포 도메인 상수 추가 (동적 관리용) |

## 세부 작업 지시

1. 실제 배포 도메인을 확인한다 (예: `https://example.com`).

2. `config.js` 파일에 배포 도메인을 상수로 정의한다:
   ```javascript
   const DEPLOYMENT_DOMAIN = 'https://example.com';
   ```

3. 모든 HTML 파일에서 OG 메타태그를 수정한다:
   - `<meta property="og:url" content="https://axon-platform.com/...">`
   - → `<meta property="og:url" content="https://example.com/...">`
   - OG 이미지 경로도 함께 업데이트

4. JavaScript에서 OG 메타태그를 동적으로 생성하는 경우:
   - `config.js`에서 `DEPLOYMENT_DOMAIN` 참조하도록 수정

5. 각 페이지마다 og:url이 올바른 페이지 경로를 가리키도록 확인

## 완료 기준

- [ ] 배포 도메인 상수 정의됨
- [ ] 모든 HTML의 og:url 메타태그 수정됨
- [ ] 모든 HTML의 og:image 도메인 수정됨
- [ ] 각 페이지의 og:url이 올바른 페이지 경로를 가리킴
- [ ] 소셜 미디어 공유 테스트 완료
- [ ] 메타태그 검증 도구(예: Open Graph Debugger)로 확인됨
