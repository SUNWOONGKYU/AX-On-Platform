# S8T1: E2E 테스트 핵심 시나리오 작성

## Task 정보
| 항목 | 값 |
|------|---|
| Task ID | S8T1 |
| Task 이름 | E2E 테스트 핵심 시나리오 작성 |
| Stage | S8 — 개발 6차 |
| Area | T — Testing |
| Dependencies | S7F2, S7F3 |
| 실행 방식 | Automated |
| Task Agent | test-runner-core |

## 배경 및 목적
사용자의 핵심 워크플로우(로그인, 수강신청, 게시판 CRUD)를 자동으로 테스트하여 배포 전 기능 정상 작동을 보장합니다. E2E 테스트 자동화로 버그를 조기에 발견하고 회귀 테스트 비용을 절감합니다.

## 생성/수정 대상 파일
| 파일 경로 | 변경 내용 |
|----------|----------|
| `Process/S8_개발_6차/Frontend/tests/e2e/playwright.config.js` | Playwright 설정 |
| `Process/S8_개발_6차/Frontend/tests/e2e/auth.spec.js` | 로그인 시나리오 |
| `Process/S8_개발_6차/Frontend/tests/e2e/enrollment.spec.js` | 수강신청 시나리오 |
| `Process/S8_개발_6차/Frontend/tests/e2e/community.spec.js` | 게시판 시나리오 |
| `Process/S8_개발_6차/Frontend/tests/e2e/utils/test-helpers.js` | 테스트 유틸 함수 |

## 세부 작업 지시
1. Playwright 설정
   - 파일: `playwright.config.js`
   - 설정:
     ```javascript
     // playwright.config.js
     export default {
       testDir: './tests/e2e',
       fullyParallel: true,
       forbidOnly: !!process.env.CI,
       retries: process.env.CI ? 2 : 0,
       workers: process.env.CI ? 1 : undefined,
       reporter: 'html',
       use: {
         baseURL: process.env.BASE_URL || 'http://localhost:5173',
         trace: 'on-first-retry',
         screenshot: 'only-on-failure',
       },
       webServer: {
         command: 'npm run dev',
         url: 'http://localhost:5173',
         reuseExistingServer: !process.env.CI,
       },
     };
     ```
   - package.json 스크립트:
     ```json
     {
       "scripts": {
         "test:e2e": "playwright test",
         "test:e2e:ui": "playwright test --ui",
         "test:e2e:headed": "playwright test --headed"
       }
     }
     ```

2. 로그인 시나리오
   - 파일: `auth.spec.js`
   - 시나리오:
     ```javascript
     // auth.spec.js
     import { test, expect } from '@playwright/test';
     import { login, logout } from './utils/test-helpers';

     test.describe('Authentication', () => {
       test('Google 로그인 플로우', async ({ page }) => {
         await page.goto('/');
         await page.click('[data-testid="login-button"]');

         // 로그인 폼 표시 확인
         await expect(page).toHaveURL(/\/auth\/login/);

         // Google 로그인 (Supabase mock 필요)
         await page.click('[data-testid="google-login-btn"]');

         // 리다이렉트 및 로그인 확인
         await page.waitForURL('/');
         const userMenu = page.locator('[data-testid="user-menu"]');
         await expect(userMenu).toBeVisible();
       });

       test('Kakao 로그인 플로우', async ({ page }) => {
         await page.goto('/auth/login');
         await page.click('[data-testid="kakao-login-btn"]');

         // Kakao 로그인 처리
         // (OAuth 테스트는 환경 설정 필요)

         await page.waitForURL('/');
         await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
       });

       test('이메일/비밀번호 로그인', async ({ page }) => {
         await page.goto('/auth/login');

         // 이메일 입력
         await page.fill('[data-testid="email-input"]', 'test@example.com');

         // 비밀번호 입력
         await page.fill('[data-testid="password-input"]', 'TestPassword123!');

         // 로그인 버튼 클릭
         await page.click('[data-testid="login-submit"]');

         // 로그인 성공 확인
         await page.waitForURL('/');
         await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
       });

       test('로그아웃', async ({ page }) => {
         await login(page, 'test@example.com', 'TestPassword123!');

         // 로그아웃 버튼 클릭
         await page.click('[data-testid="user-menu"]');
         await page.click('[data-testid="logout-btn"]');

         // 로그아웃 확인
         await page.waitForURL('/');
         await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
       });

       test('비밀번호 재설정', async ({ page }) => {
         await page.goto('/auth/forgot-password');

         // 이메일 입력
         await page.fill('[data-testid="email-input"]', 'test@example.com');
         await page.click('[data-testid="submit-btn"]');

         // 확인 메시지 확인
         await expect(page.locator('[data-testid="confirm-message"]')).toBeVisible();
       });
     });
     ```

