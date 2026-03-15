# 32편 | 심화 - Vercel

---

21편에서 DevOps 영역을 다루면서 Vercel을 소개했고, 31편에서 도메인 연결을 다뤘습니다. 이번 편에서는 Vercel의 **상세 기능과 활용법**을 깊이 다룹니다.

## 1. Vercel이란

### 1-1. 정의

**Vercel**은 프론트엔드 배포 플랫폼입니다. Next.js를 만든 회사로, 정적 사이트와 서버리스 함수를 손쉽게 배포합니다.

### 1-2. 주요 특징

| 특징 | 설명 |
|------|------|
| 자동 배포 | Git push만 하면 자동 배포 |
| 엣지 네트워크 | 전 세계 CDN으로 빠른 속도 |
| 프리뷰 배포 | PR마다 미리보기 URL 생성 |
| 서버리스 함수 | API 엔드포인트 제공 |
| 자동 HTTPS | SSL 인증서 자동 발급 |

### 1-3. 무료 티어 제한

| 항목 | 무료 제한 |
|------|----------|
| 대역폭 | 100GB/월 |
| 빌드 시간 | 6,000분/월 |
| 서버리스 함수 실행 | 100GB-Hours/월 |
| 팀원 수 | 1명 (개인) |

---

## 2. 프로젝트 설정

### 2-1. 프로젝트 연결

1. https://vercel.com → GitHub 로그인
2. **Add New...** → **Project**
3. GitHub 저장소 선택
4. 설정:

| 항목 | 설명 |
|------|------|
| Project Name | 프로젝트 이름 (소문자, 하이픈) |
| Framework Preset | Other (정적), Next.js 등 |
| Root Directory | 빌드할 폴더 경로 |
| Build Command | 빌드 명령어 (필요시) |

### 2-2. 자동 배포 설정

Git 연결 후 자동 동작:
- `main` 브랜치 push → 프로덕션 배포
- PR 생성 → 프리뷰 URL 생성
- PR 업데이트 → 프리뷰 자동 갱신

---

## 3. 서버리스 함수 (Serverless Functions)

### 3-1. 파일 구조

```
프로젝트/
├── api/              ← 서버리스 함수 폴더
│   ├── hello.js      ← /api/hello
│   ├── users/
│   │   └── [id].js   ← /api/users/:id
│   └── auth/
│       └── login.js  ← /api/auth/login
└── index.html
```

### 3-2. 기본 함수 작성

```javascript
// api/hello.js
export default function handler(req, res) {
    res.status(200).json({ message: 'Hello, World!' });
}
```

### 3-3. HTTP 메서드 처리

```javascript
// api/users.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
        // 사용자 목록 조회
        res.status(200).json({ users: [] });
    } else if (req.method === 'POST') {
        // 사용자 생성
        const { name, email } = req.body;
        res.status(201).json({ id: 1, name, email });
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
```

### 3-4. 동적 라우트

```javascript
// api/users/[id].js
export default async function handler(req, res) {
    const { id } = req.query;  // URL 파라미터

    if (req.method === 'GET') {
        res.status(200).json({ id, name: '홍길동' });
    } else if (req.method === 'DELETE') {
        res.status(200).json({ deleted: id });
    }
}
```

### 3-5. 환경변수 사용

```javascript
// api/supabase-client.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
```

---

## 4. 환경변수 설정

### 4-1. Dashboard에서 설정

1. Project → **Settings** → **Environment Variables**
2. 변수 추가:

| Key | Value | Environment |
|-----|-------|-------------|
| SUPABASE_URL | https://xxx.supabase.co | All |
| SUPABASE_ANON_KEY | eyJxxx... | All |
| SUPABASE_SERVICE_ROLE_KEY | eyJxxx... | All |

### 4-2. 환경 구분

| 환경 | 용도 |
|------|------|
| Production | main 브랜치 배포 |
| Preview | PR 프리뷰 배포 |
| Development | 로컬 개발 |

### 4-3. 로컬에서 환경변수 사용

```bash
# vercel CLI 설치
npm i -g vercel

# 환경변수 가져오기
vercel env pull .env.local
```

