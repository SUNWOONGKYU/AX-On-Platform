# 9편 | 기술 스택 - Runtime (실행 환경)

---

기술 스택의 두 번째 요소는 **Runtime(실행 환경)**입니다. 코드를 작성해도 어딘가에서 실행되어야 합니다. 그 "어딘가"가 바로 Runtime입니다.

---

## 1. Runtime이란 무엇인가

### 1-1. 실행 환경의 정의

**Runtime(런타임)**은 작성한 코드가 실제로 돌아가는 환경입니다.

| 비유 | 설명 |
|------|------|
| 코드 = 악보 | 연주될 음악 |
| Runtime = 무대 | 연주가 일어나는 장소 |

**JavaScript의 경우:**
- 브라우저에서 실행되면 → Browser Runtime
- 서버에서 실행되면 → Node.js Runtime

### 1-2. 웹사이트 개발의 주요 Runtime

| Runtime | 실행 위치 | 역할 |
|---------|----------|------|
| **Browser** | 사용자 컴퓨터 | 프론트엔드 실행 |
| **Node.js** | 서버 컴퓨터 | 백엔드 실행 |
| **Edge Runtime** | CDN 엣지 | 빠른 응답 |

---

## 2. Browser Runtime

### 2-1. 브라우저에서 JavaScript 실행

모든 웹 브라우저에는 JavaScript 엔진이 내장되어 있습니다.

| 브라우저 | JavaScript 엔진 |
|----------|-----------------|
| Chrome | V8 |
| Firefox | SpiderMonkey |
| Safari | JavaScriptCore |
| Edge | V8 |

### 2-2. 브라우저가 제공하는 기능

| 기능 | 설명 | 예시 |
|------|------|------|
| **DOM** | HTML 조작 | `document.getElementById()` |
| **이벤트** | 사용자 상호작용 | `addEventListener()` |
| **Storage** | 데이터 저장 | `localStorage` |
| **Fetch** | 네트워크 요청 | `fetch()` |

> 브라우저에서는 버튼 클릭 감지, 데이터 저장, 서버 요청 등이 가능합니다. **Claude Code가 이 코드들을 자동으로 작성**해줍니다.

### 2-3. 브라우저 Runtime의 특징

| 특징 | 설명 |
|------|------|
| **샌드박스** | 보안을 위한 격리 환경 |
| **제한된 접근** | 파일 시스템 직접 접근 불가 |
| **사용자 기기 실행** | 클라이언트 사이드 |

---

## 3. Node.js Runtime

### 3-1. Node.js란?

**Node.js**는 브라우저 밖에서 JavaScript를 실행할 수 있게 해주는 Runtime입니다. 2009년 Ryan Dahl이 Chrome V8 엔진을 기반으로 만들었습니다.

**Node.js가 할 수 있는 일:**
- 서버 컴퓨터의 파일 읽기/쓰기
- 웹 서버 만들기 (API 서버)
- 데이터베이스 연결

> **SSALWorks에서는 Next.js**가 Node.js 위에서 실행됩니다. 서버 코드는 **Claude Code가 자동으로 작성**해줍니다.

### 3-2. Node.js의 특징

| 특징 | 설명 |
|------|------|
| **비동기 처리** | 여러 작업 동시 처리 |
| **싱글 스레드** | 효율적인 메모리 사용 |
| **이벤트 기반** | 이벤트 루프로 작업 관리 |
| **npm 생태계** | 수백만 개의 패키지 |

### 3-3. 비동기 처리 이해하기

**카페 알바생 비유:**

| 처리 방식 | 비유 | 특징 |
|----------|------|------|
| **동기 처리** (일반) | 주문 1번 받고 → 커피 만들고 → 서빙 후 → 주문 2번 | 한 번에 하나씩, 느림 |
| **비동기 처리** (Node.js) | 주문 1,2,3,4번 쭉쭉 받고 → 동시에 처리 | 여러 개 동시, 빠름 |

### 3-4. Node.js가 잘하는 일

| 용도 | 예시 |
|------|------|
| **API 서버** | REST API, GraphQL |
| **실시간 서비스** | 채팅, 알림 |
| **마이크로서비스** | 가벼운 서버 |
| **빌드 도구** | Webpack, Vite |

---

## 4. Edge Runtime

### 4-1. Edge Runtime이란?

**Edge Runtime**은 CDN의 엣지 서버에서 코드를 실행하는 환경입니다. 사용자와 가까운 곳에서 실행되어 응답이 매우 빠릅니다.

| 비교 | 일반 서버 | Edge Runtime |
|------|----------|--------------|
| 위치 | 한 곳 (미국, 서울 등) | 전 세계 분산 |
| 응답 속도 | 느림 | 매우 빠름 |
| 기능 | 완전한 Node.js | 제한된 API |

### 4-2. Edge Runtime의 특징

| 특징 | 설명 |
|------|------|
| **빠른 시작** | 콜드 스타트 거의 없음 |
| **글로벌 배포** | 사용자 가까이에서 실행 |
| **경량화** | 제한된 Node.js API |

### 4-3. Vercel Edge Functions

**Vercel Edge Functions**은 전 세계 분산된 서버에서 코드를 실행합니다.

**SSALWorks 활용:**
| 기능 | 설명 |
|------|------|
| Next.js Middleware | 요청 전처리 |
| API Routes (Edge) | 빠른 API 응답 |
| 인증 처리 | 로그인/권한 확인 |

> **Claude Code가 Edge 설정을 자동으로** 해줍니다. 여러분은 "빠른 응답이 필요해"라고 요청하면 됩니다.

---

## 5. Runtime 선택 가이드

### 5-1. 상황별 Runtime 선택

| 상황 | 권장 Runtime |
|------|-------------|
| 웹페이지 동작 | Browser |
| API 서버 개발 | Node.js |
| 빠른 응답 필요 | Edge Runtime |
| 데이터 집약적 처리 | Node.js |
| 인증/리다이렉트 | Edge Runtime |

### 5-2. SSALWorks 기술 스택

| Runtime | 사용처 |
|---------|--------|
| Browser | React 컴포넌트 실행 |
| Node.js | Next.js API Routes |
| Edge | Vercel Edge Functions |

---

## 정리

| Runtime | 위치 | 용도 | SSALWorks |
|---------|------|------|-----------|
| Browser | 사용자 PC | 프론트엔드 | React |
| Node.js | 서버 | 백엔드 API | Next.js |
| Edge | CDN | 빠른 처리 | Vercel |

다음 편에서는 패키지를 관리하는 **Package Manager**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 3,200자 / 작성자: Claude / 프롬프터: 써니**
