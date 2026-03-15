# 28편 | 심화 - TypeScript

---

27편에서 JavaScript를 다뤘습니다. 이번 편에서는 JavaScript에 **타입 안전성**을 추가한 TypeScript를 살펴봅니다.

## 1. TypeScript란

### 1-1. 정의

**TypeScript**는 JavaScript에 **정적 타입**을 추가한 언어입니다. Microsoft가 개발했고, JavaScript의 상위 집합(superset)입니다.

### 1-2. 왜 TypeScript인가

```javascript
// JavaScript
function add(a, b) {
    return a + b;
}

add(1, 2);       // 3 (정상)
add("1", 2);     // "12" (문자열 연결 - 버그!)
add(undefined);  // NaN (에러!)
```

```typescript
// TypeScript
function add(a: number, b: number): number {
    return a + b;
}

add(1, 2);       // 3 (정상)
add("1", 2);     // ❌ 컴파일 에러! (실행 전에 발견)
add(undefined);  // ❌ 컴파일 에러!
```

**장점:**
- 버그를 실행 전에 발견
- IDE 자동완성 강화
- 코드 문서화 역할
- 대규모 프로젝트에 필수

### 1-3. 작동 원리

```
TypeScript 코드 (.ts)
        ↓
   컴파일러 (tsc)
        ↓
JavaScript 코드 (.js)
        ↓
   브라우저 실행
```

브라우저는 TypeScript를 직접 실행하지 못합니다. JavaScript로 변환 후 실행합니다.

---

## 2. 기본 타입

### 2-1. 원시 타입

```typescript
// 문자열
const name: string = "홍길동";

// 숫자
const age: number = 30;
const price: number = 29.99;

// 불리언
const isActive: boolean = true;

// null과 undefined
const empty: null = null;
const notDefined: undefined = undefined;
```

### 2-2. 배열

```typescript
// 방법 1: 타입[]
const numbers: number[] = [1, 2, 3];
const names: string[] = ["홍길동", "김철수"];

// 방법 2: Array<타입>
const items: Array<number> = [1, 2, 3];
```

### 2-3. 객체

```typescript
// 인라인 타입
const user: { name: string; age: number } = {
    name: "홍길동",
    age: 30
};

// interface (권장)
interface User {
    name: string;
    age: number;
    email?: string;  // 선택적 속성 (optional)
}

const myUser: User = {
    name: "홍길동",
    age: 30
    // email은 없어도 OK
};
```

---

## 3. 타입 정의

### 3-1. interface

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

interface Post {
    id: number;
    title: string;
    content: string;
    author: User;  // 다른 interface 참조
}
```

### 3-2. type

```typescript
// 타입 별칭
type ID = string | number;
type Status = "pending" | "active" | "completed";

// 객체 타입
type User = {
    id: ID;
    name: string;
    status: Status;
};
```

### 3-3. interface vs type

| 구분 | interface | type |
|------|-----------|------|
| 확장 | `extends` | `&` (intersection) |
| 선언 병합 | 가능 | 불가 |
| 유니온/교차 타입 | 불가 | 가능 |
| 권장 | 객체 정의 | 유니온, 기타 |

```typescript
// interface 확장
interface Animal {
    name: string;
}
interface Dog extends Animal {
    breed: string;
}

// type 확장
type Animal = { name: string };
type Dog = Animal & { breed: string };
```

---

## 4. 함수 타입

### 4-1. 기본 형식

```typescript
// 함수 선언식
function add(a: number, b: number): number {
    return a + b;
}

// 화살표 함수
const addArrow = (a: number, b: number): number => a + b;

// 반환값 없음
function log(message: string): void {
    console.log(message);
}
```

### 4-2. 선택적 매개변수

```typescript
function greet(name: string, greeting?: string): string {
    return `${greeting || "안녕하세요"}, ${name}님!`;
}

greet("홍길동");              // "안녕하세요, 홍길동님!"
greet("홍길동", "반갑습니다"); // "반갑습니다, 홍길동님!"
```

### 4-3. 기본값

```typescript
function greet(name: string, greeting: string = "안녕하세요"): string {
    return `${greeting}, ${name}님!`;
}
```

---

## 5. 유니온과 제네릭

### 5-1. 유니온 타입

```typescript
// 여러 타입 중 하나
let id: string | number;
id = "abc123";  // OK
id = 123;       // OK

