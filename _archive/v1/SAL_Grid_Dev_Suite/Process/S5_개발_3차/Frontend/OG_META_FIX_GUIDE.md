# OG 메타태그 도메인 수정 가이드
> Task S5F3 — OG 이미지/메타태그 도메인 수정
> 작업일: 2026-03-06

---

## 1. 수정 배경

기존 HTML 파일들의 OG 메타태그에 잘못된 도메인이 하드코딩되어 있었다.

| 항목 | 잘못된 값 | 올바른 값 |
|------|----------|---------|
| og:image 도메인 | `https://axon-platform.com` | `https://ax-on.vercel.app` |
| og:url 도메인 (일부) | `https://www.ax-on.net` | `https://ax-on.vercel.app` |
| og:url 누락 | (태그 없음) | 각 페이지별 URL 추가 |

---

## 2. 수정된 파일 목록

| 파일명 | 원본 위치 | 수정 저장 위치 |
|--------|----------|--------------|
| `index.html` | `Process/S2_개발_1차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `startup.html` | `Process/S2_개발_1차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `ax-project.html` | `Process/S2_개발_1차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `expert.html` | `Process/S2_개발_1차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `community.html` | `Process/S2_개발_1차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `enrollment.html` | `Process/S3_개발_2차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `contact.html` | `Process/S3_개발_2차/Frontend/` | `Process/S5_개발_3차/Frontend/` |
| `expert-template.html` | `Process/S3_개발_2차/Frontend/` | `Process/S5_개발_3차/Frontend/` |

**신규 생성 파일:**
- `config.js` — `DEPLOYMENT_DOMAIN` 상수 추가 (Frontend 영역)

---

## 3. 변경 전/후 비교

### 3.1 index.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<meta property="og:url" content="https://www.ax-on.net">
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app">
```

---

### 3.2 startup.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<!-- og:url 태그 없음 -->
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/startup.html">
```

---

### 3.3 ax-project.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<!-- og:url 태그 없음 -->
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/ax-project.html">
```

---

### 3.4 expert.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<meta property="og:url" content="https://www.ax-on.net/expert.html">
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/expert.html">
```

---

### 3.5 community.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<!-- og:url 태그 없음 -->
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/community.html">
```

---

### 3.6 enrollment.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<!-- og:url 태그 없음 -->
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/enrollment.html">
```

---

### 3.7 contact.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<!-- og:url 태그 없음 -->
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/contact.html">
```

---

### 3.8 expert-template.html

**변경 전:**
```html
<meta property="og:image" content="https://axon-platform.com/images/og-default.png">
<!-- og:url 태그 없음 -->
```

**변경 후:**
```html
<!-- @task S5F3 — OG 메타태그 도메인 수정 -->
<meta property="og:image" content="https://ax-on.vercel.app/images/og-default.png">
<meta property="og:url" content="https://ax-on.vercel.app/expert-template.html">
```

---

## 4. config.js — DEPLOYMENT_DOMAIN 추가

**파일 위치:** `Process/S5_개발_3차/Frontend/config.js`

```javascript
// 배포 도메인 상수 (도메인 변경 시 이 값만 수정)
const DEPLOYMENT_DOMAIN = 'https://ax-on.vercel.app';

const AXON_CONFIG = {
  DEPLOYMENT_DOMAIN,
  OG_DEFAULT_IMAGE: DEPLOYMENT_DOMAIN + '/images/og-default.png',
  // ...
};
```

JavaScript에서 OG 태그를 동적으로 설정할 때 활용:
```javascript
document.querySelector('meta[property="og:url"]').content
  = AXON_CONFIG.DEPLOYMENT_DOMAIN + '/' + pagePath;
document.querySelector('meta[property="og:image"]').content
  = AXON_CONFIG.OG_DEFAULT_IMAGE;
```

---

## 5. 향후 도메인 변경 시 일괄 수정 방법

### 방법 A: config.js 수정 (JavaScript 동적 관리)

`config.js`의 `DEPLOYMENT_DOMAIN` 값 한 줄만 수정:

```javascript
// 변경 전
const DEPLOYMENT_DOMAIN = 'https://ax-on.vercel.app';

// 변경 후 (예: 커스텀 도메인으로 변경)
const DEPLOYMENT_DOMAIN = 'https://www.ax-on.net';
```

단, 이 방법은 JavaScript로 동적 생성하는 경우에만 적용됨.
정적 HTML의 메타태그는 아래 방법 B로 일괄 수정 필요.

---

### 방법 B: 일괄 텍스트 치환 (정적 HTML)

모든 HTML 파일에서 도메인을 일괄 치환하는 방법:

**VS Code 사용:**
1. `Ctrl+Shift+H` (전체 바꾸기 열기)
2. 검색: `https://ax-on.vercel.app`
3. 변경: `https://새도메인.com`
4. 범위: `Process/S5_개발_3차/Frontend/` 폴더
5. 모두 바꾸기

**sed 명령어 사용 (Windows Git Bash):**
```bash
find "Process/S5_개발_3차/Frontend" -name "*.html" -exec \
  sed -i 's|https://ax-on.vercel.app|https://새도메인.com|g' {} \;
```

---

### 방법 C: 수정 대상 OG 태그 위치 일람

| 파일 | og:image 라인 | og:url 라인 |
|------|-------------|-----------|
| `index.html` | 9 | 12 |
| `startup.html` | 9 | 12 |
| `ax-project.html` | 13 | 14 |
| `expert.html` | 9 | 12 |
| `community.html` | 10 | 12 |
| `enrollment.html` | 9 | 12 |
| `contact.html` | 9 | 12 |
| `expert-template.html` | 9 | 12 |

---

## 6. OG 메타태그 검증 방법

수정 후 소셜 미디어 공유 미리보기 검증:

| 도구 | URL |
|------|-----|
| Facebook Open Graph Debugger | https://developers.facebook.com/tools/debug/ |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ |
| Open Graph Check | https://www.opengraph.xyz/ |

**검증 절차:**
1. 위 도구 중 하나에 접속
2. 수정된 페이지 URL 입력 (예: `https://ax-on.vercel.app/index.html`)
3. og:image, og:url, og:title, og:description 정상 표시 확인

---

## 7. OG 이미지 파일 준비

현재 OG 이미지 경로: `/images/og-default.png`

소셜 미디어 권장 스펙:
- 크기: 1200 x 630 px
- 파일 형식: PNG 또는 JPG
- 최대 파일 크기: 8MB 이하
- 텍스트 포함 비율: 20% 이하 권장

이미지 파일이 실제로 `https://ax-on.vercel.app/images/og-default.png` 경로에
존재하는지 배포 환경에서 반드시 확인할 것.
