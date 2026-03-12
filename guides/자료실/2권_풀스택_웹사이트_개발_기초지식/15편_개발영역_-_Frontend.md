# 15편 | 개발 영역 - Frontend (프론트엔드)

---

사용자가 직접 보고 상호작용하는 화면, 바로 **Frontend**입니다. 버튼을 클릭하고, 폼에 입력하고, 애니메이션을 보는 모든 것이 프론트엔드 영역입니다.

---

## 15.1 Language (언어)

프론트엔드의 3대 언어와 TypeScript를 알아봅니다.

### HTML (HyperText Markup Language)

웹페이지의 **구조**를 정의합니다.

```html
<header>헤더</header>
<main>본문</main>
<footer>푸터</footer>
```

- 태그로 요소를 정의
- 시맨틱 태그로 의미 부여 (`<nav>`, `<article>`, `<section>`)
- 접근성과 SEO에 직접 영향

### CSS (Cascading Style Sheets)

웹페이지의 **스타일**을 정의합니다.

```css
.button {
    background: #10B981;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
}
```

- 색상, 크기, 여백, 레이아웃 지정
- Flexbox, Grid로 복잡한 레이아웃 구성
- 반응형 디자인 (미디어 쿼리)

### JavaScript

웹페이지의 **동작**을 정의합니다.

```javascript
button.addEventListener('click', () => {
    alert('클릭!');
});
```

- 사용자 이벤트 처리
- DOM 조작
- API 호출 (fetch)
- 동적 콘텐츠 렌더링

### TypeScript

JavaScript에 **타입**을 추가한 언어입니다.

```typescript
function greet(name: string): string {
    return `안녕, ${name}!`;
}
```

- 컴파일 타임에 오류 발견
- 자동완성, 리팩토링 지원
- 대규모 프로젝트에 필수

**SSALWorks**: TypeScript를 기본으로 사용합니다.

---

## 15.2 Runtime (실행 환경)

### Browser (브라우저)

프론트엔드 코드가 실행되는 곳입니다.

| 브라우저 | 엔진 |
|---------|------|
| Chrome | V8 |
| Firefox | SpiderMonkey |
| Safari | JavaScriptCore |
| Edge | V8 |

**브라우저가 하는 일:**
- HTML 파싱 → DOM 트리 생성
- CSS 파싱 → CSSOM 생성
- JavaScript 실행
- 렌더링 (화면에 그리기)

**주의**: 브라우저마다 약간의 차이가 있어 크로스 브라우저 테스트가 필요합니다.

---

## 15.3 Package Manager (패키지 관리자)

### npm (Node Package Manager)

가장 널리 쓰이는 패키지 관리자입니다.

```bash
npm install react        # 패키지 설치
npm install -D eslint    # 개발 의존성 설치
npm run build            # 스크립트 실행
```

### yarn

npm의 대안으로, 더 빠른 설치 속도를 제공합니다.

```bash
yarn add react
yarn add -D eslint
yarn build
```

**SSALWorks**: npm을 기본으로 사용합니다.

---

## 15.4 Tools (도구)

### Vite

빠른 개발 서버와 빌드 도구입니다.

```bash
npm create vite@latest my-app
cd my-app && npm install && npm run dev
```

- HMR (Hot Module Replacement) 지원
- 빠른 콜드 스타트
- 최적화된 프로덕션 빌드

### ESLint

코드 품질을 검사합니다.

```javascript
// ❌ ESLint 경고: 사용하지 않는 변수
const unused = 'hello';

// ✅ 올바른 코드
const message = 'hello';
console.log(message);
```

### Prettier

코드 포맷을 자동으로 정리합니다.

```javascript
// 저장 전
const x={a:1,b:2}

// Prettier 적용 후
const x = { a: 1, b: 2 };
```

### DevTools (브라우저 개발자 도구)

- **Elements**: DOM, CSS 검사
- **Console**: JavaScript 로그, 에러
- **Network**: API 호출 모니터링
- **Performance**: 성능 분석

---

## 15.5 Library (라이브러리)

### React

UI를 컴포넌트 단위로 구성하는 라이브러리입니다.

```jsx
function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
}
```

- 컴포넌트 기반 개발
- Virtual DOM으로 효율적 렌더링
- 풍부한 생태계

### Zustand

가벼운 상태 관리 라이브러리입니다.

```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
    count: 0,
    increase: () => set((state) => ({ count: state.count + 1 })),
}));
```

- Redux보다 간단한 문법
- 보일러플레이트 최소화
- TypeScript 지원 우수

### React Hook Form

폼 상태 관리를 쉽게 해주는 라이브러리입니다.

```jsx
const { register, handleSubmit } = useForm();

<input {...register('email')} />
```

- 비제어 컴포넌트 방식
- 렌더링 최적화
- 유효성 검사 통합

**SSALWorks**: React + Zustand + React Hook Form 조합을 사용합니다.

---

## 15.6 Framework (프레임워크)

### Next.js

React 기반 풀스택 프레임워크입니다.

```
app/
├── page.tsx          # / 라우트
├── about/
│   └── page.tsx      # /about 라우트
└── api/
    └── hello/
        └── route.ts  # API 엔드포인트
```

**주요 기능:**
- 파일 기반 라우팅
- SSR (Server-Side Rendering)
- API Routes (백엔드 통합)
- 이미지 최적화

### Tailwind CSS

유틸리티 기반 CSS 프레임워크입니다.

```html
<button class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
    버튼
</button>
```

- 클래스 조합으로 스타일링
- CSS 파일 따로 안 만들어도 됨
- 일관된 디자인 시스템

**SSALWorks**: Next.js + Tailwind CSS를 기본 스택으로 사용합니다.

---

## 15.7 External Service (외부 서비스)

Frontend 영역에서는 별도의 외부 서비스를 사용하지 않습니다. 필요한 서비스는 다른 영역(Database, DevOps 등)에서 연동합니다.

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | HTML, CSS, JavaScript, **TypeScript** |
| Runtime | Browser |
| Package Manager | **npm** |
| Tools | Vite, ESLint, Prettier, DevTools |
| Library | **React**, Zustand, React Hook Form |
| Framework | **Next.js**, Tailwind CSS |
| External Service | - |

프론트엔드는 사용자와 직접 만나는 영역입니다. 다음 편에서는 서버 환경을 구축하는 **Backend Infra**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 5,100자 / 작성자: Claude / 프롬프터: 써니**

