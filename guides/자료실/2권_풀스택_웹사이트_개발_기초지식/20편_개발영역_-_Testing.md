# 20편 | 개발 영역 - Testing (테스트)

---

코드가 제대로 작동하는지 검증하는 영역, **Testing**입니다. 버그를 사전에 발견하고, 리팩토링에 자신감을 갖게 해주는 안전망입니다.

---

## 테스트의 종류

### 테스트 피라미드

```
        △ E2E 테스트 (적음)
       ╱ ╲   - 실제 사용자 시나리오
      ╱   ╲  - 느리고 비용 높음
     ╱     ╲
    ╱ 통합 테스트 (중간)
   ╱         ╲ - 여러 모듈 연결
  ╱           ╲ - 중간 속도
 ╱ 단위 테스트 (많음)
╱               ╲ - 함수/컴포넌트 단위
━━━━━━━━━━━━━━━━━ - 빠르고 저렴
```

| 종류 | 대상 | 속도 | 비용 |
|-----|------|------|------|
| 단위 테스트 | 함수, 컴포넌트 | 빠름 | 낮음 |
| 통합 테스트 | API, DB 연동 | 중간 | 중간 |
| E2E 테스트 | 전체 시나리오 | 느림 | 높음 |

---

## 20.1 Language (언어)

### JavaScript & TypeScript

테스트 코드도 동일한 언어로 작성합니다.

```typescript
// 테스트 코드 예시
import { add } from './math';

test('1 + 2 = 3', () => {
    expect(add(1, 2)).toBe(3);
});
```

---

## 20.2 Runtime (실행 환경)

### Node.js

테스트는 Node.js 환경에서 실행됩니다.

```bash
# Jest 실행
npm test

# 특정 파일만 테스트
npm test -- auth.test.ts
```

---

## 20.3 Package Manager (패키지 관리자)

### npm

테스트 도구를 설치합니다.

```bash
npm install -D jest @types/jest ts-jest
npm install -D playwright @playwright/test
```

**package.json 스크립트:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  }
}
```

---

## 20.4 Tools (도구)

Testing 영역에서는 별도의 도구를 사용하지 않습니다. Jest와 Playwright가 CLI 도구를 제공합니다.

---

## 20.5 Library (라이브러리)

### Jest

JavaScript 테스트 프레임워크입니다.

**설치:**
```bash
npm install -D jest @types/jest ts-jest
```

**설정 (jest.config.js):**
```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
};
```

**기본 문법:**

```typescript
// describe: 테스트 그룹
describe('Math functions', () => {

    // test 또는 it: 개별 테스트
    test('add function works', () => {
        expect(add(1, 2)).toBe(3);
    });

    it('subtract function works', () => {
        expect(subtract(5, 3)).toBe(2);
    });
});
```

**매처(Matcher):**

```typescript
// 값 비교
expect(value).toBe(3);           // 정확히 같음
expect(value).toEqual({ a: 1 }); // 객체 내용 같음
expect(value).not.toBe(5);       // 같지 않음

// 타입 확인
expect(value).toBeNull();
expect(value).toBeDefined();
expect(value).toBeTruthy();

// 숫자
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(10);

// 문자열
expect(str).toMatch(/hello/);

// 배열
expect(array).toContain('item');

// 에러
expect(() => func()).toThrow();
expect(() => func()).toThrow('error message');
```

**비동기 테스트:**

```typescript
// async/await
test('fetches user data', async () => {
    const user = await fetchUser(1);
    expect(user.name).toBe('홍길동');
});

// Promise
test('fetches user data', () => {
    return fetchUser(1).then(user => {
        expect(user.name).toBe('홍길동');
    });
});
```

**Mock:**

```typescript
// 함수 모킹
const mockFn = jest.fn();
mockFn.mockReturnValue(42);
expect(mockFn()).toBe(42);

// 모듈 모킹
jest.mock('./api', () => ({
    fetchUser: jest.fn().mockResolvedValue({ name: '홍길동' }),
}));
```

### Playwright

E2E(End-to-End) 테스트 도구입니다.

**설치:**
```bash
npm install -D @playwright/test
npx playwright install  # 브라우저 설치
```

**설정 (playwright.config.ts):**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    use: {
        baseURL: 'http://localhost:3000',
    },
});
```

**테스트 작성:**

```typescript
import { test, expect } from '@playwright/test';

test('로그인 페이지 테스트', async ({ page }) => {
    // 페이지 이동
    await page.goto('/login');

    // 요소 찾기 및 입력
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');

    // 버튼 클릭
    await page.click('button[type="submit"]');

    // 결과 확인
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('대시보드');
});
```

**주요 기능:**

```typescript
// 페이지 이동
await page.goto('/about');

// 요소 찾기
const button = page.locator('button');
const input = page.locator('input[name="email"]');
const text = page.locator('text=로그인');

// 액션
await button.click();
await input.fill('hello');
await page.keyboard.press('Enter');

// 대기
await page.waitForURL('/dashboard');
await page.waitForSelector('.loading', { state: 'hidden' });

// 스크린샷
await page.screenshot({ path: 'screenshot.png' });
```

**SSALWorks**: Jest(단위/통합)와 Playwright(E2E)를 사용합니다.

---

## 20.6 Framework (프레임워크)

Testing 영역에서는 별도의 프레임워크를 사용하지 않습니다. Jest와 Playwright가 프레임워크 역할을 합니다.

---

## 20.7 External Service (외부 서비스)

Testing 영역에서는 별도의 외부 서비스를 사용하지 않습니다.

---

## 테스트 작성 모범 사례

### 1. AAA 패턴

```typescript
test('사용자 생성', async () => {
    // Arrange (준비)
    const userData = { name: '홍길동', email: 'hong@example.com' };

    // Act (실행)
    const user = await createUser(userData);

    // Assert (검증)
    expect(user.name).toBe('홍길동');
    expect(user.id).toBeDefined();
});
```

### 2. 명확한 테스트 이름

```typescript
// ❌ 나쁜 예
test('test1', () => { ... });

// ✅ 좋은 예
test('이메일 형식이 올바르지 않으면 에러를 반환한다', () => { ... });
```

### 3. 독립적인 테스트

```typescript
// ❌ 나쁜 예: 다른 테스트에 의존
let user;
test('사용자 생성', () => { user = createUser(); });
test('사용자 조회', () => { getUser(user.id); }); // 첫 번째 테스트에 의존!

// ✅ 좋은 예: 독립적
test('사용자 조회', () => {
    const user = createUser();  // 각 테스트에서 직접 생성
    const result = getUser(user.id);
    expect(result).toBeDefined();
});
```

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | JavaScript, **TypeScript** |
| Runtime | **Node.js** |
| Package Manager | **npm** |
| Tools | - |
| Library | **Jest**, **Playwright** |
| Framework | - |
| External Service | - |

Testing은 코드의 안전망입니다. 다음 편에서는 배포와 운영을 담당하는 **DevOps**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 5,000자 / 작성자: Claude / 프롬프터: 써니**

