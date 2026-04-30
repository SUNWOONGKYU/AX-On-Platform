# AX-On E2E 스모크 테스트

SAL-DA S2RL1 카드 개선 산출물 (CLAUDE.md UI 검증 철칙 준수).

## 설치

```
npm i -D @playwright/test
npx playwright install chromium
```

## 실행

```
# 프로덕션 검증
npx playwright test --config=e2e/playwright.config.js

# 로컬/스테이징 검증
BASE_URL=http://localhost:3000 npx playwright test --config=e2e/playwright.config.js
```

## 커버 시나리오

| 영역 | 검증 |
|---|---|
| 8 페이지 200 + 콘텐츠 | index, about-ax, engagement, methodology, pool, community, contact, privacy, terms |
| 네비 4메뉴 클릭 | AX란 / 인게이지먼트 / 방법론 / 전문가 풀 → 올바른 라우트 |
| Dead-link 차단 | 랜딩의 모든 CTA가 유효 href 보유 |
| Contact 폼 | 입력 → 제출 버튼 활성화 (실제 전송은 안 함) |

## CI 통합 권고

`.github/workflows/e2e.yml`로 PR마다 실행. 실패 시 머지 차단.