3. 수강신청 시나리오
   - 파일: `enrollment.spec.js`
   - 시나리오:
     ```javascript
     // enrollment.spec.js
     import { test, expect } from '@playwright/test';
     import { login } from './utils/test-helpers';

     test.describe('Course Enrollment', () => {
       test.beforeEach(async ({ page }) => {
         await login(page, 'test@example.com', 'TestPassword123!');
       });

       test('강의 목록 조회', async ({ page }) => {
         await page.goto('/courses');

         // 강의 카드 표시 확인
         const courseCards = page.locator('[data-testid="course-card"]');
         await expect(courseCards.first()).toBeVisible();

         // 페이지네이션 확인
         const pagination = page.locator('[data-testid="pagination"]');
         await expect(pagination).toBeVisible();
       });

       test('강의 상세 페이지', async ({ page }) => {
         await page.goto('/courses');

         // 첫 번째 강의 클릭
         await page.click('[data-testid="course-card"] >> nth=0');

         // 상세 정보 확인
         await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
         await expect(page.locator('[data-testid="course-description"]')).toBeVisible();
         await expect(page.locator('[data-testid="instructor-name"]')).toBeVisible();
       });

       test('수강신청', async ({ page }) => {
         await page.goto('/courses');

         // 첫 번째 강의로 이동
         await page.click('[data-testid="course-card"] >> nth=0');

         // 수강신청 버튼 클릭
         await page.click('[data-testid="enroll-button"]');

         // 확인 모달 확인
         await expect(page.locator('[data-testid="enroll-confirm-modal"]')).toBeVisible();

         // 최종 확인 클릭
         await page.click('[data-testid="confirm-enroll-btn"]');

         // 성공 메시지 확인
         await expect(page.locator('[data-testid="success-message"]')).toContainText('수강신청');
       });

       test('내 강의 목록 조회', async ({ page }) => {
         await page.goto('/mypage');

         // 활동 탭 > 수강 내역 클릭
         await page.click('[data-testid="activity-tab"]');
         await page.click('[data-testid="enrollment-history-tab"]');

         // 수강 중인 강의 표시 확인
         const enrolledCourses = page.locator('[data-testid="enrolled-course"]');
         const count = await enrolledCourses.count();
         expect(count).toBeGreaterThan(0);
       });
     });
     ```

