# 21편 | 개발 영역 - DevOps (데브옵스)

---

개발(Development)과 운영(Operations)을 연결하는 영역, **DevOps**입니다. 코드를 서버에 배포하고, 자동화하고, 모니터링하는 모든 활동을 다룹니다.

---

## DevOps의 핵심

### CI/CD 파이프라인

```
[개발] → [커밋] → [빌드] → [테스트] → [배포] → [모니터링]
         └─────────── 자동화 ───────────┘
```

| 용어 | 의미 | 예시 |
|-----|------|------|
| CI | Continuous Integration (지속적 통합) | 커밋마다 자동 빌드/테스트 |
| CD | Continuous Deployment (지속적 배포) | 테스트 통과 시 자동 배포 |

---

## 21.1 Language (언어)

### YAML

설정 파일 작성에 사용하는 언어입니다.

```yaml
# GitHub Actions 예시
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
```

**특징:**
- 들여쓰기로 구조 표현
- JSON보다 읽기 쉬움
- 주석 지원 (`#`)

### Bash

쉘 스크립트 작성에 사용합니다.

```bash
#!/bin/bash

# 빌드 스크립트
echo "Building..."
npm run build

# 배포
echo "Deploying..."
vercel --prod
```

---

## 21.2~21.3 Runtime, Package Manager

DevOps 영역에서는 별도의 런타임이나 패키지 관리자를 사용하지 않습니다.

---

## 21.4 Tools (도구)

### Git

분산 버전 관리 시스템입니다.

**기본 명령어:**

```bash
# 저장소 초기화
git init

# 변경사항 추적
git add .
git commit -m "feat: 로그인 기능 추가"

# 원격 저장소
git push origin main
git pull origin main

# 브랜치
git checkout -b feature/login
git merge feature/login
```

**커밋 메시지 규칙:**

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
test: 테스트 추가
chore: 기타 변경
```

### GitHub

Git 저장소 호스팅 서비스입니다.

**주요 기능:**
- 코드 저장소
- Pull Request (코드 리뷰)
- Issues (이슈 관리)
- Actions (CI/CD)
- Pages (정적 사이트 호스팅)

### Vercel CLI

Vercel 배포를 위한 CLI 도구입니다.

**설치:**
```bash
npm install -g vercel
```

**사용법:**

```bash
# 로그인
vercel login

# 배포 (프리뷰)
vercel

# 프로덕션 배포
vercel --prod

# 환경 변수 설정
vercel env add SUPABASE_URL
```

---

## 21.5~21.6 Library, Framework

DevOps 영역에서는 별도의 라이브러리나 프레임워크를 사용하지 않습니다.

---

## 21.7 External Service (외부 서비스)

### Vercel (PaaS - Platform as a Service)

Next.js를 만든 회사의 호스팅 서비스입니다.

**특징:**
- Next.js 완벽 지원
- Git 연동 자동 배포
- 서버리스 함수
- Edge 네트워크 (CDN)
- 무료 HTTPS

**배포 방법:**

**방법 1: Git 연동 (권장)**
```
1. GitHub에 코드 푸시
2. Vercel에서 저장소 연결
3. 자동 배포 완료
```

**방법 2: CLI 배포**
```bash
vercel --prod
```

**환경 변수 설정:**
```
Vercel Dashboard → Project → Settings → Environment Variables

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**도메인 연결:**
```
Vercel Dashboard → Project → Settings → Domains

yourapp.com → Vercel DNS 설정
```

**무료 플랜:**
- 무제한 사이트
- 100GB 대역폭/월
- 서버리스 함수 100GB-hours
- 자동 HTTPS

### GitHub Actions

GitHub에서 제공하는 CI/CD 서비스입니다.

**워크플로우 파일 위치:**
```
.github/
└── workflows/
    ├── ci.yml      # CI 파이프라인
    └── deploy.yml  # 배포 파이프라인
```

**CI 워크플로우 예시:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

**주요 개념:**

| 개념 | 설명 |
|-----|------|
| Workflow | 자동화 프로세스 전체 |
| Job | 워크플로우 내 작업 단위 |
| Step | Job 내 개별 단계 |
| Action | 재사용 가능한 작업 |
| Runner | 워크플로우 실행 환경 |

**SSALWorks**: Vercel + GitHub Actions를 사용합니다.

---

## 배포 전략

### 1. 브랜치 전략

```
main (프로덕션)
  ↑
develop (개발)
  ↑
feature/xxx (기능 개발)
```

### 2. 환경 분리

| 환경 | 용도 | URL |
|-----|------|-----|
| Production | 실제 서비스 | yourapp.com |
| Preview | PR 미리보기 | xxx.vercel.app |
| Development | 로컬 개발 | localhost:3000 |

### 3. 롤백

문제 발생 시 이전 버전으로 되돌립니다.

```bash
# Vercel: 이전 배포로 롤백
vercel rollback

# Git: 이전 커밋으로 되돌리기
git revert HEAD
git push
```

---

## 모니터링

### Vercel Analytics

```
Vercel Dashboard → Project → Analytics

- 방문자 수
- 페이지 조회수
- Core Web Vitals
```

### 로그 확인

```
Vercel Dashboard → Project → Logs

- 함수 실행 로그
- 에러 로그
- 빌드 로그
```

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | **YAML**, Bash |
| Runtime | - |
| Package Manager | - |
| Tools | **Git**, **GitHub**, **Vercel CLI** |
| Library | - |
| Framework | - |
| External Service | **Vercel (PaaS)**, **GitHub Actions** |

DevOps는 개발과 운영의 다리입니다. 다음 편에서는 **SEO와 웹 접근성**을 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 5,000자 / 작성자: Claude / 프롬프터: 써니**