---

## 5. vercel.json 설정

### 5-1. 기본 설정

```json
{
  "version": 2,
  "name": "my-project",
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null
}
```

### 5-2. 리다이렉트/리라이트

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### 5-3. CORS 헤더

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 5-4. 함수 설정

```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

| 옵션 | 설명 | 무료 제한 |
|------|------|----------|
| maxDuration | 최대 실행 시간 (초) | 10초 |
| memory | 메모리 (MB) | 1024MB |

---

## 6. 도메인 연결

### 6-1. 도메인 추가

1. Project → **Settings** → **Domains**
2. 도메인 입력: `www.example.com`
3. **Add**

### 6-2. DNS 설정

Vercel이 제공하는 값을 DNS에 추가:

| Type | Name | Value |
|------|------|-------|
| A | www | 76.76.21.21 |
| TXT | _vercel | vc-domain-verify=... |

### 6-3. www vs apex 도메인

```
www.example.com  ← 권장 (A 레코드)
example.com      ← apex 도메인 (CNAME 불가)
```

**팁:** www를 기본으로 하고, apex에서 www로 리다이렉트

---

## 7. 배포 전략

### 7-1. 브랜치별 배포

| 브랜치 | 배포 대상 | URL |
|--------|----------|-----|
| main | Production | example.com |
| develop | Preview | develop-xxx.vercel.app |
| feature/* | Preview | feature-xxx.vercel.app |

### 7-2. 롤백

1. Project → **Deployments**
2. 이전 배포 선택
3. **...** → **Promote to Production**

### 7-3. 배포 보호

Settings → General → **Production Branch Protection**
- 특정 브랜치만 프로덕션 배포 허용

---

## 8. 로그 및 모니터링

### 8-1. 함수 로그

1. Project → **Logs**
2. 필터:
   - Production / Preview
   - Success / Error
   - 함수 이름

### 8-2. 로그 작성

```javascript
// 콘솔 출력이 로그에 기록됨
export default function handler(req, res) {
    console.log('요청 받음:', req.method, req.url);
    console.log('Body:', req.body);

    res.status(200).json({ success: true });
}
```

### 8-3. 에러 추적

```javascript
export default async function handler(req, res) {
    try {
        // 비즈니스 로직
        const result = await doSomething();
        res.status(200).json(result);
    } catch (error) {
        console.error('에러 발생:', error);
        res.status(500).json({ error: error.message });
    }
}
```

---

## 9. 실전 팁

### 9-1. Cold Start 대응

서버리스 함수는 첫 실행 시 느릴 수 있음 (Cold Start).

**완화 방법:**
- 함수 크기 줄이기 (불필요한 import 제거)
- Edge Functions 사용 (무료 플랜에서도 사용 가능)

### 9-2. 정적 파일 캐싱

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 9-3. SPA 라우팅

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 10. 문제 해결

### 문제 1: 함수 타임아웃

**증상:** 10초 초과로 함수 종료

**해결:**
- 함수 최적화 (DB 쿼리 개선)
- Pro 플랜으로 maxDuration 증가
- 비동기 처리 (큐 사용)

### 문제 2: 404 에러

**증상:** 페이지/API 찾을 수 없음

**해결:**
- Root Directory 확인
- 파일 경로 대소문자 확인 (Linux는 대소문자 구분)
- vercel.json rewrites 확인

### 문제 3: CORS 에러

**증상:** 브라우저에서 API 호출 실패

**해결:**
- vercel.json에 CORS 헤더 추가
- OPTIONS 요청 처리 추가

---

## 정리

Vercel은 **프론트엔드 + 서버리스** 배포 플랫폼입니다.

**핵심 기능:**
- Git push → 자동 배포
- `/api` 폴더 → 서버리스 함수
- 환경변수 → Dashboard에서 설정
- 도메인 → DNS A/TXT 레코드

**무료 티어로 충분:**
- 개인 프로젝트/사이드 프로젝트
- 상업용은 Pro 플랜 필요 (2025년부터 엄격)

---

**작성일: 2025-12-21 / 작성자: Claude Code**
