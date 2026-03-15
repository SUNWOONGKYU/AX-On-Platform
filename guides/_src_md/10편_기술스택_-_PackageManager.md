# 10편 | 기술 스택 - Package Manager (패키지 관리자)

---

기술 스택의 세 번째 요소는 **Package Manager(패키지 관리자)**입니다. 다른 개발자들이 만들어 놓은 코드를 쉽게 가져다 쓸 수 있게 해주는 도구입니다.

---

## 1. Package Manager란 무엇인가

### 1-1. 패키지의 정의

**패키지(Package)**는 다른 개발자가 만들어서 공유한 코드 묶음입니다.

| 비유 | 설명 |
|------|------|
| 패키지 = 조미료 | 마트에서 사오는 완제품 |
| 직접 만들기 = 간장 담그기 | 처음부터 만드는 것 |

**예시:**
- 날짜 계산 필요 → `moment` 패키지 사용
- HTTP 요청 필요 → `axios` 패키지 사용
- UI 컴포넌트 필요 → `react` 패키지 사용

### 1-2. Package Manager의 역할

**Package Manager**는 패키지를 관리하는 도구입니다.

| 역할 | 설명 |
|------|------|
| **설치** | 패키지 다운로드 |
| **삭제** | 패키지 제거 |
| **버전 관리** | 특정 버전 유지 |
| **의존성 관리** | 필요한 패키지 자동 설치 |

---

## 2. npm (Node Package Manager)

### 2-1. npm이란?

**npm**은 JavaScript의 표준 패키지 관리자입니다. Node.js를 설치하면 자동으로 함께 설치됩니다.

> **Claude Code가 필요한 패키지를 자동으로 설치**해줍니다. 여러분은 "React 프로젝트 만들어줘"라고 요청하면 됩니다.

### 2-2. npm의 특징

| 특징 | 설명 |
|------|------|
| **npmjs.com** | 수백만 개 패키지 저장소 |
| **Node.js 포함** | 별도 설치 불필요 |
| **node_modules** | 패키지 저장 폴더 |
| **package.json** | 프로젝트 설정 파일 |

### 2-3. 주요 npm 명령어

| 명령어 | 설명 |
|--------|------|
| `npm init` | 새 프로젝트 생성 |
| `npm install` | 모든 패키지 설치 |
| `npm install [패키지]` | 특정 패키지 설치 |
| `npm uninstall [패키지]` | 패키지 제거 |
| `npm update` | 패키지 업데이트 |
| `npm run [스크립트]` | 스크립트 실행 |

---

## 3. package.json 이해하기

### 3-1. package.json이란?

**package.json**은 프로젝트의 설명서입니다. 필요한 패키지 목록, 실행 스크립트 등이 기록됩니다.

**package.json에 들어가는 내용:**
| 항목 | 설명 | 예시 |
|------|------|------|
| name | 프로젝트 이름 | "my-project" |
| version | 버전 | "1.0.0" |
| scripts | 실행 명령어 모음 | "dev", "build", "start" |
| dependencies | 필수 패키지 목록 | React, Next.js |
| devDependencies | 개발용 패키지 | TypeScript, Jest |

> **Claude Code가 package.json을 자동으로 생성하고 관리**해줍니다.

### 3-2. dependencies vs devDependencies

| 구분 | 설명 | 예시 |
|------|------|------|
| **dependencies** | 서비스 실행에 필수 | React, Next.js |
| **devDependencies** | 개발할 때만 필요 | Jest, TypeScript |

### 3-3. 버전 표기법

| 표기 | 의미 |
|------|------|
| `4.18.2` | 정확히 이 버전만 |
| `^4.18.2` | 4.x.x 중 최신 |
| `~4.18.2` | 4.18.x 중 최신 |
| `*` | 어떤 버전이든 |

**버전 번호의 의미 (4.18.2):**
- 4 = Major (큰 변화, 호환성 문제 가능)
- 18 = Minor (새 기능, 호환 유지)
- 2 = Patch (버그 수정)

---

## 4. 기타 Package Manager

### 4-1. yarn

**yarn**은 Facebook에서 만든 패키지 관리자입니다. npm보다 빠른 설치 속도가 장점입니다.

| npm 명령어 | yarn 명령어 |
|-----------|------------|
| `npm install` | `yarn` |
| `npm install react` | `yarn add react` |
| `npm run dev` | `yarn dev` |

> npm과 yarn은 같은 역할을 합니다. **SSALWorks에서는 npm을 사용**합니다.

### 4-2. pnpm

**pnpm**은 디스크 공간을 효율적으로 사용하는 패키지 관리자입니다.

| 특징 | 설명 |
|------|------|
| **공간 절약** | 같은 패키지는 한 번만 저장 |
| **빠른 속도** | 링크 방식으로 설치 |
| **엄격한 구조** | 잘못된 의존성 방지 |

### 4-3. npm vs yarn vs pnpm

| 항목 | npm | yarn | pnpm |
|------|-----|------|------|
| 설치 | Node.js 포함 | 별도 설치 | 별도 설치 |
| 속도 | 보통 | 빠름 | 매우 빠름 |
| 디스크 | 많이 사용 | 많이 사용 | 적게 사용 |
| 인기 | 1위 | 2위 | 3위 |

---

## 5. node_modules와 .gitignore

### 5-1. node_modules 폴더

패키지가 설치되는 폴더입니다. 용량이 매우 큽니다.

```
my-project/
├── node_modules/    ← 수백 MB ~ 수 GB
├── package.json
└── package-lock.json
```

### 5-2. Git에 올리면 안 되는 이유

| 문제 | 설명 |
|------|------|
| **용량** | 너무 큼 (수백 MB) |
| **불필요** | package.json만 있으면 재설치 가능 |
| **충돌** | 환경마다 다를 수 있음 |

### 5-3. .gitignore 설정

**.gitignore** 파일에 `node_modules/`를 추가하면 Git이 해당 폴더를 무시합니다.

> **Claude Code가 .gitignore 파일을 자동으로 설정**해줍니다.

**협업 방법:**
1. package.json 파일을 Git에 올림
2. 팀원이 `npm install` 실행
3. 동일한 패키지가 설치됨

---

## 정리

| 항목 | 설명 |
|------|------|
| **패키지** | 다른 사람이 만든 코드 묶음 |
| **npm** | JavaScript 표준 패키지 관리자 |
| **package.json** | 프로젝트 설정 파일 |
| **node_modules** | 패키지 저장 폴더 (Git 제외) |

다음 편에서는 개발을 도와주는 **Tools**를 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 3,400자 / 작성자: Claude / 프롬프터: 써니**
