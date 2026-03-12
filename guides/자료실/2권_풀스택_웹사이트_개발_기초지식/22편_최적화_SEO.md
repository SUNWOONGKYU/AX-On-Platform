# 22편 | 최적화 - SEO (검색 엔진 최적화)

---

검색 엔진에서 찾기 쉬운 웹사이트를 만드는 기술, **SEO(Search Engine Optimization)**입니다. 구글, 네이버 등에서 검색 순위를 높이는 방법을 다룹니다.

---

## SEO의 핵심

### 검색 엔진이 보는 것

```
[사용자] → 검색어 입력 → [검색 엔진] → 웹사이트 순위 결정
                              ↓
                        - 메타 태그
                        - 콘텐츠 품질
                        - 페이지 속도
                        - 모바일 최적화
```

| 요소 | 설명 | 중요도 |
|-----|------|-------|
| 콘텐츠 | 유용하고 고유한 내용 | 매우 높음 |
| 메타 태그 | 제목, 설명, 키워드 | 높음 |
| 페이지 속도 | 로딩 시간 | 높음 |
| 모바일 대응 | 반응형 디자인 | 높음 |
| HTTPS | 보안 연결 | 중간 |

---

## 22.1 Language (언어)

### HTML (시맨틱 태그)

시맨틱 태그는 의미를 가진 HTML 태그입니다. 검색 엔진이 콘텐츠 구조를 이해하는 데 도움됩니다.

```html
<!-- 나쁜 예: div만 사용 -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="content">...</div>

<!-- 좋은 예: 시맨틱 태그 -->
<header>사이트 헤더</header>
<nav>네비게이션</nav>
<main>
    <article>
        <h1>글 제목</h1>
        <section>본문 섹션</section>
    </article>
</main>
<footer>사이트 푸터</footer>
```

**주요 시맨틱 태그:**

| 태그 | 용도 |
|-----|------|
| `<header>` | 페이지/섹션 헤더 |
| `<nav>` | 네비게이션 |
| `<main>` | 주요 콘텐츠 |
| `<article>` | 독립적인 콘텐츠 |
| `<section>` | 콘텐츠 섹션 |
| `<aside>` | 사이드바 |
| `<footer>` | 페이지/섹션 푸터 |

### 메타 태그

```html
<head>
    <!-- 기본 메타 -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO 메타 -->
    <title>SSALWorks - AI 기반 학습 플랫폼</title>
    <meta name="description" content="AI와 함께 성장하는 학습 플랫폼">
    <meta name="keywords" content="AI, 학습, 교육, 플랫폼">

    <!-- Open Graph (소셜 미디어) -->
    <meta property="og:title" content="SSALWorks">
    <meta property="og:description" content="AI 기반 학습 플랫폼">
    <meta property="og:image" content="https://ssalworks.com/og-image.png">
    <meta property="og:url" content="https://ssalworks.com">

    <!-- 트위터 카드 -->
    <meta name="twitter:card" content="summary_large_image">
</head>
```

---

## 22.2~22.3 Runtime, Package Manager

SEO 영역에서는 별도의 런타임이나 패키지 관리자를 사용하지 않습니다.

---

## 22.4 Tools (도구)

### Lighthouse

Chrome DevTools에 내장된 웹 품질 측정 도구입니다.

**사용법:**
```
1. Chrome DevTools 열기 (F12)
2. Lighthouse 탭 선택
3. "Analyze page load" 클릭
```

**측정 항목:**

| 항목 | 설명 | 목표 점수 |
|-----|------|----------|
| Performance | 로딩 속도 | 90+ |
| Accessibility | 접근성 | 90+ |
| Best Practices | 모범 사례 | 90+ |
| SEO | 검색 최적화 | 90+ |

### PageSpeed Insights

Google의 웹 성능 분석 서비스입니다.

**사용법:**
```
1. https://pagespeed.web.dev/ 접속
2. URL 입력
3. 분석 결과 확인
```

**SSALWorks**: Lighthouse + PageSpeed Insights를 사용합니다.

---

## 22.5 Library (라이브러리)

### next-seo

Next.js용 SEO 라이브러리입니다.

**설치:**
```bash
npm install next-seo
```

**사용법:**