// 함수에서 사용
function printId(id: string | number) {
    if (typeof id === "string") {
        console.log(id.toUpperCase());
    } else {
        console.log(id);
    }
}
```

### 5-2. 리터럴 타입

```typescript
type Direction = "up" | "down" | "left" | "right";
type Status = "pending" | "active" | "completed";

function move(direction: Direction) {
    // ...
}

move("up");    // OK
move("front"); // ❌ 에러!
```

### 5-3. 제네릭

```typescript
// 타입을 매개변수처럼 받음
function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

first<number>([1, 2, 3]);      // 1
first<string>(["a", "b"]);     // "a"
first([1, 2, 3]);              // 타입 추론 OK

// 제네릭 interface
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

const userResponse: ApiResponse<User> = {
    data: { id: 1, name: "홍길동", email: "hong@example.com", createdAt: new Date() },
    status: 200,
    message: "성공"
};
```

---

## 6. 타입 가드

### 6-1. typeof

```typescript
function process(value: string | number) {
    if (typeof value === "string") {
        // 여기서 value는 string
        return value.toUpperCase();
    } else {
        // 여기서 value는 number
        return value * 2;
    }
}
```

### 6-2. in 연산자

```typescript
interface Dog {
    bark: () => void;
}
interface Cat {
    meow: () => void;
}

function speak(animal: Dog | Cat) {
    if ("bark" in animal) {
        animal.bark();  // Dog
    } else {
        animal.meow();  // Cat
    }
}
```

---

## 7. 실전 예시: API 타입 정의

### 7-1. API 응답 타입

```typescript
// 기본 응답 구조
interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

// 사용자 타입
interface User {
    id: string;
    email: string;
    name: string;
    plan: "free" | "pro" | "enterprise";
    createdAt: string;
}

// 구독 타입
interface Subscription {
    id: string;
    userId: string;
    plan: string;
    status: "active" | "cancelled" | "expired";
    expiresAt: string;
}
```

### 7-2. API 함수

```typescript
async function getUser(userId: string): Promise<ApiResponse<User>> {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
}

async function updateSubscription(
    subscriptionId: string,
    data: Partial<Subscription>
): Promise<ApiResponse<Subscription>> {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response.json();
}
```

### 7-3. 사용 예시

```typescript
async function displayUser() {
    const result = await getUser("user_123");

    if (result.success) {
        console.log(result.data.name);  // 자동완성 지원!
        console.log(result.data.plan);  // 타입 안전
    } else {
        console.error(result.error);
    }
}
```

---

## 8. 유틸리티 타입

### 8-1. 자주 쓰는 유틸리티

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    age: number;
}

// Partial: 모든 속성을 선택적으로
type PartialUser = Partial<User>;
// { id?: string; name?: string; ... }

// Pick: 특정 속성만 선택
type UserName = Pick<User, "name" | "email">;
// { name: string; email: string }

// Omit: 특정 속성 제외
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string; age: number }

// Required: 모든 속성을 필수로
type RequiredUser = Required<PartialUser>;
```

### 8-2. 실전 활용

```typescript
// 업데이트 시 일부 필드만 받기
async function updateUser(
    userId: string,
    data: Partial<Omit<User, "id">>  // id 제외, 나머지 선택적
): Promise<User> {
    // ...
}

// 사용
updateUser("user_123", { name: "새 이름" });       // OK
updateUser("user_123", { email: "new@email.com" }); // OK
updateUser("user_123", { id: "new_id" });           // ❌ 에러!
```

---

## 9. 설정 파일 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

| 옵션 | 설명 |
|------|------|
| `target` | 출력 JavaScript 버전 |
| `strict` | 엄격한 타입 검사 (권장) |
| `outDir` | 컴파일 결과 출력 폴더 |
| `rootDir` | 소스 파일 폴더 |

---

## 정리

TypeScript는 JavaScript에 **타입 안전성**을 추가합니다.

**핵심 포인트:**
- 변수, 함수에 타입 명시 (`: type`)
- `interface`로 객체 구조 정의
- 유니온 타입으로 여러 타입 허용 (`|`)
- 제네릭으로 재사용 가능한 타입 (`<T>`)
- 유틸리티 타입으로 타입 변환 (`Partial`, `Pick`, `Omit`)

버그를 실행 전에 잡고, IDE 자동완성을 활용하세요.

---

**작성일: 2025-12-21 / 작성자: Claude Code**