4. 게시판 CRUD 시나리오
   - 파일: `community.spec.js`
   - 시나리오:
     ```javascript
     // community.spec.js
     import { test, expect } from '@playwright/test';
     import { login } from './utils/test-helpers';

     test.describe('Community Posts', () => {
       test.beforeEach(async ({ page }) => {
         await login(page, 'test@example.com', 'TestPassword123!');
       });

       test('게시글 목록 조회', async ({ page }) => {
         await page.goto('/community');

         // 게시글 카드 표시 확인
         const posts = page.locator('[data-testid="post-card"]');
         await expect(posts.first()).toBeVisible();

         // 카테고리 필터링
         await page.click('[data-testid="category-filter"]');
         await page.click('[data-testid="category-option"]');

         // 필터링된 결과 확인
         await expect(posts.first()).toBeVisible();
       });

       test('게시글 작성', async ({ page }) => {
         await page.goto('/community');

         // 작성 버튼 클릭
         await page.click('[data-testid="create-post-btn"]');

         // 작성 폼 표시 확인
         await expect(page.locator('[data-testid="post-form"]')).toBeVisible();

         // 제목 입력
         const titleInput = page.locator('[data-testid="title-input"]');
         await titleInput.fill('테스트 게시글 제목');

         // 내용 입력
         const contentInput = page.locator('[data-testid="content-input"]');
         await contentInput.fill('테스트 게시글 내용입니다.');

         // 카테고리 선택
         await page.click('[data-testid="category-select"]');
         await page.click('[data-testid="category-option"]');

         // 태그 추가
         const tagInput = page.locator('[data-testid="tag-input"]');
         await tagInput.fill('테스트 ');
         await page.press('[data-testid="tag-input"]', 'Enter');

         // 발행 버튼 클릭
         await page.click('[data-testid="publish-btn"]');

         // 성공 메시지 확인
         await expect(page.locator('[data-testid="success-message"]')).toContainText('작성되었습니다');

         // 작성한 게시글 확인
         await page.waitForURL(/\/community\/\d+/);
         await expect(page.locator('[data-testid="post-title"]')).toContainText('테스트 게시글 제목');
       });

       test('게시글 상세 조회', async ({ page }) => {
         await page.goto('/community');

         // 첫 번째 게시글 클릭
         await page.click('[data-testid="post-card"] >> nth=0');

         // 상세 정보 확인
         await expect(page.locator('[data-testid="post-title"]')).toBeVisible();
         await expect(page.locator('[data-testid="post-content"]')).toBeVisible();
         await expect(page.locator('[data-testid="post-author"]')).toBeVisible();

         // 댓글 섹션 확인
         await expect(page.locator('[data-testid="comments-section"]')).toBeVisible();
       });

       test('댓글 작성', async ({ page }) => {
         await page.goto('/community');
         await page.click('[data-testid="post-card"] >> nth=0');

         // 댓글 입력
         const commentInput = page.locator('[data-testid="comment-input"]');
         await commentInput.fill('좋은 게시글입니다!');

         // 댓글 발송
         await page.click('[data-testid="comment-submit"]');

         // 댓글 표시 확인
         await expect(page.locator('[data-testid="comment"]')).toContainText('좋은 게시글입니다!');
       });

       test('게시글 수정', async ({ page }) => {
         // (사용자가 작성한 게시글 전제)
         await page.goto('/community');

         // 내 게시글 필터링 또는 직접 접근
         await page.click('[data-testid="my-posts-btn"]');

         // 편집 버튼 클릭
         await page.click('[data-testid="edit-btn"]');

         // 제목 수정
         const titleInput = page.locator('[data-testid="title-input"]');
         await titleInput.fill('수정된 제목');

         // 저장
         await page.click('[data-testid="save-btn"]');

         // 수정 확인
         await expect(page.locator('[data-testid="post-title"]')).toContainText('수정된 제목');
       });

       test('게시글 삭제', async ({ page }) => {
         await page.goto('/community');
         await page.click('[data-testid="my-posts-btn"]');

         // 게시글 수 기록
         const initialCount = await page.locator('[data-testid="post-card"]').count();

         // 삭제 버튼 클릭
         await page.click('[data-testid="delete-btn"]');

         // 삭제 확인 모달
         await expect(page.locator('[data-testid="delete-confirm-modal"]')).toBeVisible();
         await page.click('[data-testid="confirm-delete-btn"]');

         // 삭제 확인
         const finalCount = await page.locator('[data-testid="post-card"]').count();
         expect(finalCount).toBe(initialCount - 1);
       });
     });
     ```

## 완료 기준
- [ ] Playwright 설치 및 설정 (playwright.config.js)
- [ ] test-helpers.js 유틸 함수 구현 (login, logout 등)
- [ ] auth.spec.js 로그인 시나리오 작성
- [ ] enrollment.spec.js 수강신청 시나리오 작성
- [ ] community.spec.js 게시판 CRUD 시나리오 작성
- [ ] 모든 페이지에 data-testid 속성 추가
- [ ] 로컬에서 npm run test:e2e 실행 및 성공 확인
- [ ] test:e2e:ui로 테스트 디버깅 확인
- [ ] GitHub Actions에서 CI/CD 설정 및 자동 실행
- [ ] 실패한 테스트의 스크린샷 및 비디오 생성 확인
- [ ] 전체 E2E 테스트 suite 실행 시간 < 5분 확인
- [ ] JSON 상태 업데이트 완료
