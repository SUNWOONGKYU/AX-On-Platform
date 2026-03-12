# 11편 | 기술 스택 - Tools (도구)

---

기술 스택의 네 번째 요소는 **Tools(도구)**입니다. 코드를 작성하고, 검사하고, 빌드하는 과정을 도와주는 도구들입니다.

---

## 1. Tools란 무엇인가

### 1-1. 개발 도구의 정의

**Tools(도구)**는 개발 생산성을 높여주는 보조 프로그램입니다. 코드 자체는 아니지만, 코드를 더 잘 작성하고 관리할 수 있게 해줍니다.

| 비유 | 설명 |
|------|------|
| 코드 = 요리 | 최종 결과물 |
| Tools = 조리도구 | 요리를 돕는 도구들 |

**도구의 역할:**
- 코드 품질 검사
- 코드 자동 정리
- 빌드 및 번들링
- 디버깅 지원

### 1-2. 주요 도구 분류

| 분류 | 도구 | 역할 |
|------|------|------|
| **코드 검사** | ESLint | 문법 오류 탐지 |
| **코드 정리** | Prettier | 코드 자동 포맷팅 |
| **빌드 도구** | Vite, Webpack | 코드 번들링 |
| **버전 관리** | Git | 변경 이력 관리 |
| **디버깅** | DevTools | 브라우저 디버깅 |

---

## 2. ESLint - 코드 검사 도구

### 2-1. ESLint란?

**ESLint**는 JavaScript/TypeScript 코드의 문법 오류와 잠재적 버그를 찾아주는 도구입니다.

```javascript
// ESLint가 잡아주는 오류 예시

// 1. 사용하지 않는 변수
const unusedVariable = 'hello'; // 경고: 사용되지 않음

// 2. 세미콜론 누락
const name = 'Kim'  // 오류: 세미콜론 필요

// 3. 정의되지 않은 변수
console.log(undefined Variable);  // 오류: 정의되지 않음
```

### 2-2. ESLint 설정

```javascript
// .eslintrc.js
module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
        'no-unused-vars': 'warn',     // 미사용 변수 경고
        'no-console': 'off',          // console 허용
        'semi': ['error', 'always'],  // 세미콜론 필수
    },
};
```

### 2-3. ESLint 명령어

| 명령어 | 설명 |
|--------|------|
| `npx eslint .` | 전체 코드 검사 |
| `npx eslint --fix .` | 자동 수정 |
| `npx eslint src/` | 특정 폴더 검사 |

---

## 3. Prettier - 코드 포맷터

### 3-1. Prettier란?

**Prettier**는 코드를 일관된 스타일로 자동 정리해주는 도구입니다. 들여쓰기, 따옴표, 줄바꿈 등을 통일합니다.

**변환 전:**
```javascript
const user={name:'Kim',age:25,email:'kim@email.com'};
function greet(name){return `Hello, ${name}!`}
```

**변환 후:**
```javascript
const user = {
    name: 'Kim',
    age: 25,
    email: 'kim@email.com',
};

function greet(name) {
    return `Hello, ${name}!`;
}
```

### 3-2. Prettier 설정

```json
// .prettierrc
{
    "semi": true,
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "es5",
    "printWidth": 80
}
```

### 3-3. ESLint vs Prettier

| 구분 | ESLint | Prettier |
|------|--------|----------|
| 역할 | 코드 품질 검사 | 코드 스타일 정리 |
| 검사 대상 | 버그, 오류, 규칙 | 들여쓰기, 따옴표, 줄바꿈 |
| 수정 범위 | 로직 오류 포함 | 스타일만 |
| 사용 시점 | 코드 저장 시 | 코드 저장 시 |

**함께 사용하는 것이 좋습니다:**
- ESLint → 버그 잡기
- Prettier → 스타일 통일

---

## 4. Vite - 빌드 도구

### 4-1. Vite란?

**Vite**는 빠른 개발 서버와 빌드 도구입니다. 기존 Webpack보다 훨씬 빠릅니다.

| 특징 | 설명 |
|------|------|
| **빠른 시작** | 서버 시작이 즉각적 |
| **빠른 HMR** | 변경 사항 즉시 반영 |
| **최적화 빌드** | 프로덕션용 최적화 |

### 4-2. Vite vs Webpack

| 항목 | Vite | Webpack |
|------|------|---------|
| 서버 시작 | 즉시 | 느림 (번들링 필요) |
| HMR 속도 | 매우 빠름 | 보통 |
| 설정 복잡도 | 간단 | 복잡 |
| 생태계 | 성장 중 | 성숙함 |

### 4-3. 빌드 과정 이해

```
[개발 시]
여러 JS/CSS 파일 → Vite 개발 서버 → 브라우저에서 직접 로드

[배포 시]
여러 JS/CSS 파일 → Vite 빌드 → 하나의 번들 파일 → 서버 배포
```

**번들링 필요한 이유:**
- 파일 수 줄이기 (HTTP 요청 감소)
- 코드 압축 (용량 감소)
- 브라우저 호환성 확보

---

## 5. 브라우저 DevTools

### 5-1. DevTools란?

**DevTools(개발자 도구)**는 브라우저에 내장된 디버깅 도구입니다. F12 또는 우클릭 → 검사로 열 수 있습니다.

### 5-2. 주요 탭 기능

| 탭 | 기능 | 용도 |
|----|------|------|
| **Elements** | HTML/CSS 확인 | 레이아웃 수정 |
| **Console** | 로그 확인 | 오류 추적 |
| **Network** | 네트워크 요청 | API 확인 |
| **Sources** | 소스 코드 | 디버깅 |
| **Application** | 저장소 | 쿠키, 로컬스토리지 |

### 5-3. Console 활용

```javascript
// 디버깅용 출력
console.log('일반 로그');
console.warn('경고 메시지');
console.error('에러 메시지');
console.table([{ name: 'Kim', age: 25 }]);  // 테이블 형태
```

### 5-4. Network 탭 활용

| 확인 항목 | 설명 |
|----------|------|
| **Status** | 응답 코드 (200, 404, 500) |
| **Time** | 응답 시간 |
| **Size** | 응답 크기 |
| **Preview** | 응답 데이터 미리보기 |

---

## 6. 기타 유용한 도구

### 6-1. Postman

**Postman**은 API를 테스트하는 도구입니다.

| 기능 | 설명 |
|------|------|
| 요청 전송 | GET, POST, PUT, DELETE |
| 응답 확인 | JSON, 상태 코드 |
| 환경 변수 | 개발/운영 환경 분리 |
| 컬렉션 | 요청 모음 저장 |

### 6-2. GitHub Copilot

**GitHub Copilot**은 AI 기반 코드 자동완성 도구입니다.

| 기능 | 설명 |
|------|------|
| 코드 제안 | 다음 줄 예측 |
| 함수 생성 | 주석 기반 코드 생성 |
| 설명 제공 | 코드 설명 |

---

## 정리

| 도구 | 역할 | SSALWorks 활용 |
|------|------|---------------|
| **ESLint** | 코드 품질 검사 | Next.js 기본 설정 |
| **Prettier** | 코드 스타일 정리 | 일관된 코드 형식 |
| **Vite** | 빌드 도구 | 빠른 개발 서버 |
| **DevTools** | 브라우저 디버깅 | 오류 추적 |
| **Postman** | API 테스트 | API 개발 확인 |

다음 편에서는 기능별 코드 모음인 **Library**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 4,200자 / 작성자: Claude / 프롬프터: 써니**

