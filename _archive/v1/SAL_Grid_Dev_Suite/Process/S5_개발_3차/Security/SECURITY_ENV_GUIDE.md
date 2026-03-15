# SECURITY_ENV_GUIDE — Supabase 환경변수 분리 가이드

Task: S5S1 | Stage: S5 | Area: Security | 작성일: 2026-03-06

---

## 1. 변경 내역 (하드코딩 → 환경변수)

### Before (S1 config.js — 하드코딩)

```javascript
// Process/S1_개발_준비/Backend_Infra/js/config.js
const AXON_CONFIG = {
  SUPABASE_URL: 'https://gifxpfdnnfwufzdncmor.supabase.co',   // 노출 위험
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // 노출 위험
};
```

**문제점:**
- 소스 코드 공개 시 키가 그대로 노출됨
- GitHub 업로드 시 자동 스캐너에 의해 감지될 수 있음
- 키 교체 시 코드 수정 및 재배포 필요

### After (S5 config.js — 환경변수 주입)

```javascript
// Process/S5_개발_3차/Security/js/config.js
const AXON_CONFIG = {
  SUPABASE_URL:      document.querySelector('meta[name="supabase-url"]')?.content || '',
  SUPABASE_ANON_KEY: document.querySelector('meta[name="supabase-anon-key"]')?.content || '',
};
```

**개선점:**
- 소스 코드에 키 없음 — GitHub 노출 위험 제거
- 키 교체 시 Vercel 대시보드에서만 변경, 재배포 불필요
- meta 태그 또는 API 엔드포인트 두 가지 방식 지원

---

## 2. 환경변수 주입 방식 비교

| 방식 | 파일 | 특징 | 권장 상황 |
|------|------|------|----------|
| meta 태그 | HTML `<head>` | 페이지 로드 시 즉시 사용 가능 | SSR/SSG로 meta 태그 주입 가능할 때 |
| API 엔드포인트 | `api/env-config.js` | 런타임 fetch, CDN 캐시 지원 | 순수 정적 HTML일 때 |

---

## 3. Vercel 대시보드 환경변수 설정 방법

### Step 1: 대시보드 접속

```
https://vercel.com/dashboard
→ 프로젝트 클릭
→ Settings 탭
→ Environment Variables 메뉴
```

### Step 2: 변수 추가

아래 두 변수를 각각 추가합니다.

| 변수명 | 예시 값 | 환경 |
|--------|---------|------|
| `SUPABASE_URL` | `https://gifxpfdnnfwufzdncmor.supabase.co` | Production, Preview, Development |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJI...` (전체 JWT) | Production, Preview, Development |

### Step 3: 재배포

환경변수 저장 후 Vercel이 자동 재배포합니다.
(또는 Deployments → Redeploy 수동 실행)

---

## 4. HTML에 meta 태그 추가 방법

Vercel Edge Function 또는 서버사이드 렌더링 프레임워크를 사용하는 경우
아래와 같이 `<head>`에 meta 태그를 주입합니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <!-- Vercel 환경변수 주입 (서버사이드 렌더링 또는 Edge Function 사용 시) -->
  <meta name="supabase-url"      content="{{SUPABASE_URL}}">
  <meta name="supabase-anon-key" content="{{SUPABASE_ANON_KEY}}">
  <!-- config.js는 meta 태그 이후에 로드 -->
  <script src="/js/config.js"></script>
</head>
<body>
  ...
</body>
</html>
```

---

## 5. API 엔드포인트 방식 (순수 정적 HTML)

서버사이드 렌더링이 불가능한 순수 정적 HTML 환경에서는
`api/env-config.js` 서버리스 함수를 통해 런타임에 환경변수를 받아옵니다.

```javascript
// 페이지 초기화 시 환경변수 fetch
async function initConfig() {
  try {
    const response = await fetch('/api/env-config');
    const envData  = await response.json();
    AXON_CONFIG.SUPABASE_URL      = envData.SUPABASE_URL;
    AXON_CONFIG.SUPABASE_ANON_KEY = envData.SUPABASE_ANON_KEY;
  } catch (err) {
    console.error('[AXON_CONFIG] 환경변수 로드 실패:', err);
  }
}

// DOMContentLoaded 이후 실행
document.addEventListener('DOMContentLoaded', initConfig);
```

---

## 6. .env.local 예시 (로컬 개발용)

프로젝트 루트에 `.env.local` 파일을 생성합니다.
이 파일은 **절대 Git에 커밋하지 마세요.**

```dotenv
# .env.local — 로컬 개발 전용, Git 커밋 금지
SUPABASE_URL=https://gifxpfdnnfwufzdncmor.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...전체_JWT_값...
```

**.gitignore에 반드시 추가:**

```
# .gitignore
.env
.env.local
.env.*.local
```

---

## 7. 보안 주의사항

| 항목 | 규칙 |
|------|------|
| SUPABASE_ANON_KEY | 클라이언트 노출 허용 (RLS 정책으로 보호) |
| SUPABASE_SERVICE_ROLE_KEY | 절대 클라이언트 노출 금지 — 서버 전용 |
| .env.local | Git 커밋 금지 |
| vercel.json | 실제 키 값 직접 작성 금지 — `@시크릿명` 참조 사용 |

---

## 8. 생성된 파일 목록

| 파일 | 경로 | 설명 |
|------|------|------|
| config.js | `Process/S5_개발_3차/Security/js/config.js` | 환경변수 주입 방식으로 교체된 설정 파일 |
| env-config.js | `Process/S5_개발_3차/Security/api/env-config.js` | Vercel 서버리스 환경변수 전달 엔드포인트 |
| vercel.json | `Process/S5_개발_3차/Security/vercel.json` | Vercel 환경변수 및 보안 헤더 설정 |
| SECURITY_ENV_GUIDE.md | `Process/S5_개발_3차/Security/SECURITY_ENV_GUIDE.md` | 본 가이드 문서 |