```tsx
// app/layout.tsx
import { DefaultSeo } from 'next-seo';

export default function RootLayout({ children }) {
    return (
        <html>
            <head>
                <DefaultSeo
                    title="SSALWorks"
                    description="AI 기반 학습 플랫폼"
                    openGraph={{
                        type: 'website',
                        locale: 'ko_KR',
                        url: 'https://ssalworks.com',
                        siteName: 'SSALWorks',
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
```

**페이지별 SEO:**

```tsx
// app/about/page.tsx
import { NextSeo } from 'next-seo';

export default function AboutPage() {
    return (
        <>
            <NextSeo
                title="소개 | SSALWorks"
                description="SSALWorks 서비스를 소개합니다"
            />
            <main>...</main>
        </>
    );
}
```

---

## 22.6 Framework (프레임워크)

### Next.js (SEO 기능)

Next.js는 SEO에 최적화된 기능을 제공합니다.

**Metadata API:**

```tsx
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SSALWorks - 홈',
    description: 'AI 기반 학습 플랫폼',
    keywords: ['AI', '학습', '교육'],
    openGraph: {
        title: 'SSALWorks',
        description: 'AI와 함께 성장하는 학습 플랫폼',
        images: ['/og-image.png'],
    },
};

export default function HomePage() {
    return <main>...</main>;
}
```

**동적 메타데이터:**

```tsx
// app/posts/[id]/page.tsx
export async function generateMetadata({ params }) {
    const post = await getPost(params.id);

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            images: [post.thumbnail],
        },
    };
}
```

**sitemap.xml 생성:**

```tsx
// app/sitemap.ts
export default async function sitemap() {
    const posts = await getAllPosts();

    return [
        { url: 'https://ssalworks.com', lastModified: new Date() },
        { url: 'https://ssalworks.com/about', lastModified: new Date() },
        ...posts.map(post => ({
            url: `https://ssalworks.com/posts/${post.id}`,
            lastModified: post.updatedAt,
        })),
    ];
}
```

**SSALWorks**: Next.js Metadata API를 사용합니다.

---

## 22.7 External Service (외부 서비스)

### Google Search Console

Google 검색 성능을 모니터링하는 서비스입니다.

**주요 기능:**
- 검색 노출 현황 확인
- 클릭률(CTR) 분석
- 색인 상태 확인
- 사이트맵 제출

**설정 방법:**
```
1. https://search.google.com/search-console 접속
2. 속성 추가 (도메인 또는 URL)
3. 소유권 확인 (DNS 또는 HTML 태그)
4. sitemap.xml 제출
```

### Naver Search Advisor

네이버 검색 최적화 서비스입니다.

**설정 방법:**
```
1. https://searchadvisor.naver.com 접속
2. 사이트 등록
3. 소유권 확인
4. 사이트맵 제출
```

**SSALWorks**: Google Search Console + Naver Search Advisor를 사용합니다.

---

## SEO 체크리스트

### 기술적 SEO

- [ ] 시맨틱 HTML 태그 사용
- [ ] 메타 태그 (title, description) 설정
- [ ] Open Graph 태그 설정
- [ ] sitemap.xml 생성
- [ ] robots.txt 설정
- [ ] HTTPS 사용
- [ ] 모바일 반응형 디자인

### 콘텐츠 SEO

- [ ] 고유하고 유용한 콘텐츠
- [ ] 적절한 헤딩 구조 (h1 → h2 → h3)
- [ ] 이미지 alt 텍스트
- [ ] 내부 링크 구조
- [ ] 페이지 로딩 속도

---

## 정리

| 기술 스택 | SSALWorks 선택 |
|----------|---------------|
| Language | **HTML (시맨틱 태그)**, 메타 태그 |
| Runtime | - |
| Package Manager | - |
| Tools | **Lighthouse**, **PageSpeed Insights** |
| Library | **next-seo** |
| Framework | **Next.js (Metadata API)** |
| External Service | **Google Search Console**, **Naver Search Advisor** |

SEO는 검색에서 발견되기 위한 필수 기술입니다. 다음 편에서는 모든 사용자를 위한 **웹 접근성**을 알아봅니다.

---

**작성일: 2025-12-21 / 글자수: 약 4,800자 / 작성자: Claude / 프롬프터: 써니**
